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

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email ? data.email : null,
      service: data.service,
      booking_date: data.booking_date,
      booking_time: data.booking_time.length === 5 ? `${data.booking_time}:00` : data.booking_time,
      message: data.message ? data.message : null,
      lang: data.lang,
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

    // Fire-and-forget emails — don't fail the booking if email errors.
    try {
      const { sendEmail } = await import("./email.server");
      const { ownerNewBookingEmail, clientBookingReceivedEmail } = await import("./email-templates.server");
      const owner = process.env.OWNER_EMAIL || "jasonbalongo@gmail.com";
      const tasks: Promise<unknown>[] = [];
      const ot = ownerNewBookingEmail(inserted);
      tasks.push(sendEmail({ to: owner, subject: ot.subject, html: ot.html, replyTo: inserted.email ?? undefined }));
      if (inserted.email) {
        const ct = clientBookingReceivedEmail(inserted);
        tasks.push(sendEmail({ to: inserted.email, subject: ct.subject, html: ct.html }));
      }
      const results = await Promise.allSettled(tasks);
      results.forEach((r, i) => {
        if (r.status === "rejected") console.error(`[booking email ${i}] failed`, r.reason);
        else console.log(`[booking email ${i}]`, r.value);
      });
    } catch (e) {
      console.error("createBooking email error", e);
    }

    return { ok: true };
  });
