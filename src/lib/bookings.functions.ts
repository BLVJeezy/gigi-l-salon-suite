// Server function: public booking submission.
// Uses the publishable Supabase client (RLS INSERT policy allows anyone).
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
    const { error } = await supabaseAdmin.from("bookings").insert(payload);
    if (error) {
      console.error("createBooking error", error);
      throw new Error("Could not save booking");
    }
    return { ok: true };
  });
