// Server functions for the service catalogue (duration + price), admin-managed.
// Uses signed admin token like the rest of admin.functions.ts.
// services table is not in generated Supabase types yet — using (supabaseAdmin as any).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

// Public endpoint — no auth needed. Returns name, category, price_cents only.
export const listPublicServices = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { data: rows, error } = await db.from("services")
      .select("category, name, price_cents, sort_order")
      .eq("active", true)
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return { services: (rows ?? []) as { category: string; name: string; price_cents: number | null; sort_order: number }[] };
  });

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

// Canonical service list — mirrors the booking form exactly.
const SEED: { category: "coiffure" | "nails" | "microshading"; name: string; duration_min: number; sort_order: number }[] = [
  { category: "coiffure", name: "Tresses enfants", duration_min: 120, sort_order: 0 },
  { category: "coiffure", name: "Tresses africaines", duration_min: 180, sort_order: 1 },
  { category: "coiffure", name: "Coupes européennes", duration_min: 60, sort_order: 2 },
  { category: "coiffure", name: "Locks & crochet", duration_min: 120, sort_order: 3 },
  { category: "coiffure", name: "Tissages", duration_min: 120, sort_order: 4 },
  { category: "coiffure", name: "Chignons & événements", duration_min: 90, sort_order: 5 },
  { category: "coiffure", name: "Colorations", duration_min: 120, sort_order: 6 },
  { category: "coiffure", name: "Ponytail", duration_min: 60, sort_order: 7 },
  { category: "coiffure", name: "Perruques & mèches", duration_min: 90, sort_order: 8 },
  { category: "nails", name: "Pose complète", duration_min: 90, sort_order: 1 },
  { category: "nails", name: "Retouche", duration_min: 60, sort_order: 2 },
  { category: "nails", name: "Dépose de gel", duration_min: 30, sort_order: 3 },
  { category: "nails", name: "Réparation 1 doigt", duration_min: 15, sort_order: 4 },
  { category: "nails", name: "Pédicure sans tips", duration_min: 60, sort_order: 5 },
  { category: "nails", name: "Vernis semi-permanent", duration_min: 45, sort_order: 6 },
  { category: "microshading", name: "Microshading", duration_min: 120, sort_order: 1 },
  { category: "microshading", name: "Retouche", duration_min: 60, sort_order: 2 },
];

// Idempotent: inserts any canonical service that's missing (matched by category+name).
// Leaves existing rows (and their prices/durations) untouched.
export const seedServices = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { data: existing, error } = await db.from("services").select("category,name");
    if (error) throw new Error(error.message);
    const have = new Set((existing ?? []).map((r: { category: string; name: string }) => `${r.category}|${r.name}`));
    const missing = SEED.filter((s) => !have.has(`${s.category}|${s.name}`))
      .map((s) => ({ ...s, price_cents: null, active: true }));
    if (missing.length) {
      const { error: insErr } = await db.from("services").insert(missing);
      if (insErr) throw new Error(insErr.message);
    }
    return { ok: true, added: missing.length };
  });
