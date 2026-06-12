// Admin dashboard — password-gated via signed token (sessionStorage).
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  adminLogin, adminCheck, listBookings, updateBookingStatus, sendTestEmail,
} from "@/lib/admin.functions";
import {
  listServices, updateService, addService, deleteService, type ServiceItem,
} from "@/lib/services.functions";
import { LangProvider, useT } from "@/lib/i18n";

const TOKEN_KEY = "gigil_admin_token";
const getToken = () => (typeof window === "undefined" ? null : sessionStorage.getItem(TOKEN_KEY));
const setToken = (t: string) => sessionStorage.setItem(TOKEN_KEY, t);
const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "GiGi L — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <LangProvider>
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
  message: string | null;
  lang: string;
  status: "new" | "confirmed" | "cancelled";
};

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
  const { text, photoUrl } = parseMessage(message);
  if (!text && !photoUrl) return <span className={dark ? "text-ink" : "text-smoke"}>—</span>;
  return (
    <div className="space-y-1.5">
      {text && <div className={`text-xs whitespace-pre-wrap ${dark ? "text-ink" : "text-smoke"}`}>{text}</div>}
      {photoUrl && (
        <a href={photoUrl} target="_blank" rel="noopener noreferrer"
          className="inline-block border border-gold/40 hover:border-gold transition-colors">
          <img src={photoUrl} alt="Referentiefoto" className="h-20 w-20 object-cover" />
        </a>
      )}
    </div>
  );
}

