
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  service text NOT NULL,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  message text,
  lang text NOT NULL DEFAULT 'fr',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','confirmed','cancelled'))
);
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a booking" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
