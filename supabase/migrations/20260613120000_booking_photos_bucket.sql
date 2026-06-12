-- Public storage bucket for booking reference photos (nail inspiration etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-photos', 'booking-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone may upload (anon) — files are write-only from the public form.
CREATE POLICY "Public can upload booking photos"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'booking-photos');

-- Public read so the owner can view the photo via its URL.
CREATE POLICY "Public can read booking photos"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'booking-photos');
