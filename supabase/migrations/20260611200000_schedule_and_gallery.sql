-- ── Working days table ────────────────────────────────────────────────────
-- Stores which weekdays are open/closed and any specific closed dates.
CREATE TABLE public.working_days (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week  int,          -- 0=Sun,1=Mon,...,6=Sat. NULL = specific date override
  specific_date date,        -- NULL = recurring weekday rule
  is_open      boolean NOT NULL DEFAULT true,
  note         text,         -- e.g. "Vakantie", "Feestdag"
  updated_at   timestamptz NOT NULL DEFAULT now()
);
-- Only service_role (admin server fn) can touch this table
GRANT ALL ON public.working_days TO service_role;
ALTER TABLE public.working_days ENABLE ROW LEVEL SECURITY;

-- Seed default schedule: Thu(4) Fri(5) Sat(6) open, rest closed
INSERT INTO public.working_days (day_of_week, is_open, note) VALUES
  (0, false, ''),  -- Sunday
  (1, false, ''),  -- Monday
  (2, false, ''),  -- Tuesday
  (3, false, ''),  -- Wednesday
  (4, true,  ''),  -- Thursday
  (5, true,  ''),  -- Friday
  (6, true,  '');  -- Saturday

-- ── Gallery table ─────────────────────────────────────────────────────────
CREATE TABLE public.gallery (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  url         text NOT NULL,      -- public URL or relative path
  category    text NOT NULL DEFAULT 'tresses'
              CHECK (category IN ('tresses','tissage','locks','micro','coupes','chignons')),
  caption_fr  text NOT NULL DEFAULT '',
  caption_nl  text NOT NULL DEFAULT '',
  caption_en  text NOT NULL DEFAULT '',
  sort_order  int NOT NULL DEFAULT 0,
  span        int NOT NULL DEFAULT 1 CHECK (span IN (1,2,3)),
  active      boolean NOT NULL DEFAULT true
);
GRANT ALL ON public.gallery TO service_role;
GRANT SELECT ON public.gallery TO anon, authenticated;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active gallery items"
  ON public.gallery FOR SELECT TO anon, authenticated
  USING (active = true);
