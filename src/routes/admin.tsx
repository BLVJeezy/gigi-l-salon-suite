// Admin dashboard — password-gated via signed token (sessionStorage).
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  adminLogin, adminCheck, listBookings, updateBookingStatus,
} from "@/lib/admin.functions";
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
      if (res.ok) onSuccess(); else setErr(true);
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
  const logout = useServerFn(adminLogout);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"leads" | "day" | "week">("leads");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await list();
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
    await update({ data: { id, status } });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  async function doLogout() { await logout(); onLogout(); }

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
          <div className="flex gap-2">
            <button onClick={refresh} className="btn-gold-outline text-xs px-3 py-2">{t.admin.refresh}</button>
            <button onClick={doLogout} className="btn-gold-outline text-xs px-3 py-2">{t.admin.logout}</button>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-5 sm:px-8 flex gap-1">
          {(["leads", "day", "week"] as const).map(k => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-3 text-sm uppercase tracking-wider border-b-2 transition-colors ${
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
    <div className="overflow-x-auto bg-card border border-border">
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
              <Td><div className="max-w-xs text-xs text-smoke whitespace-pre-wrap">{b.message ?? "—"}</div></Td>
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

function WeekView({ bookings }: { bookings: Booking[] }) {
  const { t } = useT();
  const [anchor, setAnchor] = useState<Date>(new Date());
  const monday = new Date(anchor);
  const day = (monday.getDay() + 6) % 7; // 0 = Monday
  monday.setDate(monday.getDate() - day);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(d.getDate() + i);
    return d;
  });
  const visible = bookings.filter(b => b.status !== "cancelled");
  const shift = (n: number) => { const d = new Date(anchor); d.setDate(d.getDate() + n * 7); setAnchor(d); };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => shift(-1)} className="px-3 py-1 border border-border">←</button>
        <button onClick={() => setAnchor(new Date())} className="px-3 py-1 border border-border text-sm">{t.admin.today}</button>
        <button onClick={() => shift(1)} className="px-3 py-1 border border-border">→</button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-border border border-border overflow-x-auto">
        {days.map(d => {
          const iso = d.toISOString().slice(0, 10);
          const dayBookings = visible.filter(b => b.booking_date === iso);
          return (
            <div key={iso} className="bg-card min-h-[260px] min-w-[140px]">
              <div className="bg-sand px-3 py-2 text-center">
                <div className="text-xs uppercase tracking-wider text-smoke">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                <div className="font-display text-lg">{d.getDate()}/{d.getMonth() + 1}</div>
                <div className="text-xs text-gold">{dayBookings.length}</div>
              </div>
              <div className="p-2 space-y-1.5">
                {dayBookings.sort((a,b) => a.booking_time.localeCompare(b.booking_time)).map(b => (
                  <div key={b.id} className={`px-2 py-1.5 text-xs border ${b.status === "confirmed" ? "bg-green-100 border-green-300" : "bg-gold/15 border-gold"}`}>
                    <div className="font-medium">{b.booking_time.slice(0,5)}</div>
                    <div className="truncate">{b.name}</div>
                    <div className="text-smoke truncate">{b.service}</div>
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
