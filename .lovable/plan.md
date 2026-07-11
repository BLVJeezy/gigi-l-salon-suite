## Problem

Booking emails have been failing since the switch to direct Resend API calls. `email_send_log` shows every send from 2026-07-10 onward returning:

```
401 { "name":"validation_error", "message":"API key is invalid" }
```

Cause: `RESEND_API_KEY` in this project is a **connector-managed key** (visible in the secrets list as "managed by connector"). It is a credential for the Lovable connector gateway, not a real Resend API key. Posting it as `Authorization: Bearer` to `api.resend.com` is rejected as invalid.

My earlier manual test sends worked because they went through `connector-gateway.lovable.dev/resend/emails` with the correct two-header scheme. The booking form's server function does not.

## Fix

Change `src/lib/lovable-email.server.ts` to send via the Lovable Resend connector gateway. Everything else (templates, from/reply_to, logging to `email_send_log`) stays the same.

### Change in `enqueueTemplateEmail`

Replace the direct-Resend fetch with a gateway call:

- URL: `https://connector-gateway.lovable.dev/resend/emails`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer ${process.env.LOVABLE_API_KEY}`
  - `X-Connection-Api-Key: ${process.env.RESEND_API_KEY}`
- Body: unchanged (`from: "Gigi L Coiffure <Info@gigilcoiffure.be>"`, `to`, `reply_to: "lahlamoussa18@gmail.com"`, `subject`, `html`, `text`)
- Pre-flight check: require both `LOVABLE_API_KEY` and `RESEND_API_KEY`; log and return `{ ok: false, error }` if either is missing (same shape as today).
- Response handling and `email_send_log` insert (sent vs failed with truncated error body) remain identical.

### What is not changing

- `src/lib/bookings.functions.ts` — no changes; still calls `enqueueTemplateEmail("owner-new-booking", …)` and `enqueueTemplateEmail("client-booking-received", …)`.
- React Email templates and registry — untouched.
- `from` address stays `Info@gigilcoiffure.be`; `reply_to` stays `lahlamoussa18@gmail.com`.
- No DB migrations, no changes to the queue routes.

## Verification

1. After the edit, trigger a booking (or invoke the server function) with a client email.
2. Query `email_send_log` for the two new rows — both should be `status = 'sent'` with a provider id in `metadata`.
3. Confirm the owner email arrives at `OWNER_EMAIL` and the client email at the submitted address, both from `Info@gigilcoiffure.be` with reply-to `lahlamoussa18@gmail.com`.
