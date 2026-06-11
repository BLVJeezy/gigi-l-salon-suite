// Booking form — 4-step wizard
// Step 1: Kies dienst
// Step 2: Kies datum
// Step 3: Kies uur
// Step 4: Naam · Email · Telefoon
// POSTs via createBooking server fn (unchanged).
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/bookings.functions";
import { useT } from "@/lib/i18n";

const TIME_SLOTS = [
  "09:00","10:00","10:30","11:00","11:30","12:00",
  "13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30",
];

type Step = 1 | 2 | 3 | 4;
const TOTAL = 4;

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => (
        <div key={n} className="flex items-center gap-1.5 flex-1">
          <div
            className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              n < current
                ? "bg-gold/60 text-ink"
                : n === current
                ? "bg-gold text-ink"
                : "bg-white/10 text-ivory/30"
            }`}
          >
            {n < current ? "✓" : n}
          </div>
          {n < TOTAL && (
            <div className={`h-px flex-1 transition-colors ${n < current ? "bg-gold/40" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Summary pill ─────────────────────────────────────────────────────────────
function SummaryPill({
  service, date, time, onEdit,
}: {
  service?: string; date?: string; time?: string; onEdit: (s: Step) => void;
}) {
  const { t } = useT();
  return (
    <div className="bg-ink border border-gold/20 px-3 py-2.5 text-xs text-ivory/60 flex flex-wrap gap-x-3 gap-y-1 mb-4">
      {service && (
        <button type="button" onClick={() => onEdit(1)} className="text-gold hover:underline">{service}</button>
      )}
      {date && (
        <button type="button" onClick={() => onEdit(2)} className="hover:text-ivory hover:underline">{date}</button>
      )}
      {time && (
        <button type="button" onClick={() => onEdit(3)} className="hover:text-ivory hover:underline">{time}</button>
      )}
      <span className="ml-auto text-ivory/30">{t.form.edit ?? "Wijzigen"}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function BookingForm() {
  const { t, lang } = useT();
  const submit = useServerFn(createBooking);

  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const serviceOptions = t.services.items.map((s) => s.t);

  async function handleFinalSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      await submit({
        data: { name, phone, email, service, booking_date: date, booking_time: time, message: "", lang },
      });
      setStatus("ok");
    } catch (err) {
      console.error(err);
      setStatus("err");
    }
  }

  // ── Success ──
  if (status === "ok") {
    return (
      <div className="bg-carbon border border-gold/40 p-8 text-center">
        <div className="text-gold text-4xl font-display mb-3">✓</div>
        <p className="font-display text-ivory text-xl mb-2">{t.form.success}</p>
        <a href="tel:+32484164905" className="text-gold text-sm tracking-wider hover:underline">
          +32 484 16 49 05
        </a>
      </div>
    );
  }

  return (
    <div className="bg-carbon border border-gold/30 p-6 sm:p-7">
      <h3 className="font-display text-ivory text-2xl mb-1">{t.form.title}</h3>
      <StepBar current={step} />

      {/* ── STAP 1 — Kies dienst ── */}
      {step === 1 && (
        <div className="space-y-4">
          <Label>{t.form.service} *</Label>
          <div className="flex flex-col gap-2">
            {serviceOptions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setService(s); setStep(2); }}
                className={`w-full text-left px-4 py-3 text-sm border transition-colors ${
                  service === s
                    ? "bg-gold text-ink border-gold font-medium"
                    : "bg-ink border-gold/20 text-ivory/80 hover:border-gold/60 hover:text-ivory"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STAP 2 — Kies datum ── */}
      {step === 2 && (
        <div className="space-y-4">
          <SummaryPill service={service} onEdit={setStep} />
          <div>
            <Label>{t.form.date} *</Label>
            <input
              type="date"
              required
              min={today}
              value={date}
              autoFocus
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <button
            type="button"
            disabled={!date}
            onClick={() => setStep(3)}
            className="btn-gold btn-gold-hover w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.form.next ?? "Volgende →"}
          </button>
        </div>
      )}

      {/* ── STAP 3 — Kies uur ── */}
      {step === 3 && (
        <div className="space-y-4">
          <SummaryPill service={service} date={date} onEdit={setStep} />
          <div>
            <Label>{t.form.time} *</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => { setTime(slot); setStep(4); }}
                  className={`py-2.5 text-xs tracking-wider border transition-colors ${
                    time === slot
                      ? "bg-gold text-ink border-gold font-medium"
                      : "bg-ink border-gold/20 text-ivory/70 hover:border-gold/60 hover:text-ivory"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STAP 4 — Naam · Email · Telefoon ── */}
      {step === 4 && (
        <form onSubmit={handleFinalSubmit} className="space-y-4">
          <SummaryPill service={service} date={date} time={time} onEdit={setStep} />

          <Field label={t.form.name} value={name} onChange={setName} required autoFocus />
          <Field label={t.form.email} value={email} onChange={setEmail} type="email" />
          <Field label={t.form.phone} value={phone} onChange={setPhone} type="tel" required />

          <button
            type="submit"
            disabled={status === "sending" || !name || !phone}
            className="btn-gold btn-gold-hover w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "sending" ? t.form.sending : t.form.submit}
          </button>

          {status === "err" && <p className="text-red-400 text-xs">{t.form.error}</p>}

          <p className="text-center text-ivory/50 text-xs pt-1">
            <a
              href="https://gigilcoiffure.be/rdv/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold underline underline-offset-2"
            >
              {t.form.onlineLink}
            </a>
          </p>
        </form>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const inputCls =
  "w-full bg-ink border border-gold/20 text-ivory px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-ivory/70 text-xs tracking-wider uppercase mb-1.5">
      {children}
    </label>
  );
}

function Field({
  label, value, onChange, type = "text", required = false, autoFocus = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <Label>{label}{required && " *"}</Label>
      <input
        type={type}
        required={required}
        value={value}
        autoFocus={autoFocus}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </div>
  );
}
