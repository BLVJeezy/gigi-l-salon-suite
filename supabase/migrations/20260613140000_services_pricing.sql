-- Service catalogue with duration + price, editable by the owner in admin.
CREATE TABLE public.services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  category    text NOT NULL DEFAULT 'coiffure'
              CHECK (category IN ('coiffure','nails','microshading')),
  name        text NOT NULL,
  duration_min int NOT NULL DEFAULT 60,    -- duration in minutes
  price_cents int,                         -- NULL = "op aanvraag" / on request
  sort_order  int NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true
);
GRANT ALL ON public.services TO service_role;
GRANT SELECT ON public.services TO anon, authenticated;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active services"
  ON public.services FOR SELECT TO anon, authenticated
  USING (active = true);

-- Seed the catalogue
INSERT INTO public.services (category, name, duration_min, price_cents, sort_order) VALUES
  ('coiffure','Tresses africaines',180,NULL,1),
  ('coiffure','Coupes européennes',60,NULL,2),
  ('coiffure','Locks & crochet',120,NULL,3),
  ('coiffure','Tissages',120,NULL,4),
  ('coiffure','Chignons & événements',90,NULL,5),
  ('coiffure','Colorations',120,NULL,6),
  ('coiffure','Perruques & mèches',90,NULL,7),
  ('nails','Pose complète',90,NULL,1),
  ('nails','Retouche',60,NULL,2),
  ('nails','Dépose de gel',30,NULL,3),
  ('nails','Réparation 1 doigt',15,NULL,4),
  ('nails','Pédicure sans tips',60,NULL,5),
  ('nails','Vernis semi-permanent',45,NULL,6),
  ('microshading','Microshading',120,NULL,1),
  ('microshading','Retouche',60,NULL,2);
