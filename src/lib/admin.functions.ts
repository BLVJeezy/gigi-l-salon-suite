// Admin server functions — password gate + signed token.
// Cookies are unreliable in the embedded preview (third-party cookie blocking),
// so login returns a signed HMAC token that the client passes to each admin call.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 180; // 180 days

function getSecret() {
  const raw = process.env.SESSION_SECRET ?? "VqZwIgf5YFkKZBQkGAbUZwfJYptfnDasMBNd1W9bA5BUeQ8KSSfMkP2KUiahsnvT";
  return raw.length >= 32 ? raw : raw + "x".repeat(64);
}

async function sign(payload: string) {
  const { createHmac } = await import("node:crypto");
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

async function makeToken() {
  const exp = String(Date.now() + TOKEN_TTL_MS);
  return `${exp}.${await sign(exp)}`;
}

async function verifyToken(token: string | undefined | null) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const expected = createHmac("sha256", getSecret()).update(exp).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function requireAdmin(token: string) {
  if (!(await verifyToken(token))) {
    throw new Error("Unauthorized");
  }
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD ?? "gigil18052002";
    if (data.password !== expected) {
      return { ok: false as const };
    }
    return { ok: true as const, token: await makeToken() };
  });

export const adminCheck = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string().nullable() }).parse(input))
  .handler(async ({ data }) => {
    const authenticated = await verifyToken(data.token);
    return { authenticated, token: authenticated ? await makeToken() : null };
  });

export const listBookings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { bookings: rows ?? [] };
  });

// Generate a short-lived signed URL for a booking photo so admins can view/download it
// even though the bucket is private.
export const getBookingPhotoUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string(), photoUrl: z.string().url() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    // Extract key after "booking-photos/" from the stored public URL.
    const m = data.photoUrl.match(/\/booking-photos\/(.+?)(?:\?|$)/);
    if (!m) throw new Error("Invalid photo URL");
    const key = decodeURIComponent(m[1]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("booking-photos")
      .createSignedUrl(key, 60 * 60); // 1h
    if (error || !signed) throw new Error(error?.message ?? "Sign failed");
    return { url: signed.signedUrl, key };
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string(),
        id: z.string().uuid(),
        status: z.enum(["new", "confirmed", "cancelled", "completed", "no_show"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    // Email client on status change via Lovable queue (best-effort).
    try {
      if (booking?.email) {
        const { enqueueTemplateEmail } = await import("./lovable-email.server");
        if (data.status === "confirmed") {
          const { signCancelToken } = await import("./email.server");
          const token = await signCancelToken(booking.id);
          const origin = process.env.SITE_URL || "https://gigi-l-salon-suite.lovable.app";
          const cancelUrl = `${origin}/annuler/${token}`;
          const res = await enqueueTemplateEmail("client-booking-confirmed", booking.email, { ...booking, cancelUrl });
          console.log("[status] confirmed email", res);
        } else if (data.status === "cancelled") {
          const res = await enqueueTemplateEmail("client-booking-cancelled", booking.email, booking);
          console.log("[status] cancelled email", res);
        } else if (data.status === "completed") {
          const res = await enqueueTemplateEmail("client-review-request", booking.email, booking);
          console.log("[status] review email", res);
        }
      }
    } catch (e) {
      console.error("updateBookingStatus email error", e);
    }
    return { ok: true };
  });

// Sends the 4 booking template emails via the Lovable Notify queue infrastructure
// (enqueued into pgmq, dispatched by /lovable/email/queue/process).
export const sendTestEmails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string(), to: z.string().email() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const React = await import("react");
    const { render } = await import("@react-email/components");
    const { TEMPLATES } = await import("./email-templates/registry");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { signCancelToken } = await import("./email.server");

    const SENDER_DOMAIN = "notify.test-solyn.pw";
    const FROM_DOMAIN = "notify.test-solyn.pw";
    const SITE_NAME = "gigi-l";

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dummyId = crypto.randomUUID();
    const origin = process.env.SITE_URL || "https://gigi-l.lovable.app";
    const cancelToken = await signCancelToken(dummyId);
    const baseBooking = {
      id: dummyId,
      name: "Jason Balongo",
      phone: "+32 484 16 49 05",
      email: data.to,
      service: "Coupe Femme + Brushing",
      booking_date: tomorrow.toISOString().slice(0, 10),
      booking_time: "14:00",
      message: "Voorbeeld bericht — een korte opmerking.",
    };

    const order = [
      "owner-new-booking",
      "client-booking-received",
      "client-booking-confirmed",
      "client-booking-cancelled",
    ];

    let sent = 0;
    for (const name of order) {
      const tpl = TEMPLATES[name];
      if (!tpl) continue;
      const props: Record<string, any> = { ...baseBooking };
      if (name === "client-booking-confirmed") {
        props.cancelUrl = `${origin}/annuler/${cancelToken}`;
      }
      const element = React.createElement(tpl.component, props);
      const html = await render(element);
      const text = await render(element, { plainText: true });
      const subject = typeof tpl.subject === "function" ? tpl.subject(props) : tpl.subject;
      const messageId = crypto.randomUUID();

      await supabaseAdmin.from("email_send_log").insert({
        message_id: messageId,
        template_name: name,
        recipient_email: data.to,
        status: "pending",
      });

      const { error } = await supabaseAdmin.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          message_id: messageId,
          to: data.to,
          from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
          sender_domain: SENDER_DOMAIN,
          subject: `[TEST] ${subject}`,
          html,
          text,
          purpose: "transactional",
          label: name,
          idempotency_key: messageId,
          unsubscribe_token: "test-no-unsubscribe",
          queued_at: new Date().toISOString(),
        },
      });
      if (error) throw new Error(`Enqueue ${name}: ${error.message}`);
      sent++;
    }
    return { ok: true, sent };
  });

