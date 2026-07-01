## Goal

When a customer picks a date + service in the booking form, disable the time slots that overlap an already-booked appointment (using each service's `duration_min`), so two clients can't be booked into the same window. Free slots remain fully selectable.

## How it works

1. Each service in the `services` table already has `duration_min` (nails/coiffure/microshading all covered).
2. Every existing booking on that date occupies `[booking_time, booking_time + duration_min)`.
3. The candidate slot the customer wants also occupies `[slot, slot + selectedServiceDuration)`.
4. A slot is disabled if its window overlaps any existing booking's window.

## Changes

### 1. New server function — `src/lib/bookings.functions.ts`
Add `getBookedSlotsForDate({ date })` (public, no auth):
- Uses `supabaseAdmin` inside the handler.
- Selects **only** `booking_time` and `service` (no name/email/phone/message → no PII leak) where `booking_date = date` and `status != 'cancelled'`.
- Also fetches `services (name, duration_min)` to resolve each booking's duration; falls back to 60 min if the service name isn't found.
- Returns `[{ time: "HH:MM", durationMin: number }]`.

### 2. `src/components/BookingForm.tsx`
- On entering the "time" step (or when `date`/`service` changes), call `getBookedSlotsForDate({ data: { date } })` and also load `listServices` to look up the currently-selected service's duration.
- Compute a `disabledSlots: Set<string>` by checking overlap between each `TIME_SLOTS[i]` window (using the selected service's duration) and every booked window.
- Render each slot button with `disabled` + a struck-through / greyed style when blocked, and skip `setTime` for disabled ones.
- Show a small note under the grid: "Les créneaux grisés sont déjà réservés" (translated FR/NL/EN via i18n).

### 3. i18n — `src/lib/i18n.tsx`
Add one string per language for the "already booked" hint under the time grid.

## Out of scope (not requested)

- No change to the DB schema or RLS.
- No change to admin, gallery, opening hours, or category management.
- Closing-time cutoff (blocking slots that would run past 19:30) — only overlap with existing bookings is blocked, as you described.
