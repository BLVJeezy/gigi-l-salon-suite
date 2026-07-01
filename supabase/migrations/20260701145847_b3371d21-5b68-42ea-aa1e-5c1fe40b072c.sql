
CREATE TABLE public.gallery_categories (
  key text PRIMARY KEY,
  label_fr text NOT NULL DEFAULT '',
  label_nl text NOT NULL DEFAULT '',
  label_en text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gallery_categories TO anon, authenticated;
GRANT ALL ON public.gallery_categories TO service_role;

ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view categories"
  ON public.gallery_categories FOR SELECT
  USING (true);

INSERT INTO public.gallery_categories (key, label_fr, label_nl, label_en, sort_order) VALUES
  ('tresses',   'Nattes / Tresses', 'Vlechten',        'Braids',         10),
  ('tissage',   'Tissage',          'Weave',           'Weave',          20),
  ('locks',     'Locks & crochet',  'Locks & crochet', 'Locks & crochet',30),
  ('micro',     'Microshading',     'Microshading',    'Microshading',   40),
  ('nails',     'Nails',            'Nagels',          'Nails',          50),
  ('coupes',    'Coupes',           'Knippen',         'Cuts',           60),
  ('chignons',  'Chignons',         'Opsteek',         'Updos',          70),
  ('perruques', 'Perruques',        'Pruiken',         'Wigs',           80)
ON CONFLICT (key) DO NOTHING;