// ── Client CRM ──────────────────────────────────────────────────────────────
// Adjust booking date/time and resend confirmation email
export const adjustBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      token: z.string(),
      id: z.string().uuid(),
      booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      booking_time: z.string().regex(/^\d{2}:\d{2}$/),
      send_email: z.boolean().default(true),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update({ booking_date: data.booking_date, booking_time: data.booking_time, status: "confirmed" })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    // Resend confirmation email with new date/time
    if (data.send_email && booking?.email) {
      try {
        const { enqueueTemplateEmail } = await import("./lovable-email.server");
        const { signCancelToken } = await import("./email.server");
        const cancelToken = await signCancelToken(booking.id);
        const origin = process.env.SITE_URL || "https://gigi-l-salon-suite.lovable.app";
        const cancelUrl = `${origin}/annuler/${cancelToken}`;
        await enqueueTemplateEmail("client-booking-confirmed", booking.email, { ...booking, cancelUrl });
      } catch (e) {
        console.error("adjustBooking email error", e);
      }
    }
    return { ok: true, booking };
  });

// Update amount paid for a booking
export const updateAmountPaid = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string(), id: z.string().uuid(), amount_paid_cents: z.number().int().min(0).nullable() }).parse(input)
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    try {
      const { error } = await supabaseAdmin.from("bookings")
        .update({ amount_paid_cents: data.amount_paid_cents })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } catch (e: any) {
      // If column doesn't exist yet, return ok anyway (migration pending)
      if (e.message?.includes("amount_paid_cents")) return { ok: true, pending: true };
      throw e;
    }
    return { ok: true };
  });

// Get all bookings for a specific client (by phone)
export const getClientBookings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string(), phone: z.string() }).parse(input)
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const norm = (data.phone || "").replace(/\s+/g, "").trim();
    // Fetch all bookings with phone so we can filter client-side
    const { data: rows, error } = await supabaseAdmin
      .from("bookings")
      .select("id, phone, booking_date, booking_time, service, status, message, created_at")
      .order("booking_date", { ascending: false });
    if (error) throw new Error(error.message);
    const filtered = (rows ?? []).filter((b: any) =>
      (b.phone || "").replace(/\s+/g, "").trim() === norm
    );
    // Try to fetch amount_paid_cents separately (column may not exist yet)
    let amountMap: Record<string, number | null> = {};
    try {
      const { data: amounts } = await supabaseAdmin
        .from("bookings")
        .select("id, amount_paid_cents")
        .in("id", filtered.map((b: any) => b.id));
      for (const a of amounts ?? []) amountMap[a.id] = a.amount_paid_cents ?? null;
    } catch { /* column doesn't exist yet */ }
    return {
      bookings: filtered.map((b: any) => ({
        ...b,
        amount_paid_cents: amountMap[b.id] ?? null,
      })),
    };
  });

