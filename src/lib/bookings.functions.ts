// Server function: public booking submission.
// Inserts the booking, then sends owner + client emails (best-effort).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(4).max(40),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  service: z.string().trim().min(1).max(80),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  booking_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  lang: z.enum(["fr", "nl", "en"]).default("fr"),
});

const availabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/**
 * Returns non-PII booking windows for a date + service duration map,
 * so the client can grey out overlapping time slots.
 */
export const getDateAvailability = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => availabilitySchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { SERVICE_ALIASES, canonicalServiceName } = await import("./service-aliases");
    const [bookingsRes, servicesRes] = await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select("booking_time, service, duration_min")
        .eq("booking_date", data.date)
        .neq("status", "cancelled"),
      supabaseAdmin.from("services").select("name, duration_min"),
    ]);
    // Canonical (French) name → duration.
    const canonicalDur: Record<string, number> = {};
    for (const s of servicesRes.data ?? []) canonicalDur[s.name] = s.duration_min ?? 60;
    // Expand to every localized alias so the client can look up by the label it shows.
    const durations: Record<string, number> = {};
    for (const [alias, canonical] of Object.entries(SERVICE_ALIASES)) {
      if (canonicalDur[canonical] != null) durations[alias] = canonicalDur[canonical];
    }
    const booked = (bookingsRes.data ?? []).map((b) => ({
      time: String(b.booking_time).slice(0, 5),
      durationMin:
        b.duration_min ?? canonicalDur[canonicalServiceName(b.service)] ?? 60,
    }));
    return { booked, durations };
  });

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { canonicalServiceName } = await import("./service-aliases");
    // Look up duration for the chosen service (via alias → canonical French name).
    const { data: svc } = await supabaseAdmin
      .from("services")
      .select("duration_min")
      .eq("name", canonicalServiceName(data.service))
      .maybeSingle();
    const duration_min = svc?.duration_min ?? 60;
    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email ? data.email : null,
      service: data.service,
      booking_date: data.booking_date,
      booking_time: data.booking_time.length === 5 ? `${data.booking_time}:00` : data.booking_time,
      message: data.message ? data.message : null,
      lang: data.lang,
      duration_min,
      status: "new" as const,
    };
    const { data: inserted, error } = await supabaseAdmin
      .from("bookings")
      .insert(payload)
      .select("*")
      .single();
    if (error || !inserted) {
      console.error("createBooking error", error);
      throw new Error("Could not save booking");
    }

    // Fire-and-forget emails via Lovable's queue (no Resend key needed).
    try {
      const { enqueueTemplateEmail } = await import("./lovable-email.server");
      const owner = process.env.OWNER_EMAIL || "jasonbalongo@gmail.com";

      // Owner notification — always.
      const ownerRes = await enqueueTemplateEmail("owner-new-booking", owner, inserted);
      console.log("[booking] owner email", ownerRes);

      // Client acknowledgement — only if they left an email.
      if (inserted.email) {
        const clientRes = await enqueueTemplateEmail("client-booking-received", inserted.email, inserted);
        console.log("[booking] client email", clientRes);
      }
    } catch (e) {
      console.error("createBooking email error", e);
    }

    return { ok: true };
  });
