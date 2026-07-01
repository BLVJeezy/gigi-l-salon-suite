// Server functions for gallery management — token-auth via admin token.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 180;
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
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
async function requireAdmin(token: string) {
  if (!(await verifyToken(token))) throw new Error("Unauthorized");
}
// keep TTL used indirectly via admin token
void TOKEN_TTL_MS;

export type GalleryItem = {
  id: string; created_at: string; url: string; category: string;
  caption_fr: string; caption_nl: string; caption_en: string;
  sort_order: number; span: number; active: boolean;
};

export const CATEGORIES = [
  "tresses", "tissage", "locks", "micro", "nails", "coupes", "chignons", "perruques",
] as const;

// Category is a free-form string so admins can add/rename/delete categories at runtime.
// Empty string = "uncategorized" (used when a category the item pointed to was deleted).
const categoryEnum = z.string().max(50);

export type GalleryCategory = {
  key: string; label_fr: string; label_nl: string; label_en: string; sort_order: number;
};

const ALLOWED_MIME = [
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/heic", "image/heif", "image/gif", "image/avif",
];

// Public: list active items for the /galerie page (no auth).
export const listPublicGallery = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as { from: (t: string) => any };
  const { data, error } = await db.from("gallery")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as GalleryItem[] };
});

// Admin: list all items.
export const listGallery = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { data: rows, error } = await db.from("gallery")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { items: (rows ?? []) as GalleryItem[] };
  });

// Upload a photo (base64 data URL) to the gallery bucket and return public URL.
export const uploadGalleryPhoto = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({
    token: z.string(),
    dataUrl: z.string().startsWith("data:").max(12_000_000),
  }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const match = data.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image data");
    const mime = match[1].toLowerCase();
    if (!ALLOWED_MIME.includes(mime)) throw new Error("Unsupported image type");
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.byteLength > 8_000_000) throw new Error("Image too large (max 8MB)");
    const ext = mime.split("/")[1].replace("jpeg", "jpg");
    const key = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage.from("gallery").upload(key, buffer, {
      contentType: mime, upsert: false,
    });
    if (error) throw new Error(error.message);
    // Long-lived signed URL (10 years) so the private bucket stays private but
    // the public site can still render the image without a per-request round trip.
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("gallery")
      .createSignedUrl(key, 60 * 60 * 24 * 365 * 10);
    if (signErr || !signed) throw new Error(signErr?.message ?? "Signing failed");
    return { url: signed.signedUrl };
  });

const addSchema = z.object({
  token: z.string(),
  url: z.string().url().max(500),
  category: categoryEnum,
  caption_fr: z.string().max(200).default(""),
  caption_nl: z.string().max(200).default(""),
  caption_en: z.string().max(200).default(""),
  span: z.number().int().min(1).max(3).default(1),
  sort_order: z.number().int().default(0),
});

export const addGalleryItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => addSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { token: _t, ...row } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error, data: inserted } = await db.from("gallery").insert({ ...row, active: true }).select("*").single();
    if (error) throw new Error(error.message);
    return { item: inserted as GalleryItem };
  });

export const updateGalleryItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({
    token: z.string(),
    id: z.string().uuid(),
    category: categoryEnum.optional(),
    caption_fr: z.string().max(200).optional(),
    caption_nl: z.string().max(200).optional(),
    caption_en: z.string().max(200).optional(),
    span: z.number().int().min(1).max(3).optional(),
    sort_order: z.number().int().optional(),
    active: z.boolean().optional(),
  }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { token: _t, id, ...rest } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error } = await db.from("gallery").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteGalleryItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string(), id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    // Try to delete the storage object too (best effort).
    const { data: row } = await db.from("gallery").select("url").eq("id", data.id).maybeSingle();
    if (row?.url) {
      const m = String(row.url).match(/\/gallery\/(.+?)(?:\?|$)/);
      if (m) {
        try { await supabaseAdmin.storage.from("gallery").remove([decodeURIComponent(m[1])]); } catch { /* ignore */ }
      }
    }
    const { error } = await db.from("gallery").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── Category management ───────────────────────────────────────────────────
export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const db = supabaseAdmin as unknown as { from: (t: string) => any };
  const { data, error } = await db.from("gallery_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("key", { ascending: true });
  if (error) throw new Error(error.message);
  return { categories: (data ?? []) as GalleryCategory[] };
});

const catKeySchema = z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/, "Utilise lettres minuscules, chiffres, - ou _");

export const addCategory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({
    token: z.string(),
    key: catKeySchema,
    label_fr: z.string().max(100).default(""),
    label_nl: z.string().max(100).default(""),
    label_en: z.string().max(100).default(""),
    sort_order: z.number().int().default(999),
  }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { token: _t, ...row } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { data: inserted, error } = await db.from("gallery_categories").insert(row).select("*").single();
    if (error) throw new Error(error.message);
    return { category: inserted as GalleryCategory };
  });

export const updateCategory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({
    token: z.string(),
    key: catKeySchema,
    label_fr: z.string().max(100).optional(),
    label_nl: z.string().max(100).optional(),
    label_en: z.string().max(100).optional(),
    sort_order: z.number().int().optional(),
  }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { token: _t, key, ...rest } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    const { error } = await db.from("gallery_categories").update(rest).eq("key", key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Deletes the category row. Photos in that category are kept — their
// `category` column is set to '' so they appear as "uncategorized".
export const deleteCategory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string(), key: catKeySchema }).parse(input))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as { from: (t: string) => any };
    // Orphan photos: keep the row, just clear the category.
    const { error: upErr } = await db.from("gallery").update({ category: "" }).eq("category", data.key);
    if (upErr) throw new Error(upErr.message);
    const { error } = await db.from("gallery_categories").delete().eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

