// Admin server functions — password gate + session cookie.
// Session is an encrypted httpOnly cookie via TanStack's `useSession`.
import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

const SESSION_NAME = "gigil_admin";

function getSessionConfig() {
  const raw = process.env.SESSION_SECRET ?? "";
  // useSession requires a 32+ char password. Pad fallback for dev safety.
  const password = raw.length >= 32 ? raw : raw + "x".repeat(64);
  return {
    password,
    name: SESSION_NAME,
    maxAge: 60 * 60 * 8,
    cookie: {
      path: "/",
      httpOnly: true,
      sameSite: "lax" as const,
      secure: true,
    },
  };
}

type SessionData = { admin?: true };

async function getSession() {
  return useSession<SessionData>(getSessionConfig());
}

async function requireAdmin() {
  const s = await getSession();
  if (!s.data.admin) {
    throw new Error("Unauthorized");
  }
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      console.error("ADMIN_PASSWORD not configured");
      return { ok: false as const };
    }
    if (data.password !== expected) {
      return { ok: false as const };
    }
    const s = await getSession();
    await s.update({ admin: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const s = await getSession();
  await s.clear();
  return { ok: true };
});

export const adminCheck = createServerFn({ method: "GET" }).handler(async () => {
  const s = await getSession();
  return { authenticated: !!s.data.admin };
});

export const listBookings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return { bookings: data ?? [] };
});

export const updateBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(["new", "confirmed", "cancelled"]) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("bookings").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
