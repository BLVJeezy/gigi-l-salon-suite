// NOTE: Email sending now goes through Lovable's queue (see lovable-email.server.ts).
// This Resend path is deprecated and kept only as a no-op so any stray import
// doesn't crash. RESEND_API_KEY is no longer required.
export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail(_input: SendEmailInput) {
  console.warn("[email] sendEmail() is deprecated — use enqueueTemplateEmail() (Lovable queue)");
  return { ok: false, error: "Deprecated: use Lovable queue" };
}

// HMAC-signed cancel tokens (no DB table needed).
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const raw = process.env.SESSION_SECRET ?? "";
  return raw.length >= 32 ? raw : raw + "x".repeat(64);
}

export async function signCancelToken(bookingId: string) {
  const { createHmac } = await import("node:crypto");
  const exp = String(Date.now() + TOKEN_TTL_MS);
  const payload = `${bookingId}.${exp}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${bookingId}.${exp}.${sig}`;
}

export async function verifyCancelToken(token: string): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [bookingId, exp, sig] = parts;
  if (!bookingId || !exp || !sig) return null;
  if (Number(exp) < Date.now()) return null;
  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const expected = createHmac("sha256", getSecret()).update(`${bookingId}.${exp}`).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return bookingId;
}
