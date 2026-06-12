// Server functions for the service catalogue (duration + price), admin-managed.
// Uses signed admin token like the rest of admin.functions.ts.
// services table is not in generated Supabase types yet — using (supabaseAdmin as any).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;
function getSecret() {
  const raw = process.env.SESSION_SECRET ?? "";
  return raw.length >= 32 ? raw : raw + "x".repeat(64);
}
async function verifyToken(token: string | undefined | null) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const expected = createHmac("sha256", getSecret()).update(exp).digest("hex");
  const a = Buffer.from(sig); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
async function requireAdmin(token: string) {
  if (!(await verifyToken(token))) throw new Error("Unauthorized");
}

export type ServiceItem = {
  id: string;
  category: "coiffure" | "nails" | "microshading";
  name: string;
  duration_min: number;
  price_cents: number | null;
  sort_order: number;
  active: boolean;
};

export const listServices = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { data: rows, error } = await db.from("services")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return { services: (rows ?? []) as ServiceItem[] };
  });

export const updateService = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      token: z.string(),
      id: z.string().uuid(),
      duration_min: z.number().int().min(0).max(1440).optional(),
      price_cents: z.number().int().min(0).max(1_000_000).nullable().optional(),
      name: z.string().min(1).max(120).optional(),
      active: z.boolean().optional(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { token, id, ...rest } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error } = await db.from("services").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addService = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      token: z.string(),
      category: z.enum(["coiffure", "nails", "microshading"]),
      name: z.string().min(1).max(120),
      duration_min: z.number().int().min(0).max(1440).default(60),
      price_cents: z.number().int().min(0).max(1_000_000).nullable().default(null),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { token, ...rest } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error } = await db.from("services").insert({ ...rest, active: true, sort_order: 99 });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteService = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string(), id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error } = await db.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
