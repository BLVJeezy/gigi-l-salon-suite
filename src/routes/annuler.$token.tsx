// Public cancellation page — customer clicks the link in the confirmation email.
// Server fns verify the signed token and look up / cancel the booking.
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string().min(10).max(500) });

export const getBookingByCancelToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { verifyCancelToken } = await import("@/lib/email.server");
    const bookingId = await verifyCancelToken(data.token);
    if (!bookingId) return { ok: false as const, reason: "invalid" as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: b, error } = await supabaseAdmin
      .from("bookings")
      .select("id,name,service,booking_date,booking_time,status")
      .eq("id", bookingId)
      .maybeSingle();
    if (error || !b) return { ok: false as const, reason: "not_found" as const };
    return { ok: true as const, booking: b };
  });

export const cancelBookingByToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { verifyCancelToken, sendEmail } = await import("@/lib/email.server");
    const bookingId = await verifyCancelToken(data.token);
    if (!bookingId) throw new Error("Token invalide");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    try {
      if (booking?.email) {
        const { clientBookingCancelledEmail } = await import("@/lib/email-templates.server");
        const t = clientBookingCancelledEmail(booking);
        await sendEmail({ to: booking.email, subject: t.subject, html: t.html });
      }
      const owner = process.env.OWNER_EMAIL;
      if (owner) {
        await sendEmail({
          to: owner,
          subject: `Réservation annulée par le client — ${booking.name}`,
          html: `<p>${booking.name} a annulé sa réservation du ${booking.booking_date} à ${String(booking.booking_time).slice(0,5)} (${booking.service}).</p>`,
        });
      }
    } catch (e) {
      console.error("cancelBookingByToken email error", e);
    }
    return { ok: true };
  });

export const Route = createFileRoute("/annuler/$token")({
  component: CancelPage,
  head: () => ({ meta: [{ title: "Annuler ma réservation — Gigi L Coiffure" }, { name: "robots", content: "noindex" }] }),
  errorComponent: ({ error }) => (
    <Wrap><p className="text-red-300">Erreur : {error.message}</p></Wrap>
  ),
  notFoundComponent: () => <Wrap><p>Page introuvable.</p></Wrap>,
});

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-ink text-ivory flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-carbon border border-gold/30 p-6 sm:p-8">
        <div className="text-[11px] tracking-[0.3em] text-gold uppercase text-center mb-4">Gigi L Coiffure</div>
        {children}
      </div>
    </main>
  );
}

function CancelPage() {
  const { token } = Route.useParams();
  const router = useRouter();
  const fetchBooking = useServerFn(getBookingByCancelToken);
  const cancelFn = useServerFn(cancelBookingByToken);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"ok" | "err" | null>(null);
  const [err, setErr] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["cancel-token", token],
    queryFn: () => fetchBooking({ data: { token } }),
  });

  if (isLoading) return <Wrap><p className="text-ivory/70 text-center">Chargement…</p></Wrap>;
  if (!data?.ok) {
    return (
      <Wrap>
        <h1 className="font-display text-xl text-ivory mb-2 text-center">Lien invalide ou expiré</h1>
        <p className="text-ivory/70 text-sm text-center">
          Ce lien d'annulation n'est plus valide. Contactez-nous au{" "}
          <a href="tel:+32484164905" className="text-gold underline">+32 484 16 49 05</a>.
        </p>
      </Wrap>
    );
  }

  const b = data.booking;
  const dateLabel = new Date(b.booking_date + "T00:00:00").toLocaleDateString("fr-BE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (done === "ok" || b.status === "cancelled") {
    return (
      <Wrap>
        <div className="text-gold text-4xl text-center mb-3">✓</div>
        <h1 className="font-display text-xl text-ivory mb-2 text-center">Réservation annulée</h1>
        <p className="text-ivory/70 text-sm text-center">
          Votre réservation du <strong className="text-ivory">{dateLabel}</strong> a bien été annulée.
        </p>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <h1 className="font-display text-xl text-ivory mb-4 text-center">Annuler votre réservation</h1>
      <div className="bg-ink border border-gold/20 p-4 mb-5 text-sm space-y-1">
        <div><span className="text-ivory/50 text-xs uppercase tracking-wider">Nom</span><div className="text-ivory">{b.name}</div></div>
        <div className="pt-2"><span className="text-ivory/50 text-xs uppercase tracking-wider">Service</span><div className="text-ivory">{b.service}</div></div>
        <div className="pt-2"><span className="text-ivory/50 text-xs uppercase tracking-wider">Date</span><div className="text-ivory">{dateLabel} · {String(b.booking_time).slice(0,5)}</div></div>
      </div>
      <p className="text-ivory/70 text-sm mb-5 text-center">Confirmez l'annulation de cette réservation.</p>
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true); setErr("");
          try {
            await cancelFn({ data: { token } });
            setDone("ok");
            router.invalidate();
          } catch (e) {
            setErr(e instanceof Error ? e.message : "Erreur");
            setDone("err");
          } finally { setBusy(false); }
        }}
        className="btn-gold btn-gold-hover w-full disabled:opacity-40"
      >
        {busy ? "Annulation…" : "Confirmer l'annulation"}
      </button>
      {err && <p className="text-red-400 text-xs mt-3 text-center">{err}</p>}
      <p className="text-center text-ivory/40 text-xs mt-4">
        Ou appelez-nous : <a href="tel:+32484164905" className="text-gold">+32 484 16 49 05</a>
      </p>
    </Wrap>
  );
}
