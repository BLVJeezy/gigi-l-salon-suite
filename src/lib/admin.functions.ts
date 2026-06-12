// Admin server functions — password gate + signed token.
// Cookies are unreliable in the embedded preview (third-party cookie blocking),
// so login returns a signed HMAC token that the client passes to each admin call.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8; // 8h

function getSecret() {
  const raw = process.env.SESSION_SECRET ?? "";
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
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      console.error("ADMIN_PASSWORD not configured");
      return { ok: false as const };
    }
    if (data.password !== expected) {
      return { ok: false as const };
    }
    return { ok: true as const, token: await makeToken() };
  });

export const adminCheck = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string().nullable() }).parse(input))
  .handler(async ({ data }) => {
    return { authenticated: await verifyToken(data.token) };
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

    // Email client on status change (best-effort).
    try {
      if (booking?.email && (data.status === "confirmed" || data.status === "cancelled")) {
        const { sendEmail, signCancelToken } = await import("./email.server");
        const { clientBookingConfirmedEmail, clientBookingCancelledEmail } = await import("./email-templates.server");
        if (data.status === "confirmed") {
          const token = await signCancelToken(booking.id);
          const origin = process.env.SITE_URL || "https://gigi-l-salon-suite.lovable.app";
          const cancelUrl = `${origin}/annuler/${token}`;
          const t = clientBookingConfirmedEmail(booking, cancelUrl);
          await sendEmail({ to: booking.email, subject: t.subject, html: t.html });
        } else {
          const t = clientBookingCancelledEmail(booking);
          await sendEmail({ to: booking.email, subject: t.subject, html: t.html });
        }
      }
    } catch (e) {
      console.error("updateBookingStatus email error", e);
    }
    return { ok: true };
  });

export const sendTestEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string(), to: z.string().email() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { sendEmail } = await import("./email.server");
    const res = await sendEmail({
      to: data.to,
      subject: "Test — Gigi L Coiffure email werkt ✓",
      html: `<div style="font-family:Arial,sans-serif;padding:24px;background:#0F0F10;color:#F5F1E8">
        <h2 style="color:#C9A961;font-family:Georgia,serif">Test geslaagd</h2>
        <p>Als je dit ziet, verstuurt Resend correct vanuit je admin.</p>
        <p style="color:#a8a39a;font-size:12px">Verzonden: ${new Date().toLocaleString("fr-BE")}</p>
      </div>`,
    });
    if (!res.ok) throw new Error(res.error || "Verzenden mislukt");
    return { ok: true };
  });

export const sendExampleEmails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string(), to: z.string().email() }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { sendEmail, signCancelToken } = await import("./email.server");
    const { ownerNewBookingEmail, clientBookingReceivedEmail, clientBookingConfirmedEmail, clientBookingCancelledEmail } = await import("./email-templates.server");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dummy = {
      id: crypto.randomUUID(),
      name: "Jason Balongo",
      phone: "+32 484 16 49 05",
      email: data.to,
      service: "Coupe Femme + Brushing",
      booking_date: tomorrow.toISOString().slice(0, 10),
      booking_time: "14:00:00",
      message: "Voorbeeld bericht — een korte opmerking.",
    };

    const origin = process.env.SITE_URL || "https://gigi-l-salon-suite.lovable.app";
    const cancelToken = await signCancelToken(dummy.id);
    const cancelUrl = `${origin}/annuler/${cancelToken}`;

    const templates = [
      { name: "1. Nouvelle réservation (owner)", fn: () => ownerNewBookingEmail(dummy) },
      { name: "2. Réservation reçue (client)", fn: () => clientBookingReceivedEmail(dummy) },
      { name: "3. Réservation confirmée (client)", fn: () => clientBookingConfirmedEmail(dummy, cancelUrl) },
      { name: "4. Réservation annulée (client)", fn: () => clientBookingCancelledEmail(dummy) },
    ];

    const results: { name: string; ok: boolean; error?: string }[] = [];
    for (const t of templates) {
      try {
        const mail = t.fn();
        const res = await sendEmail({ to: data.to, subject: `[VOORBEELD] ${mail.subject}`, html: mail.html });
        results.push({ name: t.name, ok: res.ok, error: res.error });
      } catch (e) {
        results.push({ name: t.name, ok: false, error: String(e) });
      }
    }

    const failed = results.filter(r => !r.ok);
    if (failed.length > 0) {
      throw new Error(`Mislukt: ${failed.map(f => f.name).join(", ")}`);
    }
    return { ok: true, sent: results.length };
  });
