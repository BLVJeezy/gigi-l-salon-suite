-- Add new coiffure services introduced in the booking form.
INSERT INTO public.services (category, name, duration_min, price_cents, sort_order) VALUES
  ('coiffure','Tresses enfants',120,NULL,0),
  ('coiffure','Ponytail',60,NULL,7)
ON CONFLICT DO NOTHING;