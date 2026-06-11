
DROP POLICY "Anyone can submit a booking" ON public.bookings;
CREATE POLICY "Anyone can submit a booking" ON public.bookings FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(name) BETWEEN 1 AND 120
  AND char_length(phone) BETWEEN 4 AND 40
  AND char_length(service) BETWEEN 1 AND 80
  AND (email IS NULL OR char_length(email) <= 200)
  AND (message IS NULL OR char_length(message) <= 2000)
  AND lang IN ('fr','nl','en')
  AND status = 'new'
);
