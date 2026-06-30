// Server function: upload a booking reference photo to Supabase Storage.
// Accepts a base64 data URL, returns a public URL. No auth required (public form).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  // data URL: "data:image/jpeg;base64,...."
  dataUrl: z.string().startsWith("data:").max(8_000_000), // ~6MB after base64 overhead
  filename: z.string().max(120).optional(),
});

const ALLOWED = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/avif",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
];

export const uploadBookingPhoto = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const match = data.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image data");
    const mime = match[1].toLowerCase();
    if (!ALLOWED.includes(mime)) throw new Error("Unsupported image type");

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.byteLength > 6_000_000) throw new Error("Image too large (max 6MB)");

    const ext = mime.split("/")[1].replace("jpeg", "jpg");
    const key = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from("booking-photos")
      .upload(key, buffer, { contentType: mime, upsert: false });
    if (error) {
      console.error("uploadBookingPhoto error", error);
      throw new Error("Upload failed");
    }

    const { data: pub } = supabaseAdmin.storage.from("booking-photos").getPublicUrl(key);
    return { url: pub.publicUrl };
  });
