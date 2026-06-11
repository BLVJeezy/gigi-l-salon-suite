// Server functions for working days schedule management
// Note: working_days table is not in generated Supabase types yet — using (supabaseAdmin as any)
import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

function getSessionConfig() {
  const raw = process.env.SESSION_SECRET ?? "";
  const password = raw.length >= 32 ? raw : raw + "x".repeat(64);
  return { password, name: "gigil_admin", maxAge: 60 * 60 * 8, cookie: { path: "/", httpOnly: true, sameSite: "lax" as const, secure: true } };
}
async function requireAdmin() {
  const s = await useSession<{ admin?: true }>(getSessionConfig());
  if (!s.data.admin) throw new Error("Unauthorized");
}

export type WorkingDay = {
  id: string;
  day_of_week: number | null;
  specific_date: string | null;
  is_open: boolean;
  note: string | null;
  updated_at: string;
};

export const listSchedule = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as { from: (t: string) => any };
  const { data, error } = await db.from("working_days")
    .select("*")
    .order("day_of_week", { ascending: true, nullsFirst: false })
    .order("specific_date", { ascending: true });
  if (error) throw new Error(error.message);
  return { days: (data ?? []) as WorkingDay[] };
});

export const updateWorkingDay = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), is_open: z.boolean(), note: z.string().max(200).optional() }).parse(input)
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error } = await db.from("working_days")
      .update({ is_open: data.is_open, note: data.note ?? "", updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addClosedDate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ specific_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), note: z.string().max(200).optional() }).parse(input)
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error } = await db.from("working_days")
      .insert({ specific_date: data.specific_date, day_of_week: null, is_open: false, note: data.note ?? "" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeClosedDate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error } = await db.from("working_days")
      .delete()
      .eq("id", data.id)
      .is("day_of_week", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
