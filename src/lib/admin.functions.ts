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
        status: z.enum(["new", "confirmed", "cancelled"]),
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
      if (booking?.email && (data.status === "confirmed" || data.status === "cancelled")) {
        const { enqueueTemplateEmail } = await import("./lovable-email.server");
        if (data.status === "confirmed") {
          const { signCancelToken } = await import("./email.server");
          const token = await signCancelToken(booking.id);
          const origin = process.env.SITE_URL || "https://gigi-l-salon-suite.lovable.app";
          const cancelUrl = `${origin}/annuler/${token}`;
          const res = await enqueueTemplateEmail("client-booking-confirmed", booking.email, { ...booking, cancelUrl });
          console.log("[status] confirmed email", res);
        } else {
          const res = await enqueueTemplateEmail("client-booking-cancelled", booking.email, booking);
          console.log("[status] cancelled email", res);
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
