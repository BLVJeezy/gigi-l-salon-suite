-- Standalone client profiles (for clients created directly in admin without a booking)
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL UNIQUE,
  name text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: only service role can access
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON clients FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE clients IS 'Standalone client profiles created in admin (not requiring a booking)';
