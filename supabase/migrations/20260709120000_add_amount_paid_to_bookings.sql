-- Add amount_paid_cents to bookings for client revenue tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount_paid_cents integer DEFAULT NULL;

COMMENT ON COLUMN bookings.amount_paid_cents IS 'Amount paid by client in euro cents (null = not yet set)';
