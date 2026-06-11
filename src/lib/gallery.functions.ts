// Server functions for gallery management
// Note: gallery table is not in generated Supabase types yet — using (supabaseAdmin as any)
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

export type GalleryItem = {
  id: string; created_at: string; url: string; category: string;
  caption_fr: string; caption_nl: string; caption_en: string;
  sort_order: number; span: number; active: boolean;
};

export const listGallery = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as { from: (t: string) => any };
  const { data, error } = await db.from("gallery")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as GalleryItem[] };
});

const gallerySchema = z.object({
  url: z.string().url().max(500),
  category: z.enum(["tresses", "tissage", "locks", "micro", "coupes", "chignons"]),
  caption_fr: z.string().max(200).default(""),
  caption_nl: z.string().max(200).default(""),
  caption_en: z.string().max(200).default(""),
  span: z.number().int().min(1).max(3).default(1),
  sort_order: z.number().int().default(0),
});

export const addGalleryItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => gallerySchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error } = await db.from("gallery").insert({ ...data, active: true });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateGalleryItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).merge(gallerySchema.partial()).parse(input)
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { id, ...rest } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error } = await db.from("gallery").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteGalleryItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error } = await db.from("gallery").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleGalleryActive = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), active: z.boolean() }).parse(input)
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error } = await db.from("gallery").update({ active: data.active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