// Admin creates a booking directly (no form needed)
export const createAdminBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      token: z.string(),
      name: z.string().min(1),
      phone: z.string().min(1),
      email: z.string().nullable().optional(),
      service: z.string().min(1),
      booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      booking_time: z.string().regex(/^\d{2}:\d{2}$/),
      message: z.string().nullable().optional(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { token, ...booking } = data;
    const { error } = await supabaseAdmin.from("bookings").insert({
      ...booking,
      status: "confirmed",
      lang: "fr",
      created_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Aggregates unique clients from the bookings table (grouped by phone) and
// joins private admin notes stored in client_notes.

function normalizePhone(p: string) {
  return (p || "").replace(/\s+/g, "").trim();
}

export const listClients = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows, error } = await supabaseAdmin
      .from("bookings")
      .select("name,phone,email,service,booking_date,booking_time,status,created_at")
      .order("booking_date", { ascending: false });
    if (error) throw new Error(error.message);

    type Client = {
      phone: string;
      name: string;
      email: string | null;
      totalBookings: number;
      completedBookings: number;
      cancelledBookings: number;
      noShowBookings: number;
      lastVisit: string | null; // YYYY-MM-DD
      lastService: string | null;
      firstSeen: string | null;
    };
    const map = new Map<string, Client>();
    for (const b of rows ?? []) {
      const key = normalizePhone(b.phone);
      if (!key) continue;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          phone: b.phone,
          name: b.name,
          email: b.email,
          totalBookings: 1,
          completedBookings: b.status === "completed" ? 1 : 0,
          cancelledBookings: b.status === "cancelled" ? 1 : 0,
          noShowBookings: b.status === "no_show" ? 1 : 0,
          lastVisit: b.booking_date,
          lastService: b.service,
          firstSeen: b.created_at,
        });
      } else {
        existing.totalBookings++;
        if (b.status === "completed") existing.completedBookings++;
        if (b.status === "cancelled") existing.cancelledBookings++;
        if (b.status === "no_show") existing.noShowBookings++;
        // Keep the most recent name/email (rows are sorted DESC by booking_date, so first-seen entry is most recent).
        if (!existing.email && b.email) existing.email = b.email;
        if (!existing.lastVisit || b.booking_date > existing.lastVisit) {
          existing.lastVisit = b.booking_date;
          existing.lastService = b.service;
        }
        if (existing.firstSeen && b.created_at < existing.firstSeen) existing.firstSeen = b.created_at;
      }
    }

    const phones = [...map.keys()];
    let notes: Record<string, { note: string; updated_at: string }> = {};
    if (phones.length > 0) {
      const { data: noteRows, error: nErr } = await supabaseAdmin
        .from("client_notes")
        .select("phone,note,updated_at")
        .in("phone", phones);
      if (nErr) throw new Error(nErr.message);
      for (const n of noteRows ?? []) notes[n.phone] = { note: n.note, updated_at: n.updated_at };
    }

    const clients = [...map.values()].map((c) => ({
      ...c,
      note: notes[normalizePhone(c.phone)]?.note ?? "",
      noteUpdatedAt: notes[normalizePhone(c.phone)]?.updated_at ?? null,
    }));
    clients.sort((a, b) => (b.lastVisit ?? "").localeCompare(a.lastVisit ?? ""));
    return { clients };
  });

export const getClientHistory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string(), phone: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const key = normalizePhone(data.phone);
    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: false });
    if (error) throw new Error(error.message);
    const filtered = (bookings ?? []).filter((b) => normalizePhone(b.phone) === key);
    return { bookings: filtered };
  });

export const upsertClientNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string(), phone: z.string().min(1), note: z.string().max(5000) }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const key = normalizePhone(data.phone);
    const { error } = await supabaseAdmin
      .from("client_notes")
      .upsert({ phone: key, note: data.note }, { onConflict: "phone" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