function AdminPage() {
  const check = useServerFn(adminCheck);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { setAuthed(false); return; }
    check({ data: { token } }).then(r => setAuthed(r.authenticated)).catch(() => setAuthed(false));
  }, [check]);

  if (authed === null) return <div className="min-h-screen bg-ink text-ivory flex items-center justify-center">…</div>;
  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => { clearToken(); setAuthed(false); }} />;
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

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { t } = useT();
  const list = useServerFn(listBookings);
  const update = useServerFn(updateBookingStatus);
  const testEmail = useServerFn(sendTestEmail);
  const [testing, setTesting] = useState(false);

  async function doTestEmail() {
    const token = getToken();
    if (!token) { onLogout(); return; }
    const to = window.prompt("Verstuur testmail naar:", "jasonbalongo@gmail.com");
    if (!to) return;
    setTesting(true);
    try {
      await testEmail({ data: { token, to } });
      window.alert(`✓ Testmail verzonden naar ${to}`);
    } catch (e) {
      window.alert("✗ Mislukt: " + (e instanceof Error ? e.message : "onbekende fout"));
    } finally {
      setTesting(false);
    }
  }

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"leads" | "day" | "week" | "diensten">("leads");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) { onLogout(); return; }
    try {
      const r = await list({ data: { token } });
      setBookings(r.bookings as Booking[]);
    } catch (e) {
      console.error("listBookings failed", e);
      onLogout();
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void refresh(); /* eslint-disable-next-line */ }, []);

  const newCount = bookings.filter(b => b.status === "new").length;

  async function setStatus(id: string, status: "confirmed" | "cancelled") {
    const token = getToken();
    if (!token) { onLogout(); return; }
    await update({ data: { token, id, status } });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  async function doLogout() { onLogout(); }

  return (
    <div className="min-h-screen bg-ivory">
      <header className="bg-ink text-ivory border-b border-gold/20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl sm:text-2xl">{t.admin.title}</h1>
            {newCount > 0 && (
              <span className="bg-gold text-ink text-xs font-medium px-2 py-0.5 uppercase tracking-wider">
                {newCount} {t.admin.newBadge}
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={doTestEmail} disabled={testing} className="btn-gold-outline text-xs px-3 py-2 disabled:opacity-50">
              {testing ? "…" : "Test email"}
            </button>
            <button onClick={refresh} className="btn-gold-outline text-xs px-3 py-2">{t.admin.refresh}</button>
            <button onClick={doLogout} className="btn-gold-outline text-xs px-3 py-2">{t.admin.logout}</button>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-5 sm:px-8 flex gap-1 overflow-x-auto scrollbar-none">
          {(["leads", "day", "week", "diensten"] as const).map(k => (
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
        {!loading && tab === "leads" && <LeadsTable bookings={bookings} setStatus={setStatus} />}
        {!loading && tab === "day" && <DayView bookings={bookings} />}
        {!loading && tab === "week" && <WeekView bookings={bookings} />}
        {tab === "diensten" && <ServicesView onLogout={onLogout} />}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const { t } = useT();
  const map = {
    new: "bg-gold/20 text-gold-deep border border-gold",
    confirmed: "bg-green-100 text-green-800 border border-green-300",
    cancelled: "bg-red-100 text-red-700 border border-red-300 line-through",
  } as const;
  return <span className={`text-xs uppercase tracking-wider px-2 py-1 ${map[status]}`}>{t.admin.status[status]}</span>;
}

function LeadsTable({ bookings, setStatus }: { bookings: Booking[]; setStatus: (id: string, s: "confirmed" | "cancelled") => void }) {
  const { t } = useT();
  if (bookings.length === 0) return <p className="text-smoke">{t.admin.empty}</p>;
  return (
    <>
      {/* Mobile + tablet: card list */}
      <div className="lg:hidden space-y-3">
        {bookings.map(b => (
          <div key={b.id} className="bg-card border border-border p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <div className="font-medium text-ink truncate">{b.name}</div>
                <div className="text-xs text-smoke">{new Date(b.created_at).toLocaleString()}</div>
              </div>
              <StatusBadge status={b.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-3 text-sm">
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-wider text-smoke">Service</div>
                <div className="text-ink">{b.service}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-smoke">Date</div>
                <div className="text-ink">{b.booking_date}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-smoke">Heure</div>
                <div className="text-gold font-medium">{b.booking_time.slice(0,5)}</div>
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
              <a href={`tel:${b.phone}`} className="flex-1 min-w-[100px] text-center text-xs px-3 py-2 border border-gold text-gold-deep">📞 Call</a>
              {b.status !== "confirmed" && (
                <button onClick={() => setStatus(b.id, "confirmed")} className="flex-1 min-w-[100px] text-xs px-3 py-2 bg-green-600 text-white hover:bg-green-700">{t.admin.actions.confirm}</button>
              )}
              {b.status !== "cancelled" && (
                <button onClick={() => setStatus(b.id, "cancelled")} className="flex-1 min-w-[100px] text-xs px-3 py-2 bg-red-600 text-white hover:bg-red-700">{t.admin.actions.cancel}</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden lg:block overflow-x-auto bg-card border border-border">
        <table className="w-full text-sm">
          <thead className="bg-sand text-ink text-xs uppercase tracking-wider">
            <tr>
              <Th>Client</Th><Th>Service</Th><Th>Date / Heure</Th><Th>Contact</Th><Th>Message</Th><Th>Status</Th><Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map(b => (
              <tr key={b.id} className="align-top">
                <Td><div className="font-medium text-ink">{b.name}</div><div className="text-xs text-smoke">{new Date(b.created_at).toLocaleString()}</div></Td>
                <Td>{b.service}</Td>
                <Td>
                  <div>{b.booking_date}</div>
                  <div className="text-gold font-medium">{b.booking_time.slice(0,5)}</div>
                </Td>
                <Td>
                  <a href={`tel:${b.phone}`} className="text-ink hover:text-gold block">{b.phone}</a>
                  {b.email && <a href={`mailto:${b.email}`} className="text-xs text-smoke hover:text-gold">{b.email}</a>}
                </Td>
                <Td><div className="max-w-xs"><BookingMessage message={b.message} /></div></Td>
                <Td><StatusBadge status={b.status} /></Td>
                <Td>
                  {b.status !== "confirmed" && (
                    <button onClick={() => setStatus(b.id, "confirmed")} className="text-xs px-2 py-1 mr-1 bg-green-600 text-white hover:bg-green-700">{t.admin.actions.confirm}</button>
                  )}
                  {b.status !== "cancelled" && (
                    <button onClick={() => setStatus(b.id, "cancelled")} className="text-xs px-2 py-1 bg-red-600 text-white hover:bg-red-700">{t.admin.actions.cancel}</button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const Th = ({ children }: { children?: React.ReactNode }) => <th className="text-left px-4 py-3">{children}</th>;
const Td = ({ children }: { children?: React.ReactNode }) => <td className="px-4 py-3">{children}</td>;

const HOURS = Array.from({ length: 10 }, (_, i) => 9 + i); // 09..18

function DayView({ bookings }: { bookings: Booking[] }) {
  const { t } = useT();
  const [day, setDay] = useState<string>(new Date().toISOString().slice(0, 10));
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
                {slot.map(b => (
                  <div key={b.id} className={`px-3 py-2 text-xs border ${b.status === "confirmed" ? "bg-green-100 border-green-300" : "bg-gold/15 border-gold"}`}>
                    <div className="font-medium">{b.booking_time.slice(0,5)} — {b.name}</div>
                    <div className="text-smoke">{b.service}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fmtISO(d: Date) { return d.toISOString().slice(0, 10); }

function WeekView({ bookings }: { bookings: Booking[] }) {
  const { t } = useT();
  const [anchor, setAnchor] = useState<Date>(new Date());
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
                  <div className="text-[10px] uppercase tracking-wider text-smoke">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
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
                <div className="text-xs uppercase tracking-wider text-smoke">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                <div className="font-display text-lg">{d.getDate()}/{d.getMonth() + 1}</div>
                <div className="text-xs text-gold">{list.length}</div>
              </div>
              <div className="p-2 space-y-1.5">
                {list.sort((a,b) => a.booking_time.localeCompare(b.booking_time)).map(b => (
                  <div key={b.id} className={`px-2 py-1.5 text-xs border ${b.status === "confirmed" ? "bg-green-100 border-green-300" : "bg-gold/15 border-gold"}`}>
                    <div className="font-medium">{b.booking_time.slice(0,5)}</div>
                    <div className="truncate">{b.name}</div>
                    <div className="text-smoke truncate">{b.service}</div>
                  </div>
                ))}
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
        />
      )}
    </div>
  );
}

function DayDetailsModal({ iso, bookings, onClose }: { iso: string; bookings: Booking[]; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const d = new Date(iso + "T00:00:00");
  const title = d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/60" onClick={onClose}>
      <div
        className="bg-ivory w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col border border-gold/30 sm:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-ink text-ivory px-5 py-4 flex items-start justify-between gap-3 border-b border-gold/30">
          <div className="min-w-0">
            <div className="font-display text-lg sm:text-xl capitalize truncate">{title}</div>
            <div className="text-xs text-ivory/60 uppercase tracking-wider mt-0.5">
              {bookings.length} {bookings.length === 1 ? "rendez-vous" : "rendez-vous"}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="text-ivory/80 hover:text-gold text-2xl leading-none shrink-0">×</button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5 space-y-3">
          {bookings.length === 0 && <p className="text-smoke text-center py-8">Aucun rendez-vous</p>}
          {bookings.map(b => (
            <div key={b.id} className={`border p-4 ${b.status === "cancelled" ? "bg-red-50 border-red-200 opacity-60" : b.status === "confirmed" ? "bg-green-50 border-green-300" : "bg-gold/10 border-gold"}`}>
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <div className="text-center shrink-0">
                  <div className="font-display text-2xl text-gold-deep leading-none">{b.booking_time.slice(0,5)}</div>
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
                Reçu le {new Date(b.created_at).toLocaleString()}
              </div>
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
function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} u` : `${h} u ${m} min`;
}

function ServicesView({ onLogout }: { onLogout: () => void }) {
  const list = useServerFn(listServices);
  const update = useServerFn(updateService);
  const add = useServerFn(addService);
  const del = useServerFn(deleteService);

  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    const token = getToken();
    if (!token) { onLogout(); return; }
    setLoading(true);
    try { setItems((await list({ data: { token } })).services); }
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
    if (!window.confirm("Dienst verwijderen?")) return;
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
        Stel per dienst de duur (in minuten) en de prijs (in euro) in. Laat de prijs leeg voor "op aanvraag".
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
        <button onClick={() => onRemove(item.id)} aria-label="Verwijderen"
          className="text-smoke hover:text-red-600 text-lg leading-none flex-shrink-0">×</button>
      </div>
      <div className="flex items-end gap-3">
        {/* Duration */}
        <label className="flex-1">
          <span className="block text-[10px] uppercase tracking-wider text-smoke mb-1">Duur (min)</span>
          <input type="number" inputMode="numeric" min={0} step={5} value={dur}
            onChange={e => setDur(e.target.value)}
            className="w-full border border-border rounded px-2.5 py-2 text-sm focus:outline-none focus:border-gold" />
        </label>
        {/* Price */}
        <label className="flex-1">
          <span className="block text-[10px] uppercase tracking-wider text-smoke mb-1">Prijs (€)</span>
          <input type="number" inputMode="decimal" min={0} step="0.5" value={price} placeholder="op aanvraag"
            onChange={e => setPrice(e.target.value)}
            className="w-full border border-border rounded px-2.5 py-2 text-sm focus:outline-none focus:border-gold" />
        </label>
        {/* Save */}
        <button onClick={save} disabled={!dirty || saving}
          className={`px-3 py-2 text-xs uppercase tracking-wider rounded transition-colors flex-shrink-0 ${
            dirty ? "bg-gold text-ink hover:bg-gold/90" : "bg-sand text-smoke cursor-default"
          } disabled:opacity-50`}>
          {saving ? "…" : dirty ? "Opslaan" : "✓"}
        </button>
      </div>
      <p className="text-[11px] text-smoke mt-2">
        {formatDuration(item.duration_min)}
        {item.price_cents !== null ? ` · € ${formatPrice(item.price_cents)}` : " · op aanvraag"}
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
        + Dienst toevoegen
      </button>
    );
  }

  return (
    <div className="mt-2 bg-sand/50 border border-border rounded-lg p-3.5 space-y-3">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Naam van de dienst" autoFocus
        className="w-full border border-border rounded px-2.5 py-2 text-sm focus:outline-none focus:border-gold" />
      <div className="flex gap-3">
        <label className="flex-1">
          <span className="block text-[10px] uppercase tracking-wider text-smoke mb-1">Duur (min)</span>
          <input type="number" inputMode="numeric" min={0} step={5} value={dur} onChange={e => setDur(e.target.value)}
            className="w-full border border-border rounded px-2.5 py-2 text-sm focus:outline-none focus:border-gold" />
        </label>
        <label className="flex-1">
          <span className="block text-[10px] uppercase tracking-wider text-smoke mb-1">Prijs (€)</span>
          <input type="number" inputMode="decimal" min={0} step="0.5" value={price} placeholder="op aanvraag" onChange={e => setPrice(e.target.value)}
            className="w-full border border-border rounded px-2.5 py-2 text-sm focus:outline-none focus:border-gold" />
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy || !name.trim()}
          className="btn-gold btn-gold-hover flex-1 py-2 text-sm disabled:opacity-50">
          {busy ? "…" : "Toevoegen"}
        </button>
        <button onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm text-smoke border border-border rounded hover:border-gold">
          Annuleren
        </button>
      </div>
    </div>
  );
}
