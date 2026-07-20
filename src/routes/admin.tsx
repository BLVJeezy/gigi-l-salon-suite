// Admin dashboard — password-gated via signed token persisted for installed app use.
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  adminLogin, adminCheck, listBookings, updateBookingStatus, getBookingPhotoUrl,
  listClients, upsertClientNote, getClientHistory, sendTestEmails,
  updateAmountPaid, getClientBookings, createAdminBooking, adjustBooking, createClient,
} from "@/lib/admin.functions";
import {
  listServices, updateService, addService, deleteService, seedServices, type ServiceItem,
} from "@/lib/services.functions";
import {
  listGallery, uploadGalleryPhoto, addGalleryItem, updateGalleryItem, deleteGalleryItem,
  listCategories, addCategory, updateCategory, deleteCategory,
  type GalleryItem, type GalleryCategory,
} from "@/lib/gallery.functions";
import { LangProvider, useT } from "@/lib/i18n";

const TOKEN_KEY = "gigil_admin_token";
const LEGACY_TOKEN_KEY = "gigil_admin_token_session";
const storageAreas = () => {
  if (typeof window === "undefined") return [];
  const areas: Storage[] = [];
  try { areas.push(window.localStorage); } catch { /* unavailable */ }
  try { areas.push(window.sessionStorage); } catch { /* unavailable */ }
  return areas;
};
const getToken = () => {
  if (typeof window === "undefined") return null;
  for (const storage of storageAreas()) {
    try {
      const token = storage.getItem(TOKEN_KEY) ?? storage.getItem(LEGACY_TOKEN_KEY);
      if (token) return token;
    } catch { /* storage can be unavailable in some mobile privacy modes */ }
  }
  return null;
};
const setToken = (t: string) => {
  for (const storage of storageAreas()) {
    try { storage.setItem(TOKEN_KEY, t); } catch { /* ignore */ }
  }
};
const clearToken = () => {
  for (const storage of storageAreas()) {
    try {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(LEGACY_TOKEN_KEY);
    } catch { /* ignore */ }
  }
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "GIGI L Admin" },
      { name: "robots", content: "noindex,nofollow" },
      { name: "apple-mobile-web-app-title", content: "GIGI L Admin" },
      { name: "application-name", content: "GIGI L Admin" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "manifest", href: "/manifest-admin.webmanifest" },
    ],
  }),
  component: () => (
    <LangProvider forceLang="fr">
      <AdminPage />
    </LangProvider>
  ),
});

type Booking = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  booking_date: string;
  booking_time: string;
  duration_min: number | null;
  message: string | null;
  lang: string;
  status: "new" | "confirmed" | "cancelled" | "completed" | "no_show";
  amount_paid_cents: number | null;
};

// Effective duration: prefer the value stored with the booking; fall back to
// a per-category estimate so historic rows without duration_min still render.
function effectiveDuration(b: Booking) {
  if (b.duration_min && b.duration_min > 0) return b.duration_min;
  const cat = categoryOf(b.service);
  return cat === "microshading" ? 120 : cat === "nails" ? 90 : 60;
}

// "09:00 → 12:00" style range shown in the admin so the owner sees exactly
// which slot the appointment occupies.
function timeRange(b: Booking) {
  const [hh, mm] = b.booking_time.slice(0, 5).split(":").map(Number);
  const startMin = hh * 60 + mm;
  const endMin = startMin + effectiveDuration(b);
  const fmt = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  return `${fmt(startMin)} → ${fmt(endMin)}`;
}

// ── Category classification + colours ───────────────────────────────────────
// Bookings only store the service name, so we classify it back into a category.
type Cat = "coiffure" | "nails" | "microshading";

const NAILS_SERVICES = new Set([
  "Pose complète", "Dépose de gel", "Réparation 1 doigt",
  "Pédicure sans tips", "Vernis semi-permanent",
  "Volledige set", "Bijwerking", "Gel verwijderen", "Reparatie 1 nagel",
  "Pedicure zonder tips", "Semi-permanente lak",
  "Full set", "Gel removal", "Repair 1 nail", "Pedicure without tips", "Semi-permanent polish",
]);

function categoryOf(service: string): Cat {
  const s = (service || "").trim().toLowerCase();
  if (s.includes("microshading")) return "microshading";
  if (NAILS_SERVICES.has(service.trim()) || s.includes("nail") || s.includes("ongle") || s.includes("nagel") || s.includes("pédicure") || s.includes("pedicure") || s.includes("vernis") || s.includes("gel")) return "nails";
  return "coiffure";
}

// Tone per category. Coiffure = clean white, Nails = light pink, Microshading = chocolate.
const CAT_STYLE: Record<Cat, { card: string; header: string; chip: string; dot: string; cell: string }> = {
  coiffure:     { card: "bg-white border-border",            header: "bg-sand/40",         chip: "bg-white border border-border text-ink",      dot: "bg-smoke/40",   cell: "bg-white border-border" },
  nails:        { card: "bg-pink-50 border-pink-200",        header: "bg-pink-100/70",     chip: "bg-pink-100 border border-pink-300 text-pink-800", dot: "bg-pink-400", cell: "bg-pink-50 border-pink-200" },
  microshading: { card: "bg-[#F1E7E0] border-[#C8A892]",     header: "bg-[#E4D2C5]",       chip: "bg-[#E4D2C5] border border-[#C8A892] text-[#5C3E2E]", dot: "bg-[#8A6552]", cell: "bg-[#F1E7E0] border-[#C8A892]" },
};

const CAT_LABEL: Record<Cat, string> = { coiffure: "Coiffure", nails: "Nails", microshading: "Microshading" };

// The booking `message` field may contain "Photo: <url>" appended by the form.
// Split it into readable text + an optional photo URL for a clickable thumbnail.
function parseMessage(message: string | null): { text: string; photoUrl: string | null } {
  if (!message) return { text: "", photoUrl: null };
  const parts = message.split(" · ");
  let photoUrl: string | null = null;
  const textParts: string[] = [];
  for (const p of parts) {
    const m = p.match(/^(Photo|Foto)\s*:\s*(https?:\/\/\S+)$/i);
    if (m) photoUrl = m[2];
    else textParts.push(p);
  }
  return { text: textParts.join(" · "), photoUrl };
}

function BookingMessage({ message, dark = false }: { message: string | null; dark?: boolean }) {
  const { t } = useT();
  const { text, photoUrl } = parseMessage(message);
  if (!text && !photoUrl) return <span className={dark ? "text-ink" : "text-smoke"}>—</span>;
  return (
    <div className="space-y-1.5">
      {text && <div className={`text-xs whitespace-pre-wrap ${dark ? "text-ink" : "text-smoke"}`}>{text}</div>}
      {photoUrl && <BookingPhoto photoUrl={photoUrl} alt={t.admin.photoAlt} />}
    </div>
  );
}

