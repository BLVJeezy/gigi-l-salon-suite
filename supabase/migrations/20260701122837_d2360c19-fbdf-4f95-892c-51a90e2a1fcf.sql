CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  caption_fr TEXT NOT NULL DEFAULT '',
  caption_nl TEXT NOT NULL DEFAULT '',
  caption_en TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  span INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true
);

GRANT SELECT ON public.gallery TO anon;
GRANT SELECT ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active gallery items"
  ON public.gallery FOR SELECT
  USING (active = true);

CREATE INDEX gallery_category_idx ON public.gallery (category);
CREATE INDEX gallery_sort_idx ON public.gallery (sort_order, created_at DESC);