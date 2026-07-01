CREATE POLICY "Public read access to gallery bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');