function BookingPhoto({ photoUrl, alt }: { photoUrl: string; alt: string }) {
  const sign = useServerFn(getBookingPhotoUrl);
  const [signed, setSigned] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    sign({ data: { token: getToken() ?? "", photoUrl } })
      .then((r) => { if (!cancelled) setSigned(r.url); })
      .catch(() => { if (!cancelled) setSigned(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [photoUrl, sign]);

  const href = signed ?? photoUrl;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-1.5">
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="inline-block border border-gold/40 hover:border-gold transition-colors">
        {loading ? (
          <div className="h-24 w-24 flex items-center justify-center bg-smoke/10 text-[10px] text-smoke">…</div>
        ) : signed ? (
          <img src={signed} alt={alt} className="h-24 w-24 object-cover" />
        ) : (
          <div className="h-24 w-24 flex items-center justify-center bg-smoke/10 text-[10px] text-smoke px-1 text-center">
            Indisponible
          </div>
        )}
      </a>
      <div className="flex flex-wrap gap-1.5 text-[10px]">
        <a href={href} target="_blank" rel="noopener noreferrer"
          className="px-2 py-1 border border-gold/40 text-gold hover:bg-gold hover:text-ivory transition-colors">
          Ouvrir
        </a>
        <a href={href} download
          className="px-2 py-1 border border-gold/40 text-gold hover:bg-gold hover:text-ivory transition-colors">
          Télécharger
        </a>
        <button type="button" onClick={copyLink}
          className="px-2 py-1 border border-gold/40 text-gold hover:bg-gold hover:text-ivory transition-colors">
          {copied ? "Copié ✓" : "Copier le lien"}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(href)}`} target="_blank" rel="noopener noreferrer"
          className="px-2 py-1 border border-gold/40 text-gold hover:bg-gold hover:text-ivory transition-colors">
          WhatsApp
        </a>
      </div>
    </div>
  );
}

function AdminPage() {
  const check = useServerFn(adminCheck);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { setAuthed(false); return; }
    check({ data: { token } })
      .then(r => {
        if (r.authenticated && r.token) {
          setToken(r.token);
          setAuthed(true);
        } else {
          clearToken();
          setAuthed(false);
        }
      })
      .catch(() => { clearToken(); setAuthed(false); });
  }, [check]);

  if (authed === null) return <div className="min-h-screen bg-ink text-ivory flex items-center justify-center">…</div>;
  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;
  return (
    <>
      <EmailToast />
      <Dashboard onLogout={() => { clearToken(); setAuthed(false); }} />
    </>
  );
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useT();
  const login = useServerFn(adminLogin);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setErr(false);
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    try {
      const res = await login({ data: { password } });
      if (res.ok && res.token) { setToken(res.token); onSuccess(); } else setErr(true);
    } catch { setErr(true); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-5">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-carbon border border-gold/30 p-8">
        <h1 className="font-display text-ivory text-2xl mb-6">{t.admin.login.title}</h1>
        <label className="block text-ivory/70 text-xs tracking-wider uppercase mb-2">{t.admin.login.password}</label>
        <input
          name="password" type="password" autoFocus required
          className="w-full bg-ink border border-gold/20 text-ivory px-3 py-2.5 focus:outline-none focus:border-gold"
        />
        {err && <p className="mt-3 text-red-400 text-sm">{t.admin.login.error}</p>}
        <button disabled={loading} className="btn-gold btn-gold-hover w-full mt-5 disabled:opacity-60">
          {loading ? "…" : t.admin.login.submit}
        </button>
      </form>
    </div>
  );
}

// ─── Email toast notification ─────────────────────────────────────────────────
export function showEmailToast() {
  window.dispatchEvent(new CustomEvent("email-sent"));
}

function EmailToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    };
    window.addEventListener("email-sent", handler);
    return () => window.removeEventListener("email-sent", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="bg-ink text-ivory px-6 py-3 shadow-2xl flex items-center gap-3 animate-fade-in-out border border-gold/30">
        <span className="text-gold text-lg">✓</span>
        <span className="font-display tracking-wide text-sm">E-mail envoyé</span>
      </div>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { t } = useT();
  const list = useServerFn(listBookings);
  const update = useServerFn(updateBookingStatus);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"leads" | "day" | "week" | "clients" | "diensten" | "gallery">("leads");
  const [loading, setLoading] = useState(true);
  const [waClicks, setWaClicks] = useState<number | null>(null);

  // Fetch WhatsApp click count from Supabase directly
  useEffect(() => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/click_events?event_name=eq.whatsapp_click&select=id`;
    fetch(url, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        Prefer: "count=exact",
        "Range-Unit": "items",
        Range: "0-0",
      },
    }).then(r => {
      const countHeader = r.headers.get("content-range");
      if (countHeader) {
        const total = countHeader.split("/")[1];
        setWaClicks(total === "*" ? 0 : parseInt(total));
      }
    }).catch(() => {});
  }, []);

  const knownIdsRef = useRef<Set<string> | null>(null);
  const firstLoadRef = useRef(true);

  const refresh = async () => {
    const token = getToken();
    if (!token) { onLogout(); return; }
    if (firstLoadRef.current) setLoading(true);
    try {
      const r = await list({ data: { token } });
      const next = r.bookings as Booking[];
      const prevIds = knownIdsRef.current;
      if (prevIds && !firstLoadRef.current) {
        const fresh = next.filter(b => !prevIds.has(b.id) && b.status === "new");
        if (fresh.length > 0) notifyNewBookings(fresh);
      }
      knownIdsRef.current = new Set(next.map(b => b.id));
      setBookings(next);
    } catch (e) {
      console.error("listBookings failed", e);
      if (firstLoadRef.current) onLogout();
    } finally {
      if (firstLoadRef.current) { setLoading(false); firstLoadRef.current = false; }
    }
  };
  useEffect(() => {
    void refresh();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    const iv = setInterval(() => { void refresh(); }, 20000);
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(iv); window.removeEventListener("focus", onFocus); };
    /* eslint-disable-next-line */
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { id, status } = (e as CustomEvent).detail;
      void setStatus(id, status);
    };
    window.addEventListener("admin-set-status", handler);
    return () => window.removeEventListener("admin-set-status", handler);
  }, [bookings]);

  const newCount = bookings.filter(b => b.status === "new").length;

  async function setStatus(id: string, status: "confirmed" | "cancelled" | "completed" | "no_show") {
    const token = getToken();
    if (!token) { onLogout(); return; }
    const booking = bookings.find(b => b.id === id);
    await update({ data: { token, id, status } });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    // Show email toast when an email is triggered
    if (booking?.email && (status === "confirmed" || status === "cancelled" || status === "completed")) {
      showEmailToast();
    }
  }

  async function doLogout() { onLogout(); }

  return (
    <div className="min-h-screen bg-ivory">
      <header className="bg-ink text-ivory border-b border-gold/20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl sm:text-2xl">{t.admin.title}</h1>
            {newCount > 0 && (
              <span className="bg-gold text-ivory text-xs font-medium px-2 py-0.5 uppercase tracking-wider">
                {newCount} {t.admin.newBadge}
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {waClicks !== null && (
              <span className="text-xs text-ivory/50 border border-gold/20 px-2 py-1 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="#25D366" className="w-3 h-3"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.541 5.875L.057 23.882l6.184-1.622A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.028-1.384l-.36-.214-3.733.979.999-3.645-.234-.374A9.818 9.818 0 0112 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/></svg>
                {waClicks} clics
              </span>
            )}
            <button onClick={refresh} className="btn-gold-outline text-xs px-3 py-2">{t.admin.refresh}</button>
            <button onClick={doLogout} className="btn-gold-outline text-xs px-3 py-2">{t.admin.logout}</button>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-5 sm:px-8 flex gap-1 overflow-x-auto scrollbar-none">
          {(["leads", "day", "week", "clients", "diensten", "gallery"] as const).map(k => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex-shrink-0 px-4 py-3 text-sm uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                tab === k ? "border-gold text-gold" : "border-transparent text-ivory/60 hover:text-ivory"
              }`}
            >
              {t.admin.tabs[k]}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 sm:px-8 py-8">
        {loading && <p className="text-smoke">…</p>}
        {!loading && tab === "leads" && <LeadsTable bookings={bookings} setStatus={setStatus} onBookingsUpdated={(id, patch) => setBookings(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))} />}
        {!loading && tab === "day" && <DayView bookings={bookings} token={getToken() ?? ""} />}
        {!loading && tab === "week" && <WeekView bookings={bookings} token={getToken() ?? ""} />}
        {tab === "clients" && <ClientsView onLogout={onLogout} onBookingCreated={refresh} />}
        {tab === "diensten" && <ServicesView onLogout={onLogout} />}
        {tab === "gallery" && <GalleryAdmin onLogout={onLogout} />}
      </main>
    </div>
  );
}

// Build calendar event URLs (Google web + Apple/ICS download) from a booking so
// the owner can drop confirmed appointments into her preferred calendar app.
function bookingEventInfo(b: Booking) {
  const durationMin = effectiveDuration(b);
  const [y, m, d] = b.booking_date.split("-").map(Number);
  const [hh, mm] = b.booking_time.slice(0, 5).split(":").map(Number);
  const start = new Date(y, m - 1, d, hh, mm);
  const end = new Date(start.getTime() + durationMin * 60_000);
  const details = [
    `Client: ${b.name}`,
    `Tél: ${b.phone}`,
    b.email ? `Email: ${b.email}` : "",
    `Service: ${b.service}`,
    b.message ? `Message: ${b.message}` : "",
  ].filter(Boolean).join("\n");
  return {
    start,
    end,
    title: `GIGI L — ${b.service} — ${b.name}`,
    details,
    location: "GIGI L Coiffure, Tongeren",
  };
}

// Apple Calendar (and most desktop/mobile calendar apps) opens .ics files directly.
// Encoding it as a data: URL lets the browser download it with no server round-trip.
function icsUrl(b: Booking): string {
  const { start, end, title, details, location } = bookingEventInfo(b);
  const fmt = (dt: Date) =>
    dt.getUTCFullYear().toString() +
    String(dt.getUTCMonth() + 1).padStart(2, "0") +
    String(dt.getUTCDate()).padStart(2, "0") + "T" +
    String(dt.getUTCHours()).padStart(2, "0") +
    String(dt.getUTCMinutes()).padStart(2, "0") +
    String(dt.getUTCSeconds()).padStart(2, "0") + "Z";
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GIGI L//Admin//FR",
    "BEGIN:VEVENT",
    `UID:${b.id}@gigilcoiffure.be`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(details)}`,
    `LOCATION:${esc(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}


function StatusBadge({ status }: { status: Booking["status"] }) {
  const { t } = useT();
  const map: Record<Booking["status"], string> = {
    new: "bg-gold/20 text-gold-deep border border-gold",
    confirmed: "bg-green-100 text-green-800 border border-green-300",
    cancelled: "bg-red-100 text-red-700 border border-red-300 line-through",
    completed: "bg-emerald-600 text-white border border-emerald-700",
    no_show: "bg-zinc-200 text-zinc-700 border border-zinc-400",
  };
  return <span className={`text-xs uppercase tracking-wider px-2 py-1 ${map[status]}`}>{t.admin.status[status]}</span>;
}

// ─── Confirmation dialog ──────────────────────────────────────────────────────
const CONFIRM_MESSAGES: Record<string, string> = {
  cancelled: "Êtes-vous sûr de vouloir annuler ce rendez-vous ? Un e-mail sera envoyé au client.",
  completed: "Êtes-vous sûr de marquer ce rendez-vous comme terminé ?",
  no_show:   "Êtes-vous sûr de marquer ce client comme absent ?",
};

function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] bg-ink/70 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white w-full max-w-sm shadow-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <p className="text-ink text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 border border-border text-sm py-2.5 hover:bg-sand/50">
            Non, retour
          </button>
          <button onClick={onConfirm}
            className="flex-1 bg-ink text-ivory text-sm py-2.5 hover:bg-gold font-medium">
            Oui, confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

function LeadsTable({ bookings, setStatus, onBookingsUpdated }: {
  bookings: Booking[];
  setStatus: (id: string, s: "confirmed" | "cancelled" | "completed" | "no_show") => void;
  onBookingsUpdated: (id: string, patch: Partial<Booking>) => void;
}) {
  const [adjusting, setAdjusting] = useState<Booking | null>(null);
  const [pending, setPending] = useState<{ id: string; status: "cancelled" | "completed" | "no_show" } | null>(null);

  function askConfirm(id: string, status: "cancelled" | "completed" | "no_show") {
    setPending({ id, status });
  }
  function doConfirm() {
    if (!pending) return;
    setStatus(pending.id, pending.status);
    setPending(null);
  }
  const { t } = useT();
  const [filter, setFilter] = useState<"all" | Cat>("all");
  if (bookings.length === 0) return <p className="text-smoke">{t.admin.empty}</p>;

  const counts = {
    all: bookings.length,
    coiffure: bookings.filter(b => categoryOf(b.service) === "coiffure").length,
    nails: bookings.filter(b => categoryOf(b.service) === "nails").length,
    microshading: bookings.filter(b => categoryOf(b.service) === "microshading").length,
  };
  const visible = filter === "all" ? bookings : bookings.filter(b => categoryOf(b.service) === filter);

  // Filter pills — each tinted in its own category colour.
  const pill = (key: "all" | Cat, label: string, active: boolean) => {
    const tone =
      key === "all" ? (active ? "bg-ink text-ivory border-ink" : "bg-white text-ink border-border") :
      key === "coiffure" ? (active ? "bg-ink text-ivory border-ink" : "bg-white text-ink border-border") :
      key === "nails" ? (active ? "bg-pink-400 text-white border-pink-400" : "bg-pink-50 text-pink-800 border-pink-300") :
      (active ? "bg-[#8A6552] text-white border-[#8A6552]" : "bg-[#F1E7E0] text-[#5C3E2E] border-[#C8A892]");
    return (
      <button key={key} onClick={() => setFilter(key)}
        className={`flex-shrink-0 px-3.5 py-2 text-xs uppercase tracking-wider border rounded-full transition-colors ${tone}`}>
        {label} <span className="opacity-60">({counts[key]})</span>
      </button>
    );
  };

  // Clean status highlight: confirmed = green ring, cancelled = dimmed + red ring.
  const statusRing = (s: Booking["status"]) =>
    s === "confirmed" ? "ring-2 ring-green-500/60" :
    s === "cancelled" ? "ring-1 ring-red-300 opacity-60" : "";

  return (
    <>
      {pending && (
        <ConfirmDialog
          message={CONFIRM_MESSAGES[pending.status]}
          onConfirm={doConfirm}
          onCancel={() => setPending(null)}
        />
      )}
      {adjusting && (
        <AdjustBookingModal
          booking={adjusting}
          onClose={() => setAdjusting(null)}
          onSaved={(newDate, newTime) => {
            onBookingsUpdated(adjusting.id, { booking_date: newDate, booking_time: newTime, status: "confirmed" });
            setAdjusting(null);
          }}
        />
      )}
      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none mb-5">
        {pill("all", "Tout", filter === "all")}
        {pill("coiffure", "Coiffure", filter === "coiffure")}
        {pill("nails", "Nails", filter === "nails")}
        {pill("microshading", "Microshading", filter === "microshading")}
      </div>

      {/* Mobile + tablet: card list */}
      <div className="lg:hidden space-y-3">
        {visible.map(b => {
          const cat = categoryOf(b.service);
          const st = CAT_STYLE[cat];
          return (
          <div key={b.id} className={`border p-4 rounded-lg ${st.card} ${statusRing(b.status)}`}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <div className="font-medium text-ink truncate">{b.name}</div>
                <div className="text-xs text-smoke">{new Date(b.created_at).toLocaleString("fr-BE")}</div>
              </div>
              <StatusBadge status={b.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-3 text-sm">
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-wider text-smoke">Service</div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${st.chip}`}>{CAT_LABEL[cat]}</span>
                  <span className="text-ink">{b.service}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-smoke">Date</div>
                <div className="text-ink">{b.booking_date}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-smoke">Heure</div>
                <div className="text-gold font-medium">{timeRange(b)}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-wider text-smoke">Contact</div>
                <a href={`tel:${b.phone}`} className="text-ink hover:text-gold block truncate">{b.phone}</a>
                {b.email && <a href={`mailto:${b.email}`} className="text-xs text-smoke hover:text-gold block truncate">{b.email}</a>}
              </div>
              {b.message && (
                <div className="col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-smoke">Message</div>
                  <BookingMessage message={b.message} />
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${b.phone}`} className="flex-1 min-w-[110px] inline-flex items-center justify-center text-sm font-medium px-4 py-3 min-h-[44px] border border-gold text-gold-deep rounded-md bg-white/60">Appeler</a>
              {b.status === "confirmed" && (
                <a href={icsUrl(b)} download={`gigil-${b.booking_date}-${b.booking_time.slice(0,5)}.ics`}
                   className="flex-1 min-w-[110px] inline-flex items-center justify-center text-sm font-medium px-4 py-3 min-h-[44px] bg-zinc-800 text-white hover:bg-zinc-900 active:bg-black rounded-md shadow-sm">Calendrier</a>
              )}
              {b.status !== "confirmed" && b.status !== "completed" && b.status !== "no_show" && (
                <button onClick={() => setStatus(b.id, "confirmed")} className="flex-1 min-w-[110px] inline-flex items-center justify-center text-sm font-medium px-4 py-3 min-h-[44px] bg-green-600 text-white hover:bg-green-700 active:bg-green-800 rounded-md shadow-sm">{t.admin.actions.confirm}</button>
              )}
              {b.status !== "completed" && b.status !== "cancelled" && (
                <button onClick={() => setAdjusting(b)} className="flex-1 min-w-[110px] inline-flex items-center justify-center text-sm font-medium px-4 py-3 min-h-[44px] bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 rounded-md shadow-sm">Modifier</button>
              )}
              {b.status !== "cancelled" && b.status !== "completed" && (
                <button onClick={() => askConfirm(b.id, "cancelled")} className="flex-1 min-w-[110px] inline-flex items-center justify-center text-sm font-medium px-4 py-3 min-h-[44px] bg-red-600 text-white hover:bg-red-700 active:bg-red-800 rounded-md shadow-sm">{t.admin.actions.cancel}</button>
              )}
              {b.status !== "completed" && b.status !== "cancelled" && (
                <button onClick={() => askConfirm(b.id, "completed")} className="flex-1 min-w-[110px] inline-flex items-center justify-center text-sm font-medium px-4 py-3 min-h-[44px] bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 rounded-md shadow-sm">{t.admin.actions.completed}</button>
              )}
              {b.status !== "no_show" && b.status !== "completed" && b.status !== "cancelled" && (
                <button onClick={() => askConfirm(b.id, "no_show")} className="flex-1 min-w-[110px] inline-flex items-center justify-center text-sm font-medium px-4 py-3 min-h-[44px] bg-zinc-600 text-white hover:bg-zinc-700 active:bg-zinc-800 rounded-md shadow-sm">{t.admin.actions.noShow}</button>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden lg:block overflow-x-auto bg-card border border-border">
        <table className="w-full text-sm">
          <thead className="bg-sand text-ink text-xs uppercase tracking-wider">
            <tr>
              <Th>{t.admin.cols.client}</Th><Th>{t.admin.cols.service}</Th><Th>{t.admin.cols.dateTime}</Th><Th>{t.admin.cols.contact}</Th><Th>{t.admin.cols.message}</Th><Th>{t.admin.cols.status}</Th><Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map(b => {
              const cat = categoryOf(b.service);
              const st = CAT_STYLE[cat];
              return (
              <tr key={b.id} className={`align-top border-l-4 ${st.cell} ${b.status === "cancelled" ? "opacity-60" : ""}`}
                  style={{ borderLeftColor: cat === "nails" ? "#F472B6" : cat === "microshading" ? "#8A6552" : "#D9D2C7" }}>
                <Td><div className="font-medium text-ink">{b.name}</div><div className="text-xs text-smoke">{new Date(b.created_at).toLocaleString("fr-BE")}</div></Td>
                <Td>
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded mr-2 ${st.chip}`}>{CAT_LABEL[cat]}</span>
                  {b.service}
                </Td>
                <Td>
                  <div>{b.booking_date}</div>
                  <div className="text-gold font-medium">{timeRange(b)}</div>
                </Td>
                <Td>
                  <a href={`tel:${b.phone}`} className="text-ink hover:text-gold block">{b.phone}</a>
                  {b.email && <a href={`mailto:${b.email}`} className="text-xs text-smoke hover:text-gold">{b.email}</a>}
                </Td>
                <Td><div className="max-w-xs"><BookingMessage message={b.message} /></div></Td>
                <Td><StatusBadge status={b.status} /></Td>
                <Td>
                  <div className="flex flex-wrap gap-2 min-w-[220px]">
                    {b.status === "confirmed" && (
                      <a href={icsUrl(b)} download={`gigil-${b.booking_date}-${b.booking_time.slice(0,5)}.ics`}
                         className="inline-flex items-center justify-center gap-1 text-sm font-medium px-4 py-2.5 min-h-[44px] bg-zinc-800 text-white hover:bg-zinc-900 active:bg-black rounded-md shadow-sm">Calendrier</a>
                    )}
                    {b.status !== "confirmed" && b.status !== "completed" && b.status !== "no_show" && (
                      <button onClick={() => setStatus(b.id, "confirmed")} className="inline-flex items-center justify-center text-sm font-medium px-4 py-2.5 min-h-[44px] min-w-[110px] bg-green-600 text-white hover:bg-green-700 active:bg-green-800 rounded-md shadow-sm">{t.admin.actions.confirm}</button>
                    )}
                    {b.status !== "completed" && b.status !== "cancelled" && (
                      <button onClick={() => setAdjusting(b)} className="inline-flex items-center justify-center text-sm font-medium px-4 py-2.5 min-h-[44px] min-w-[110px] bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 rounded-md shadow-sm">Modifier</button>
                    )}
                    {b.status !== "cancelled" && b.status !== "completed" && (
                      <button onClick={() => askConfirm(b.id, "cancelled")} className="inline-flex items-center justify-center text-sm font-medium px-4 py-2.5 min-h-[44px] min-w-[110px] bg-red-600 text-white hover:bg-red-700 active:bg-red-800 rounded-md shadow-sm">{t.admin.actions.cancel}</button>
                    )}
                    {b.status !== "completed" && b.status !== "cancelled" && (
                      <button onClick={() => askConfirm(b.id, "completed")} className="inline-flex items-center justify-center text-sm font-medium px-4 py-2.5 min-h-[44px] min-w-[110px] bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 rounded-md shadow-sm">{t.admin.actions.completed}</button>
                    )}
                    {b.status !== "no_show" && b.status !== "completed" && b.status !== "cancelled" && (
                      <button onClick={() => askConfirm(b.id, "no_show")} className="inline-flex items-center justify-center text-sm font-medium px-4 py-2.5 min-h-[44px] min-w-[110px] bg-zinc-600 text-white hover:bg-zinc-700 active:bg-zinc-800 rounded-md shadow-sm">{t.admin.actions.noShow}</button>
                    )}
                  </div>
                </Td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

const Th = ({ children }: { children?: React.ReactNode }) => <th className="text-left px-4 py-3">{children}</th>;
const Td = ({ children }: { children?: React.ReactNode }) => <td className="px-4 py-3">{children}</td>;

const HOURS = Array.from({ length: 10 }, (_, i) => 9 + i); // 09..18

// ─── CRM: Client Profile Modal ───────────────────────────────────────────────
function ClientProfileModal({ booking, token, onClose }: {
  booking: Booking;
  token: string;
  onClose: () => void;
}) {
  const getClientBookingsFn = useServerFn(getClientBookings);
  const updateAmountPaidFn = useServerFn(updateAmountPaid);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getClientBookingsFn({ data: { token, phone: booking.phone } }).then(r => {
      setHistory(r.bookings);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [booking.phone]);

  const totalPaid = history.reduce((sum, b) => sum + (b.amount_paid_cents ?? 0), 0);
  const completedCount = history.filter(b => b.status === "completed").length;

  async function saveAmount(id: string) {
    setSaving(true);
    const cents = editVal === "" ? null : Math.round(parseFloat(editVal.replace(",", ".")) * 100);
    await updateAmountPaidFn({ data: { token, id, amount_paid_cents: cents } });
    setHistory(h => h.map(b => b.id === id ? { ...b, amount_paid_cents: cents } : b));
    setEditId(null);
    setSaving(false);
  }

  const statusLabel: Record<string, string> = {
    new: "Nouveau", confirmed: "Confirmé", completed: "Terminé",
    cancelled: "Annulé", no_show: "No-show",
  };
  const statusColor: Record<string, string> = {
    new: "text-blue-600", confirmed: "text-green-600", completed: "text-emerald-700",
    cancelled: "text-red-500", no_show: "text-orange-500",
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-ink text-ivory px-5 py-4 flex items-start justify-between">
          <div>
            <p className="text-xs text-ivory/40 uppercase tracking-wider mb-1">Profil client</p>
            <h2 className="font-display text-2xl">{booking.name}</h2>
            <a href={`tel:${booking.phone}`} className="text-gold text-sm hover:underline">{booking.phone}</a>
            {booking.email && <p className="text-ivory/50 text-xs mt-0.5">{booking.email}</p>}
          </div>
          <button onClick={onClose} className="text-ivory/40 hover:text-ivory text-2xl leading-none mt-1">×</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          <div className="px-4 py-3 text-center">
            <div className="font-display text-2xl text-ink">{history.length}</div>
            <div className="text-smoke text-xs mt-0.5">Rendez-vous</div>
          </div>
          <div className="px-4 py-3 text-center">
            <div className="font-display text-2xl text-ink">{completedCount}</div>
            <div className="text-smoke text-xs mt-0.5">Terminés</div>
          </div>
          <div className="px-4 py-3 text-center">
            <div className="font-display text-2xl text-gold">€{(totalPaid / 100).toFixed(2)}</div>
            <div className="text-smoke text-xs mt-0.5">Total payé</div>
          </div>
        </div>

        {/* Appointment history */}
        <div className="px-5 py-4">
          <h3 className="text-smoke text-xs uppercase tracking-wider mb-3">Historique des rendez-vous</h3>
          {loading ? (
            <p className="text-smoke text-sm">Chargement...</p>
          ) : history.length === 0 ? (
            <p className="text-smoke text-sm">Aucun rendez-vous trouvé.</p>
          ) : (
            <div className="space-y-2">
              {history.map(b => (
                <div key={b.id} className="border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-ink text-sm font-medium">{b.booking_date}</span>
                        <span className="text-smoke text-xs">{b.booking_time?.slice(0,5)}</span>
                        <span className={`text-xs font-medium ${statusColor[b.status] ?? "text-smoke"}`}>
                          {statusLabel[b.status] ?? b.status}
                        </span>
                      </div>
                      <div className="text-smoke text-xs mt-0.5 truncate">{b.service}</div>
                    </div>

                    {/* Amount paid */}
                    <div className="shrink-0 text-right">
                      {editId === b.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-smoke text-xs">€</span>
                          <input
                            type="number" step="0.01" min="0"
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            className="w-20 border border-gold px-2 py-1 text-sm text-right"
                            autoFocus
                            onKeyDown={e => { if (e.key === "Enter") saveAmount(b.id); if (e.key === "Escape") setEditId(null); }}
                          />
                          <button onClick={() => saveAmount(b.id)} disabled={saving}
                            className="text-xs text-green-600 hover:text-green-800 font-medium">✓</button>
                          <button onClick={() => setEditId(null)}
                            className="text-xs text-smoke hover:text-red-500">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditId(b.id); setEditVal(b.amount_paid_cents != null ? (b.amount_paid_cents / 100).toFixed(2) : ""); }}
                          className="text-right hover:opacity-70 transition-opacity">
                          {b.amount_paid_cents != null
                            ? <span className="text-gold font-medium text-sm">€{(b.amount_paid_cents / 100).toFixed(2)}</span>
                            : <span className="text-smoke/50 text-xs italic">+ Ajouter montant</span>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border px-5 py-3 flex justify-between items-center bg-sand/30">
          <span className="text-xs text-smoke">Cliquer sur le montant pour modifier</span>
          <button onClick={onClose} className="text-sm text-smoke hover:text-ink">Fermer</button>
        </div>
      </div>
    </div>
  );
}

function DayView({ bookings, token }: { bookings: Booking[]; token: string }) {
  const { t } = useT();
  const [day, setDay] = useState<string>(new Date().toISOString().slice(0, 10));
  const [crmBooking, setCrmBooking] = useState<Booking | null>(null);
  const [quickBooking, setQuickBooking] = useState<Booking | null>(null);
  const [pendingStatus, setPendingStatus] = useState<{ id: string; status: "cancelled" | "completed" | "no_show" } | null>(null);

  const visible = useMemo(
    () => bookings.filter(b => b.booking_date === day && b.status !== "cancelled"),
    [bookings, day],
  );
  const shift = (n: number) => {
    const d = new Date(day); d.setDate(d.getDate() + n);
    setDay(d.toISOString().slice(0, 10));
  };

  return (
    <div>
      {crmBooking && <ClientProfileModal booking={crmBooking} token={token} onClose={() => setCrmBooking(null)} />}

      {/* Confirm dialog */}
      {pendingStatus && (
        <ConfirmDialog
          message={CONFIRM_MESSAGES[pendingStatus.status] ?? "Êtes-vous sûr ?"}
          onConfirm={() => {
            window.dispatchEvent(new CustomEvent("admin-set-status", { detail: pendingStatus }));
            setPendingStatus(null);
            setQuickBooking(null);
          }}
          onCancel={() => setPendingStatus(null)}
        />
      )}

      {/* Quick booking popup */}
      {quickBooking && !pendingStatus && (
        <div className="fixed inset-0 z-[55] bg-ink/60 flex items-end sm:items-center justify-center" onClick={() => setQuickBooking(null)}>
          <div className="bg-white w-full sm:max-w-sm border border-gold/30 shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-ink text-ivory px-4 py-3 flex justify-between items-start">
              <div>
                <div className="font-display text-lg">{quickBooking.name}</div>
                <div className="text-ivory/60 text-xs mt-0.5">{quickBooking.booking_time.slice(0,5)} · {quickBooking.service}</div>
              </div>
              <button onClick={() => setQuickBooking(null)} className="text-ivory/50 hover:text-ivory text-2xl leading-none">×</button>
            </div>

            {/* Contact */}
            <div className="px-4 py-3 border-b border-border flex gap-4 text-sm">
              <a href={`tel:${quickBooking.phone}`} className="flex items-center gap-1.5 text-ink hover:text-gold">
                📞 <span>{quickBooking.phone}</span>
              </a>
              {quickBooking.email && (
                <a href={`mailto:${quickBooking.email}`} className="flex items-center gap-1.5 text-ink hover:text-gold truncate">
                  ✉️ <span className="truncate">{quickBooking.email}</span>
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 space-y-2">
              {quickBooking.status !== "completed" && (
                <button onClick={() => setPendingStatus({ id: quickBooking.id, status: "completed" })}
                  className="w-full py-3 bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800">
                  Terminé
                </button>
              )}
              <button onClick={() => setPendingStatus({ id: quickBooking.id, status: "no_show" })}
                className="w-full py-3 bg-zinc-600 text-white text-sm font-medium hover:bg-zinc-700">
                Absent
              </button>
              <button onClick={() => { setCrmBooking(quickBooking); setQuickBooking(null); }}
                className="w-full py-3 bg-ink text-ivory text-sm font-medium hover:bg-gold">
                Ouvrir fiche client
              </button>
              <button onClick={() => setPendingStatus({ id: quickBooking.id, status: "cancelled" })}
                className="w-full py-2 border border-red-300 text-red-600 text-sm hover:bg-red-50">
                Annuler le rendez-vous
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => shift(-1)} className="px-3 py-1 border border-border">←</button>
        <button onClick={() => setDay(new Date().toISOString().slice(0, 10))} className="px-3 py-1 border border-border text-sm">{t.admin.today}</button>
        <button onClick={() => shift(1)} className="px-3 py-1 border border-border">→</button>
        <span className="ml-3 font-display text-lg">{day}</span>
      </div>
      <div className="bg-card border border-border">
        {HOURS.map(h => {
          const slot = visible.filter(b => parseInt(b.booking_time.slice(0,2),10) === h);
          return (
            <div key={h} className="grid grid-cols-[80px_1fr] border-t border-border first:border-t-0 min-h-[64px]">
              <div className="px-4 py-3 text-smoke text-xs">{String(h).padStart(2,"0")}:00</div>
              <div className="px-3 py-2 flex flex-wrap gap-2">
                {slot.map(b => {
                  const cat = categoryOf(b.service);
                  const st = CAT_STYLE[cat];
                  return (
                  <button key={b.id}
                    onClick={() => setQuickBooking(b)}
                    className={`px-3 py-2 text-xs border rounded text-left w-full sm:w-auto hover:opacity-80 transition-opacity ${st.cell} ${b.status === "confirmed" ? "ring-2 ring-green-500/60" : ""}`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      <span className="font-medium">{b.booking_time.slice(0,5)} — {b.name}</span>
                    </div>
                    <div className="text-smoke">{b.service}</div>
                    {b.status === "confirmed" && <div className="text-green-700 text-[10px] uppercase tracking-wider mt-0.5">✓ Confirmé</div>}
                  </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fmtISO(d: Date) { return d.toISOString().slice(0, 10); }

function WeekView({ bookings, token }: { bookings: Booking[]; token: string }) {
  const { t } = useT();
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [crmBooking, setCrmBooking] = useState<Booking | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const monday = new Date(anchor);
  const day = (monday.getDay() + 6) % 7; // 0 = Monday
  monday.setDate(monday.getDate() - day);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(d.getDate() + i);
    return d;
  });
  const sunday = days[6];
  const visible = bookings.filter(b => b.status !== "cancelled");
  const shift = (n: number) => { const d = new Date(anchor); d.setDate(d.getDate() + n * 7); setAnchor(d); };
  const rangeLabel = `${monday.getDate()}/${monday.getMonth() + 1} – ${sunday.getDate()}/${sunday.getMonth() + 1}/${sunday.getFullYear()}`;
  const todayIso = fmtISO(new Date());

  const dayBookingsFor = (iso: string) =>
    bookings.filter(b => b.booking_date === iso)
      .sort((a, b) => a.booking_time.localeCompare(b.booking_time));

  return (
    <div>
      {/* Navigation bar */}
      <div className="mb-5 bg-card border border-border p-3 sm:p-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
          <button
            onClick={() => shift(-1)}
            aria-label="Précédent"
            className="flex items-center gap-1 px-3 py-2 border border-border hover:bg-sand text-sm"
          >
            <span aria-hidden>←</span>
            <span className="hidden sm:inline">Préc.</span>
          </button>
          <div className="min-w-0 text-center">
            <div className="font-display text-base sm:text-lg truncate">{rangeLabel}</div>
            <div className="text-[10px] sm:text-xs uppercase tracking-wider text-smoke">Semaine</div>
          </div>
          <button
            onClick={() => shift(1)}
            aria-label="Suivant"
            className="flex items-center gap-1 px-3 py-2 border border-border hover:bg-sand text-sm"
          >
            <span className="hidden sm:inline">Suiv.</span>
            <span aria-hidden>→</span>
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAnchor(new Date())}
            className="px-3 py-2 border border-gold text-gold-deep text-xs uppercase tracking-wider hover:bg-gold/10"
          >
            {t.admin.today}
          </button>
          <label className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-smoke uppercase tracking-wider">Aller à</span>
            <input
              type="date"
              value={fmtISO(anchor)}
              onChange={(e) => {
                if (e.target.value) setAnchor(new Date(e.target.value + "T00:00:00"));
              }}
              className="bg-ivory border border-border px-2 py-1.5 text-sm"
            />
          </label>
        </div>
      </div>

      {/* Mobile/tablet: stacked day cards (clickable) */}
      <div className="lg:hidden space-y-2">
        {days.map(d => {
          const iso = fmtISO(d);
          const list = visible.filter(b => b.booking_date === iso);
          const isToday = iso === todayIso;
          return (
            <button
              key={iso}
              onClick={() => setSelectedDay(iso)}
              className={`w-full text-left bg-card border ${isToday ? "border-gold" : "border-border"} hover:border-gold transition-colors`}
            >
              <div className={`px-4 py-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 ${isToday ? "bg-gold/15" : "bg-sand"}`}>
                <div className="text-center w-12 shrink-0">
                  <div className="text-[10px] uppercase tracking-wider text-smoke">{d.toLocaleDateString("fr-BE", { weekday: "short" })}</div>
                  <div className="font-display text-2xl leading-none">{d.getDate()}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-ink">
                    {list.length === 0 ? <span className="text-smoke italic">Aucun rdv</span> :
                      <span className="font-medium">{list.length} rendez-vous</span>}
                  </div>
                  {list.length > 0 && (
                    <div className="text-xs text-smoke truncate">
                      {list.slice(0, 2).map(b => `${b.booking_time.slice(0,5)} ${b.name}`).join(" · ")}
                      {list.length > 2 ? ` +${list.length - 2}` : ""}
                    </div>
                  )}
                </div>
                <span className="text-gold text-lg shrink-0" aria-hidden>›</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop: 7-column grid (clickable) */}
      <div className="hidden lg:grid grid-cols-7 gap-px bg-border border border-border overflow-x-auto">
        {days.map(d => {
          const iso = fmtISO(d);
          const list = visible.filter(b => b.booking_date === iso);
          const isToday = iso === todayIso;
          return (
            <button
              key={iso}
              onClick={() => setSelectedDay(iso)}
              className={`bg-card min-h-[260px] min-w-[140px] text-left hover:bg-sand/50 transition-colors ${isToday ? "ring-2 ring-gold ring-inset" : ""}`}
            >
              <div className={`px-3 py-2 text-center ${isToday ? "bg-gold/15" : "bg-sand"}`}>
                <div className="text-xs uppercase tracking-wider text-smoke">{d.toLocaleDateString("fr-BE", { weekday: "short" })}</div>
                <div className="font-display text-lg">{d.getDate()}/{d.getMonth() + 1}</div>
                <div className="text-xs text-gold">{list.length}</div>
              </div>
              <div className="p-2 space-y-1.5">
                {list.sort((a,b) => a.booking_time.localeCompare(b.booking_time)).map(b => {
                  const cat = categoryOf(b.service);
                  const st = CAT_STYLE[cat];
                  return (
                  <div key={b.id} className={`px-2 py-1.5 text-xs border rounded ${st.cell} ${b.status === "confirmed" ? "ring-2 ring-green-500/60" : ""} ${b.status === "cancelled" ? "opacity-50 line-through" : ""}`}>
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      <span className="font-medium">{b.booking_time.slice(0,5)}</span>
                      <button onClick={(e) => { e.stopPropagation(); setCrmBooking(b); }}
                        className="ml-auto text-[9px] bg-ink text-ivory px-1 py-0.5 hover:bg-gold transition-colors">
                        CRM
                      </button>
                    </div>
                    <div className="truncate">{b.name}</div>
                    <div className="text-smoke truncate">{b.service}</div>
                  </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <DayDetailsModal
          iso={selectedDay}
          bookings={dayBookingsFor(selectedDay)}
          onClose={() => setSelectedDay(null)}
          onSetStatus={(id, status) => {
            // Propagate to parent via a custom event so Dashboard updates bookings
            window.dispatchEvent(new CustomEvent("admin-set-status", { detail: { id, status } }));
          }}
          token={token}
        />
      )}
      {crmBooking && <ClientProfileModal booking={crmBooking} token={token} onClose={() => setCrmBooking(null)} />}
    </div>
  );
}

function DayDetailsModal({ iso, bookings, onClose, onSetStatus, token }: {
  iso: string;
  bookings: Booking[];
  onClose: () => void;
  onSetStatus: (id: string, status: "confirmed" | "cancelled" | "completed" | "no_show") => void;
  token: string;
}) {
  const [crmBooking, setCrmBooking] = useState<Booking | null>(null);
  const [localBookings, setLocalBookings] = useState(bookings);
  const [pendingDay, setPendingDay] = useState<{ id: string; status: "confirmed" | "cancelled" | "completed" | "no_show" } | null>(null);
  useEffect(() => setLocalBookings(bookings), [bookings]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { if (crmBooking) setCrmBooking(null); else onClose(); } };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose, crmBooking]);

  const d = new Date(iso + "T00:00:00");
  const title = d.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  function handleStatus(id: string, status: "confirmed" | "cancelled" | "completed" | "no_show") {
    onSetStatus(id, status);
    setLocalBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  return (
    <>
    {pendingDay && (
      <ConfirmDialog
        message={CONFIRM_MESSAGES[pendingDay.status] ?? "Êtes-vous sûr ?"}
        onConfirm={() => { handleStatus(pendingDay.id, pendingDay.status); setPendingDay(null); }}
        onCancel={() => setPendingDay(null)}
      />
    )}
    {crmBooking && <ClientProfileModal booking={crmBooking} token={token} onClose={() => setCrmBooking(null)} />}
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center bg-ink/60" onClick={onClose}>
      <div
        className="bg-ivory w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col border border-gold/30 sm:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-ink text-ivory px-5 py-4 flex items-start justify-between gap-3 border-b border-gold/30">
          <div className="min-w-0">
            <div className="font-display text-lg sm:text-xl capitalize truncate">{title}</div>
            <div className="text-xs text-ivory/60 uppercase tracking-wider mt-0.5">
              {localBookings.length} {localBookings.length === 1 ? "rendez-vous" : "rendez-vous"}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="text-ivory/80 hover:text-gold text-2xl leading-none shrink-0">×</button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5 space-y-3">
          {localBookings.length === 0 && <p className="text-smoke text-center py-8">Aucun rendez-vous</p>}
          {localBookings.map(b => (
            <div key={b.id} className={`border p-4 ${b.status === "cancelled" ? "bg-red-50 border-red-200 opacity-60" : b.status === "confirmed" ? "bg-green-50 border-green-300" : "bg-gold/10 border-gold"}`}>
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <div className="text-center shrink-0">
                  <div className="font-display text-2xl text-gold-deep leading-none">{b.booking_time.slice(0,5)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-smoke mt-1">→ {timeRange(b).split(" → ")[1]}</div>
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-ink truncate">{b.name}</div>
                  <div className="text-sm text-smoke truncate">{b.service}</div>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <a href={`tel:${b.phone}`} className="flex items-center gap-2 text-ink hover:text-gold truncate">
                  <span aria-hidden>📞</span><span className="truncate">{b.phone}</span>
                </a>
                {b.email && (
                  <a href={`mailto:${b.email}`} className="flex items-center gap-2 text-ink hover:text-gold truncate">
                    <span aria-hidden>✉️</span><span className="truncate">{b.email}</span>
                  </a>
                )}
              </div>
              {b.message && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-[10px] uppercase tracking-wider text-smoke mb-1">Message</div>
                  <BookingMessage message={b.message} dark />
                </div>
              )}
              <div className="mt-2 text-[10px] text-smoke uppercase tracking-wider">
                Reçu le {new Date(b.created_at).toLocaleString("fr-BE")}
              </div>

              {/* Action buttons */}
              {b.status !== "cancelled" && b.status !== "completed" && (
                <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                  {b.status !== "confirmed" && (
                    <button onClick={() => handleStatus(b.id, "confirmed")}
                      className="flex-1 min-w-[100px] px-3 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700">
                      Confirmer
                    </button>
                  )}
                  <button onClick={() => setCrmBooking(b)}
                    className="flex-1 min-w-[100px] px-3 py-2 bg-ink text-ivory text-sm font-medium hover:bg-gold">
                    Fiche client
                  </button>
                  <button onClick={() => setPendingDay({ id: b.id, status: "cancelled" })}
                    className="flex-1 min-w-[100px] px-3 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                    Annuler
                  </button>
                </div>
              )}
              {(b.status === "confirmed" || b.status === "cancelled" || b.status === "completed") && (
                <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                  <button onClick={() => setCrmBooking(b)}
                    className="flex-1 px-3 py-2 bg-ink text-ivory text-sm font-medium hover:bg-gold">
                    Fiche client
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-border p-3 bg-sand">
          <button onClick={onClose} className="w-full px-4 py-2.5 border border-ink text-ink hover:bg-ink hover:text-ivory text-sm uppercase tracking-wider">
            Fermer
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

// ─── SERVICES / DIENSTEN VIEW ──────────────────────────────────────────────
// Owner edits duration (min) + price (€) per service. Mobile-friendly cards.
const SVC_CAT_LABELS: Record<string, string> = {
  coiffure: "Coiffure",
  nails: "Nails",
  microshading: "Microshading",
};

function formatPrice(cents: number | null): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(2).replace(/\.00$/, "");
}
function formatDuration(min: number, hUnit = "h", minUnit = "min"): string {
  if (min < 60) return `${min} ${minUnit}`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} ${hUnit}` : `${h} ${hUnit} ${m} ${minUnit}`;
}

function ServicesView({ onLogout }: { onLogout: () => void }) {
  const { t } = useT();
  const list = useServerFn(listServices);
  const update = useServerFn(updateService);
  const add = useServerFn(addService);
  const del = useServerFn(deleteService);
  const seed = useServerFn(seedServices);

  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    const token = getToken();
    if (!token) { onLogout(); return; }
    setLoading(true);
    try {
      // Ensure all booking-form services exist (idempotent), then list.
      await seed({ data: { token } });
      setItems((await list({ data: { token } })).services);
    }
    catch { onLogout(); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  async function saveField(id: string, patch: { duration_min?: number; price_cents?: number | null }) {
    const token = getToken();
    if (!token) { onLogout(); return; }
    setSavingId(id);
    try {
      await update({ data: { token, id, ...patch } });
      setItems(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    } finally { setSavingId(null); }
  }

  async function removeItem(id: string) {
    if (!window.confirm(t.admin.services.removeConfirm)) return;
    const token = getToken();
    if (!token) { onLogout(); return; }
    await del({ data: { token, id } });
    setItems(prev => prev.filter(s => s.id !== id));
  }

  if (loading) return <p className="text-smoke">…</p>;

  const grouped: Record<string, ServiceItem[]> = { coiffure: [], nails: [], microshading: [] };
  for (const s of items) (grouped[s.category] ??= []).push(s);

  return (
    <div className="space-y-8 max-w-2xl">
      <p className="text-smoke text-sm">
        {t.admin.services.intro}
      </p>

      {(["coiffure", "nails", "microshading"] as const).map(cat => (
        <section key={cat}>
          <h2 className="font-display text-xl text-ink mb-3">{SVC_CAT_LABELS[cat]}</h2>
          <div className="space-y-2">
            {grouped[cat].map(s => (
              <ServiceRow
                key={s.id}
                item={s}
                saving={savingId === s.id}
                onSave={saveField}
                onRemove={removeItem}
              />
            ))}
          </div>
          <AddServiceForm category={cat} onAdded={load} onLogout={onLogout} add={add} />
        </section>
      ))}
    </div>
  );
}

function ServiceRow({
  item, saving, onSave, onRemove,
}: {
  item: ServiceItem;
  saving: boolean;
  onSave: (id: string, patch: { duration_min?: number; price_cents?: number | null }) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useT();
  const [dur, setDur] = useState(String(item.duration_min));
  const [price, setPrice] = useState(formatPrice(item.price_cents));

  const durChanged = Number(dur) !== item.duration_min;
  const priceChanged = (price === "" ? null : Math.round(Number(price) * 100)) !== item.price_cents;
  const dirty = durChanged || priceChanged;

  function save() {
    const patch: { duration_min?: number; price_cents?: number | null } = {};
    if (durChanged && dur !== "" && !isNaN(Number(dur))) patch.duration_min = Number(dur);
    if (priceChanged) patch.price_cents = price === "" ? null : Math.round(Number(price) * 100);
    if (Object.keys(patch).length) onSave(item.id, patch);
  }

  return (
    <div className="bg-white border border-border rounded-lg p-3.5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-medium text-ink text-sm">{item.name}</p>
        <button onClick={() => onRemove(item.id)} aria-label={t.admin.services.removeConfirm}
          className="text-smoke hover:text-red-600 text-lg leading-none flex-shrink-0">×</button>
      </div>
      <div className="flex items-end gap-3">
        {/* Duration */}
        <label className="flex-1">
          <span className="block text-[10px] uppercase tracking-wider text-smoke mb-1">{t.admin.services.duration}</span>
          <input type="number" inputMode="numeric" min={0} step={5} value={dur}
            onChange={e => setDur(e.target.value)}
            className="w-full border border-border rounded px-2.5 py-2 text-sm focus:outline-none focus:border-gold" />
        </label>
        {/* Price */}
        <label className="flex-1">
          <span className="block text-[10px] uppercase tracking-wider text-smoke mb-1">{t.admin.services.price}</span>
          <input type="number" inputMode="decimal" min={0} step="0.5" value={price} placeholder={t.admin.services.onRequest}
            onChange={e => setPrice(e.target.value)}
            className="w-full border border-border rounded px-2.5 py-2 text-sm focus:outline-none focus:border-gold" />
        </label>
        {/* Save */}
        <button onClick={save} disabled={!dirty || saving}
          className={`px-3 py-2 text-xs uppercase tracking-wider rounded transition-colors flex-shrink-0 ${
            dirty ? "bg-gold text-ivory hover:bg-gold/90" : "bg-sand text-smoke cursor-default"
          } disabled:opacity-50`}>
          {saving ? "…" : dirty ? t.admin.services.save : "✓"}
        </button>
      </div>
      <p className="text-[11px] text-smoke mt-2">
        {formatDuration(item.duration_min, t.admin.services.hUnit, t.admin.services.minUnit)}
        {item.price_cents !== null ? ` · € ${formatPrice(item.price_cents)}` : ` · ${t.admin.services.onRequest}`}
      </p>
    </div>
  );
}

function AddServiceForm({
  category, onAdded, onLogout, add,
}: {
  category: "coiffure" | "nails" | "microshading";
  onAdded: () => void;
  onLogout: () => void;
  add: ReturnType<typeof useServerFn<typeof addService>>;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dur, setDur] = useState("60");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    const token = getToken();
    if (!token) { onLogout(); return; }
    setBusy(true);
    try {
      await add({ data: {
        token, category, name: name.trim(),
        duration_min: Number(dur) || 60,
        price_cents: price === "" ? null : Math.round(Number(price) * 100),
      }});
      setName(""); setDur("60"); setPrice(""); setOpen(false);
      onAdded();
    } finally { setBusy(false); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="mt-2 text-xs text-gold hover:underline tracking-wider uppercase">
        + {t.admin.services.add}
      </button>
    );
  }

  return (
    <div className="mt-2 bg-sand/50 border border-border rounded-lg p-3.5 space-y-3">
      <input value={name} onChange={e => setName(e.target.value)} placeholder={t.admin.services.addName} autoFocus
        className="w-full border border-border rounded px-2.5 py-2 text-sm focus:outline-none focus:border-gold" />
      <div className="flex gap-3">
        <label className="flex-1">
          <span className="block text-[10px] uppercase tracking-wider text-smoke mb-1">{t.admin.services.duration}</span>
          <input type="number" inputMode="numeric" min={0} step={5} value={dur} onChange={e => setDur(e.target.value)}
            className="w-full border border-border rounded px-2.5 py-2 text-sm focus:outline-none focus:border-gold" />
        </label>
        <label className="flex-1">
          <span className="block text-[10px] uppercase tracking-wider text-smoke mb-1">{t.admin.services.price}</span>
          <input type="number" inputMode="decimal" min={0} step="0.5" value={price} placeholder={t.admin.services.onRequest} onChange={e => setPrice(e.target.value)}
            className="w-full border border-border rounded px-2.5 py-2 text-sm focus:outline-none focus:border-gold" />
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy || !name.trim()}
          className="btn-gold btn-gold-hover flex-1 py-2 text-sm disabled:opacity-50">
          {busy ? "…" : t.admin.services.confirm}
        </button>
        <button onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm text-smoke border border-border rounded hover:border-gold">
          {t.admin.services.cancel}
        </button>
      </div>
    </div>
  );
}

function GalleryAdmin({ onLogout }: { onLogout: () => void }) {
  const list = useServerFn(listGallery);
  const upload = useServerFn(uploadGalleryPhoto);
  const add = useServerFn(addGalleryItem);
  const update = useServerFn(updateGalleryItem);
  const del = useServerFn(deleteGalleryItem);
  const listCats = useServerFn(listCategories);
  const addCat = useServerFn(addCategory);
  const updateCat = useServerFn(updateCategory);
  const delCat = useServerFn(deleteCategory);

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [cats, setCats] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");
  const [filterCat, setFilterCat] = useState<string>("all");

  // Category management UI state
  const [showCatMgr, setShowCatMgr] = useState(false);
  const [newCatKey, setNewCatKey] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");

  const CAT_LABEL: Record<string, string> = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of cats) m[c.key] = c.label_fr || c.key;
    return m;
  }, [cats]);
  const catKeys = useMemo(() => cats.map(c => c.key), [cats]);

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    const token = getToken();
    if (!token) { onLogout(); return; }
    try {
      const [r, rc] = await Promise.all([list({ data: { token } }), listCats()]);
      setItems(r.items);
      setCats(rc.categories);
      setCategory(prev => prev || rc.categories[0]?.key || "");
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Erreur");
    } finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); /* eslint-disable-next-line */ }, []);

  async function onAddCategory(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !newCatKey.trim()) return;
    try {
      const res = await addCat({ data: {
        token, key: newCatKey.trim().toLowerCase(),
        label_fr: newCatLabel.trim() || newCatKey.trim(),
        label_nl: newCatLabel.trim() || newCatKey.trim(),
        label_en: newCatLabel.trim() || newCatKey.trim(),
        sort_order: (cats[cats.length - 1]?.sort_order ?? 0) + 10,
      }});
      setCats(prev => [...prev, res.category]);
      setNewCatKey(""); setNewCatLabel("");
    } catch (e: any) { setErr(e?.message ?? "Erreur"); }
  }

  async function onRenameCategory(key: string, label: string) {
    const token = getToken();
    if (!token) return;
    try {
      await updateCat({ data: { token, key, label_fr: label, label_nl: label, label_en: label } });
      setCats(prev => prev.map(c => c.key === key ? { ...c, label_fr: label, label_nl: label, label_en: label } : c));
    } catch (e) { console.error(e); }
  }

  async function onDeleteCategory(key: string) {
    const inUse = items.filter(x => x.category === key).length;
    const msg = inUse > 0
      ? `Supprimer la catégorie "${CAT_LABEL[key] ?? key}" ? ${inUse} photo(s) resteront sans catégorie.`
      : `Supprimer la catégorie "${CAT_LABEL[key] ?? key}" ?`;
    if (!confirm(msg)) return;
    const token = getToken();
    if (!token) return;
    try {
      await delCat({ data: { token, key } });
      setCats(prev => prev.filter(c => c.key !== key));
      setItems(prev => prev.map(x => x.category === key ? { ...x, category: "" } : x));
      if (filterCat === key) setFilterCat("all");
      if (category === key) setCategory(cats[0]?.key ?? "");
    } catch (e: any) { setErr(e?.message ?? "Erreur"); }
  }


  function onPickFile(f: File | null) {
    setFile(f);
    setPreview(null);
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(f);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!preview) { setErr("Choisis une photo"); return; }
    const token = getToken();
    if (!token) { onLogout(); return; }
    setBusy(true); setErr(null);
    try {
      const up = await upload({ data: { token, dataUrl: preview } });
      const res = await add({ data: {
        token, url: up.url, category: category as any,
        caption_fr: "", caption_nl: "", caption_en: "",
        span: 1, sort_order: 0,
      }});
      setItems(prev => [res.item, ...prev]);
      setFile(null); setPreview(null);
      const input = document.getElementById("gallery-file") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Upload échoué");
    } finally { setBusy(false); }
  }

  async function toggleActive(it: GalleryItem) {
    const token = getToken();
    if (!token) { onLogout(); return; }
    try {
      await update({ data: { token, id: it.id, active: !it.active } });
      setItems(prev => prev.map(x => x.id === it.id ? { ...x, active: !x.active } : x));
    } catch (e) { console.error(e); }
  }

  async function changeCategory(it: GalleryItem, cat: string) {
    const token = getToken();
    if (!token) { onLogout(); return; }
    try {
      await update({ data: { token, id: it.id, category: cat as any } });
      setItems(prev => prev.map(x => x.id === it.id ? { ...x, category: cat } : x));
    } catch (e) { console.error(e); }
  }

  async function onDelete(it: GalleryItem) {
    if (!confirm("Supprimer cette photo ?")) return;
    const token = getToken();
    if (!token) { onLogout(); return; }
    try {
      await del({ data: { token, id: it.id } });
      setItems(prev => prev.filter(x => x.id !== it.id));
    } catch (e) { console.error(e); }
  }

  const visible = filterCat === "all"
    ? items
    : filterCat === "__none"
      ? items.filter(x => !x.category || !catKeys.includes(x.category))
      : items.filter(x => x.category === filterCat);

  return (
    <div className="space-y-8">
      {/* Upload form */}
      <section className="border border-gold/20 bg-sand/40 p-5 sm:p-6">
        <h2 className="font-display text-xl text-ink">Ajouter une photo</h2>
        <p className="text-xs text-smoke mt-1">Choisis la photo et la catégorie.</p>

        <form onSubmit={onSubmit} className="mt-5 grid gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-smoke mb-2">Photo</label>
            <input id="gallery-file" type="file" accept="image/*"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-smoke file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-gold file:text-ivory file:text-xs file:uppercase file:tracking-widest file:cursor-pointer" />
            {preview && (
              <img src={preview} alt="aperçu" className="mt-3 max-h-48 border border-gold/30 object-cover" />
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-smoke mb-2">Catégorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-border bg-ivory px-3 py-2 text-sm">
              {catKeys.length === 0 && <option value="">— Aucune catégorie —</option>}
              {catKeys.map(c => <option key={c} value={c}>{CAT_LABEL[c] ?? c}</option>)}
            </select>
          </div>

          {err && <p className="text-sm text-red-700">{err}</p>}

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy || !preview} className="btn-gold btn-gold-hover disabled:opacity-50">
              {busy ? "Envoi…" : "Ajouter à la galerie"}
            </button>
            <button type="button" onClick={refresh} className="btn-gold-outline">Actualiser</button>
          </div>
        </form>
      </section>

      {/* Category management */}
      <section className="border border-gold/20 bg-ivory p-4 sm:p-5">
        <button type="button" onClick={() => setShowCatMgr(v => !v)}
          className="w-full flex items-center justify-between text-left">
          <h2 className="font-display text-lg text-ink">Gérer les catégories <span className="text-smoke text-sm">({cats.length})</span></h2>
          <span className="text-gold">{showCatMgr ? "▲" : "▼"}</span>
        </button>
        {showCatMgr && (
          <div className="mt-4 space-y-3">
            {cats.map(c => {
              const inUse = items.filter(x => x.category === c.key).length;
              return (
                <div key={c.key} className="flex flex-wrap items-center gap-2 border-b border-gold/10 pb-2">
                  <span className="text-[10px] uppercase tracking-widest text-smoke w-20">{c.key}</span>
                  <input defaultValue={c.label_fr}
                    onBlur={(e) => { if (e.target.value !== c.label_fr) onRenameCategory(c.key, e.target.value); }}
                    className="flex-1 min-w-[140px] border border-border bg-ivory px-2 py-1 text-sm" />
                  <span className="text-xs text-smoke">{inUse} photo{inUse !== 1 ? "s" : ""}</span>
                  <button type="button" onClick={() => onDeleteCategory(c.key)}
                    className="text-[10px] uppercase tracking-widest border border-red-300 text-red-700 px-2 py-1 hover:bg-red-50">
                    Supprimer
                  </button>
                </div>
              );
            })}
            <form onSubmit={onAddCategory} className="flex flex-wrap items-center gap-2 pt-2">
              <input value={newCatKey} onChange={(e) => setNewCatKey(e.target.value)} placeholder="clé (ex: barbe)"
                className="w-32 border border-border bg-ivory px-2 py-1 text-sm" />
              <input value={newCatLabel} onChange={(e) => setNewCatLabel(e.target.value)} placeholder="Nom affiché"
                className="flex-1 min-w-[140px] border border-border bg-ivory px-2 py-1 text-sm" />
              <button type="submit" disabled={!newCatKey.trim()} className="btn-gold btn-gold-hover disabled:opacity-50 text-xs">
                Ajouter
              </button>
            </form>
          </div>
        )}
      </section>

      {/* Filter + list */}
      <section>
        <div className="flex flex-wrap items-center gap-2 pb-3">
          {(["all", ...catKeys, "__none"] as const).map(c => {
            const count = c === "all"
              ? items.length
              : c === "__none"
                ? items.filter(x => !x.category || !catKeys.includes(x.category)).length
                : items.filter(x => x.category === c).length;
            if (c === "__none" && count === 0) return null;
            return (
              <button key={c} onClick={() => setFilterCat(c)}
                className={`px-3 py-1.5 text-xs uppercase tracking-widest border ${
                  filterCat === c ? "bg-gold text-ivory border-gold" : "border-smoke/25 text-smoke hover:border-gold"
                }`}>
                {c === "all" ? "Toutes" : c === "__none" ? "Sans catégorie" : (CAT_LABEL[c] ?? c)} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>



        {loading ? <p className="text-smoke text-sm">…</p> : (() => {
          const renderCard = (it: GalleryItem) => (
            <div key={it.id} className={`border ${it.active ? "border-gold/25" : "border-red-300 opacity-60"} bg-ivory`}>
              <img src={it.url} alt={it.caption_fr || "photo"} className="w-full aspect-square object-cover" />
              <div className="p-2 sm:p-3 space-y-2">
                <select value={it.category ?? ""} onChange={(e) => changeCategory(it, e.target.value)}
                  className="w-full border border-border bg-ivory px-2 py-1 text-xs">
                  <option value="">— Sans catégorie —</option>
                  {catKeys.map(c => <option key={c} value={c}>{CAT_LABEL[c] ?? c}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(it)}
                    className="flex-1 text-[10px] uppercase tracking-widest border border-smoke/30 py-1 hover:border-gold hover:text-gold">
                    {it.active ? "Masquer" : "Afficher"}
                  </button>
                  <button onClick={() => onDelete(it)}
                    className="flex-1 text-[10px] uppercase tracking-widest border border-red-300 text-red-700 py-1 hover:bg-red-50">
                    Suppr.
                  </button>
                </div>
              </div>
            </div>
          );
          if (visible.length === 0) {
            return <p className="text-smoke text-sm">Aucune photo dans cette catégorie.</p>;
          }
          if (filterCat === "all") {
            const uncategorized = items.filter(x => !x.category || !catKeys.includes(x.category));
            return (
              <div className="space-y-8">
                {catKeys.map(cat => {
                  const rows = items.filter(x => x.category === cat);
                  if (rows.length === 0) return null;
                  return (
                    <div key={cat}>
                      <h3 className="font-display text-lg text-ink mb-3 border-b border-gold/20 pb-1">
                        {CAT_LABEL[cat] ?? cat} <span className="text-smoke text-sm">({rows.length})</span>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {rows.map(renderCard)}
                      </div>
                    </div>
                  );
                })}
                {uncategorized.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg text-ink mb-3 border-b border-red-200 pb-1">
                      Sans catégorie <span className="text-smoke text-sm">({uncategorized.length})</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {uncategorized.map(renderCard)}
                    </div>
                  </div>
                )}
              </div>
            );
          }
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {visible.map(renderCard)}
            </div>
          );
        })()}
      </section>
    </div>
  );
}

// ── Clients CRM ─────────────────────────────────────────────────────────────
type ClientRow = {
  phone: string;
  name: string;
  email: string | null;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  lastVisit: string | null;
  lastService: string | null;
  firstSeen: string | null;
  note: string;
  noteUpdatedAt: string | null;
};

// ─── Adjust Booking Modal ─────────────────────────────────────────────────────
function AdjustBookingModal({ booking, onClose, onSaved }: {
  booking: Booking;
  onClose: () => void;
  onSaved: (newDate: string, newTime: string) => void;
}) {
  const adjustFn = useServerFn(adjustBooking);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(booking.booking_date);
  const [time, setTime] = useState(booking.booking_time.slice(0, 5));
  const [sendEmail, setSendEmail] = useState(!!booking.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    const day = new Date(date + "T12:00:00").getDay();
    if (day === 0 || day === 2) { setError("Fermé le mardi et dimanche."); return; }
    setSaving(true); setError("");
    try {
      const token = getToken();
      if (!token) return;
      await adjustFn({ data: { token, id: booking.id, booking_date: date, booking_time: time, send_email: sendEmail } });
      if (sendEmail && booking.email) showEmailToast();
      onSaved(date, time);
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Erreur.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-ink/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-ink text-ivory px-5 py-4 flex justify-between items-center">
          <div>
            <h2 className="font-display text-xl">Modifier le rendez-vous</h2>
            <p className="text-ivory/50 text-xs mt-0.5">{booking.name} · {booking.service}</p>
          </div>
          <button onClick={onClose} className="text-ivory/50 hover:text-ivory text-2xl">×</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Current */}
          <div className="bg-sand/50 border border-border px-3 py-2 text-sm">
            <span className="text-smoke text-xs uppercase tracking-wider">Actuel :</span>
            <span className="ml-2 text-ink font-medium">{booking.booking_date} à {booking.booking_time.slice(0,5)}</span>
          </div>

          {/* New date */}
          <div>
            <label className="text-xs text-smoke uppercase tracking-wider block mb-1">Nouvelle date *</label>
            <input type="date" min={today} value={date}
              onChange={e => { setDate(e.target.value); setError(""); }}
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-gold" />
          </div>

          {/* New time */}
          <div>
            <label className="text-xs text-smoke uppercase tracking-wider block mb-1">Nouvelle heure *</label>
            <select value={time} onChange={e => setTime(e.target.value)}
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white">
              {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Email option */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
              className="w-4 h-4 accent-gold" />
            <span className="text-sm text-ink">
              {booking.email
                ? <>Envoyer un e-mail de confirmation à <span className="text-gold">{booking.email}</span></>
                : <span className="text-smoke italic">Pas d'e-mail (client sans adresse)</span>
              }
            </span>
          </label>
          {!booking.email && (
            <p className="text-xs text-smoke -mt-2">Aucun e-mail enregistré pour ce client.</p>
          )}

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 border border-border text-sm py-2 hover:bg-sand/50">
              Annuler
            </button>
            <button onClick={submit} disabled={saving || !date || !time}
              className="flex-1 bg-gold text-ivory text-sm py-2 hover:bg-gold-deep disabled:opacity-60 font-medium">
              {saving ? "…" : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Booking Modal ──────────────────────────────────────────────────────
const SERVICES_LIST = [
  "Tresses africaines", "Coupes européennes", "Locks & crochet", "Tissages",
  "Chignons & événements", "Colorations", "Perruques & mèches",
  "Pose complète", "Retouche", "Dépose de gel", "Réparation 1 doigt",
  "Pédicure sans tips", "Vernis semi-permanent",
  "Microshading", "Retouche microshading",
];

const TIMES = Array.from({ length: 15 }, (_, i) => {
  const h = Math.floor(i / 2) + 9;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

function AdminBookingModal({ prefill, onClose, onSaved }: {
  prefill?: { name: string; phone: string; email?: string | null };
  onClose: () => void;
  onSaved: () => void;
}) {
  const createFn = useServerFn(createAdminBooking);
  const today = new Date().toISOString().slice(0, 10);
  const [name, setName] = useState(prefill?.name ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!name || !phone || !service || !date || !time) { setError("Tous les champs obligatoires doivent être remplis."); return; }
    const day = new Date(date + "T12:00:00").getDay();
    if (day === 0 || day === 2) { setError("Fermé le mardi et dimanche."); return; }
    setSaving(true); setError("");
    try {
      const token = getToken();
      if (!token) return;
      await createFn({ data: { token, name, phone, email: email || null, service, booking_date: date, booking_time: time, message: message || null } });
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-ink/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-ink text-ivory px-5 py-4 flex justify-between items-center">
          <h2 className="font-display text-xl">Nouveau rendez-vous</h2>
          <button onClick={onClose} className="text-ivory/50 hover:text-ivory text-2xl">×</button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-smoke uppercase tracking-wider">Nom *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom complet"
                className="w-full border border-border px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="text-xs text-smoke uppercase tracking-wider">Téléphone *</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+32 4XX XX XX XX"
                className="w-full border border-border px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gold" />
            </div>
          </div>
          <div>
            <label className="text-xs text-smoke uppercase tracking-wider">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="optionnel"
              className="w-full border border-border px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="text-xs text-smoke uppercase tracking-wider">Service *</label>
            <select value={service} onChange={e => setService(e.target.value)}
              className="w-full border border-border px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gold bg-white">
              <option value="">— Choisir un service —</option>
              {SERVICES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-smoke uppercase tracking-wider">Date *</label>
              <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-border px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="text-xs text-smoke uppercase tracking-wider">Heure *</label>
              <select value={time} onChange={e => setTime(e.target.value)}
                className="w-full border border-border px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gold bg-white">
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-smoke uppercase tracking-wider">Note (optionnel)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2}
              placeholder="Remarques, préférences…"
              className="w-full border border-border px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gold resize-none" />
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-border text-sm py-2 hover:bg-sand/50">Annuler</button>
            <button onClick={submit} disabled={saving}
              className="flex-1 bg-gold text-ivory text-sm py-2 hover:bg-gold-deep disabled:opacity-60 font-medium">
              {saving ? "…" : "Créer le RDV"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Client Modal ──────────────────────────────────────────────────────
function CreateClientModal({ onClose, onCreated, onBookingCreated }: {
  onClose: () => void;
  onCreated: () => void;
  onBookingCreated?: () => void;
}) {
  const [showBooking, setShowBooking] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const createClientFn = useServerFn(createClient);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!name || !phone) { setError("Nom et téléphone obligatoires."); return; }
    setSaving(true); setError("");
    try {
      const token = getToken();
      if (!token) return;
      await createClientFn({ data: { token, phone, name, email: email || null, note: note || undefined } });
      onCreated();
    } catch (e: any) {
      setError(e.message ?? "Erreur.");
      setSaving(false);
      return;
    }
    setSaving(false);
  }

  if (showBooking) {
    return (
      <AdminBookingModal
        prefill={{ name, phone, email }}
        onClose={onClose}
        onSaved={() => { onCreated(); onBookingCreated?.(); }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-ink/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-ink text-ivory px-5 py-4 flex justify-between items-center">
          <h2 className="font-display text-xl">Nouveau client</h2>
          <button onClick={onClose} className="text-ivory/50 hover:text-ivory text-2xl">×</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs text-smoke uppercase tracking-wider">Nom complet *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Prénom Nom"
              className="w-full border border-border px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gold" autoFocus />
          </div>
          <div>
            <label className="text-xs text-smoke uppercase tracking-wider">Téléphone *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+32 4XX XX XX XX"
              className="w-full border border-border px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="text-xs text-smoke uppercase tracking-wider">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="optionnel"
              className="w-full border border-border px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="text-xs text-smoke uppercase tracking-wider">Note privée</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="Préférences, allergies, remarques…"
              className="w-full border border-border px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gold resize-none" />
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-border text-sm py-2 hover:bg-sand/50">Annuler</button>
            <button onClick={async () => { await save(); if (!error) setShowBooking(true); }}
              disabled={saving || !name || !phone}
              className="flex-1 border border-gold text-gold text-sm py-2 hover:bg-gold/5 disabled:opacity-40">
              Créer + RDV
            </button>
            <button onClick={async () => { await save(); if (!error) onClose(); }}
              disabled={saving || !name || !phone}
              className="flex-1 bg-gold text-ivory text-sm py-2 hover:bg-gold-deep disabled:opacity-60 font-medium">
              {saving ? "…" : "Créer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientsView({ onLogout, onBookingCreated }: { onLogout: () => void; onBookingCreated?: () => void }) {
  const list = useServerFn(listClients);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<ClientRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function refresh() {
    const token = getToken();
    if (!token) { onLogout(); return; }
    setLoading(true);
    try {
      const r = await list({ data: { token } });
      setClients(r.clients as ClientRow[]);
    } catch (e) {
      console.error("listClients failed", e);
      onLogout();
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void refresh(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return clients;
    return clients.filter((c) =>
      c.name.toLowerCase().includes(s) ||
      c.phone.toLowerCase().includes(s) ||
      (c.email ?? "").toLowerCase().includes(s) ||
      c.note.toLowerCase().includes(s),
    );
  }, [clients, q]);

  if (loading) return <p className="text-smoke">…</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (nom, téléphone, email, note)"
          className="flex-1 min-w-[220px] bg-white border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold"
        />
        <span className="text-xs text-smoke">{filtered.length} client{filtered.length > 1 ? "s" : ""}</span>
        <button onClick={() => setShowCreate(true)}
          className="bg-gold text-ivory text-sm px-4 py-2 hover:bg-gold-deep transition-colors font-medium whitespace-nowrap">
          + Nouveau client
        </button>
      </div>

      {showCreate && (
        <CreateClientModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); void refresh(); }}
          onBookingCreated={() => { void refresh(); onBookingCreated?.(); }}
        />
      )}

      {filtered.length === 0 ? (
        <p className="text-smoke">Aucun client.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <button
              key={c.phone}
              onClick={() => setSelected(c)}
              className="text-left bg-white border border-border p-4 hover:border-gold transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-ink truncate">{c.name}</div>
                  <div className="text-xs text-smoke truncate">{c.phone}</div>
                  {c.email && <div className="text-xs text-smoke truncate">{c.email}</div>}
                </div>
                {c.note && <span title="Note privée" className="text-lg leading-none">📝</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="px-1.5 py-0.5 bg-sand/60 text-ink">{c.totalBookings} RDV</span>
                {c.completedBookings > 0 && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800">{c.completedBookings} ✓</span>}
                {c.noShowBookings > 0 && <span className="px-1.5 py-0.5 bg-zinc-200 text-zinc-700">{c.noShowBookings} absent</span>}
                {c.cancelledBookings > 0 && <span className="px-1.5 py-0.5 bg-red-100 text-red-700">{c.cancelledBookings} annulé</span>}
              </div>
              {c.lastVisit && (
                <div className="mt-2 text-[11px] text-smoke">
                  Dernier RDV : {c.lastVisit}{c.lastService ? ` · ${c.lastService}` : ""}
                </div>
              )}
              {c.note && (
                <div className="mt-2 text-xs text-ink line-clamp-2 whitespace-pre-wrap">{c.note}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <ClientDetail
          client={selected}
          onClose={() => setSelected(null)}
          onBookingCreated={() => { void refresh(); onBookingCreated?.(); }}
          onSaved={(note) => {
            setClients((prev) => prev.map((x) => x.phone === selected.phone ? { ...x, note, noteUpdatedAt: new Date().toISOString() } : x));
            setSelected((s) => s ? { ...s, note } : s);
          }}
        />
      )}
    </div>
  );
}

function ClientDetail({
  client,
  onClose,
  onSaved,
  onBookingCreated,
}: {
  client: ClientRow;
  onClose: () => void;
  onSaved: (note: string) => void;
  onBookingCreated?: () => void;
}) {
  const save = useServerFn(upsertClientNote);
  const history = useServerFn(getClientHistory);
  const [note, setNote] = useState(client.note);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pastBookings, setPastBookings] = useState<Booking[] | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => { setNote(client.note); }, [client.phone, client.note]);
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    history({ data: { token, phone: client.phone } })
      .then((r) => setPastBookings(r.bookings as Booking[]))
      .catch(() => setPastBookings([]));
  }, [client.phone, history]);

  async function onSave() {
    const token = getToken();
    if (!token) return;
    setSaving(true); setSaved(false);
    try {
      await save({ data: { token, phone: client.phone, note } });
      onSaved(note);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      console.error("saveNote failed", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-ivory max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gold/30" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-start justify-between gap-3 sticky top-0 bg-ivory">
          <div>
            <h2 className="font-display text-xl text-ink">{client.name}</h2>
            <div className="text-sm text-smoke mt-1">
              <a href={`tel:${client.phone}`} className="text-gold hover:underline">{client.phone}</a>
              {client.email && <> · <a href={`mailto:${client.email}`} className="text-gold hover:underline">{client.email}</a></>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowBooking(true)}
              className="bg-gold text-ivory text-xs px-3 py-1.5 hover:bg-gold-deep transition-colors whitespace-nowrap">
              + Nouveau RDV
            </button>
            <button onClick={onClose} className="text-smoke hover:text-ink text-2xl leading-none">×</button>
          </div>
        </div>

        {showBooking && (
          <AdminBookingModal
            prefill={{ name: client.name, phone: client.phone, email: client.email }}
            onClose={() => setShowBooking(false)}
            onSaved={() => {
              setShowBooking(false);
              // Refresh history
              const token = getToken();
              if (token) history({ data: { token, phone: client.phone } })
                .then(r => setPastBookings(r.bookings as Booking[]));
              onBookingCreated?.();
            }}
          />
        )}

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white border border-border p-2 text-center">
              <div className="text-lg font-medium text-ink">{client.totalBookings}</div>
              <div className="text-smoke">Total RDV</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-2 text-center">
              <div className="text-lg font-medium text-emerald-800">{client.completedBookings}</div>
              <div className="text-emerald-700">Terminés</div>
            </div>
            <div className="bg-zinc-100 border border-zinc-300 p-2 text-center">
              <div className="text-lg font-medium text-zinc-700">{client.noShowBookings}</div>
              <div className="text-zinc-600">Absents</div>
            </div>
            <div className="bg-red-50 border border-red-200 p-2 text-center">
              <div className="text-lg font-medium text-red-700">{client.cancelledBookings}</div>
              <div className="text-red-600">Annulés</div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-smoke mb-2">Note privée</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              maxLength={5000}
              placeholder="Préférences, allergies, couleur, historique, remarques…"
              className="w-full bg-white border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold resize-y"
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={onSave}
                disabled={saving}
                className="btn-gold btn-gold-hover text-sm px-4 py-2 disabled:opacity-60"
              >
                {saving ? "…" : "Enregistrer"}
              </button>
              {saved && <span className="text-emerald-700 text-sm">Enregistré ✓</span>}
              {client.noteUpdatedAt && !saved && (
                <span className="text-xs text-smoke">MAJ : {new Date(client.noteUpdatedAt).toLocaleDateString("fr-BE")}</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wider text-smoke mb-2">Historique des RDV</h3>
            {pastBookings === null ? (
              <p className="text-smoke text-sm">…</p>
            ) : pastBookings.length === 0 ? (
              <p className="text-smoke text-sm">Aucun RDV.</p>
            ) : (
              <ul className="space-y-1.5">
                {pastBookings.map((b) => (
                  <li key={b.id} className="bg-white border border-border p-2.5 text-xs flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <div className="text-ink">{b.booking_date} · {b.booking_time.slice(0, 5)}</div>
                      <div className="text-smoke">{b.service}</div>
                    </div>
                    <StatusBadge status={b.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
