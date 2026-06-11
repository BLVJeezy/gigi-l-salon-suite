// Booking form — 3-step wizard embedded in the hero.
// Step 1: Service → Date → Time
// Step 2: Name · Email · Phone
// Step 3: Success
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

type Step = 1 | 2;

// ─── Step indicator ────────────────────────────────────────────────────────
function StepDots({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {([1, 2] as Step[]).map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              n === current
                ? "bg-gold text-ink"
                : n < current
                ? "bg-gold/40 text-ink"
                : "bg-white/10 text-ivory/40"
            }`}
          >
            {n < current ? "✓" : n}
          </div>
          {n < 2 && <div className={`h-px w-8 ${n < current ? "bg-gold/60" : "bg-white/10"}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export function BookingForm() {
  const { t, lang } = useT();
  const submit = useServerFn(createBooking);

  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  // Form values
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const serviceOptions = t.services.items.map((s) => s.t);

  // ── Step 1 submit ──
  function handleStep1(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep(2);
  }

  // ── Step 2 submit → send to server ──
  async function handleStep2(e: FormEvent<HTMLFormElement>) {
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

  // ── Success screen ──
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
      <StepDots current={step} />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          {/* Service */}
          <div>
            <Label>{t.form.service} *</Label>
            <select
              required
              value={service}
              onChange={(e) => setService(e.target.value)}
              className={inputCls}
            >
              <option value="">{t.form.servicePlaceholder}</option>
              {serviceOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <Label>{t.form.date} *</Label>
            <input
              type="date"
              required
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Time slots */}
          <div>
            <Label>{t.form.time} *</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={`py-2 text-xs tracking-wider border transition-colors ${
                    time === slot
                      ? "bg-gold text-ink border-gold font-medium"
                      : "bg-ink border-gold/20 text-ivory/70 hover:border-gold/60 hover:text-ivory"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            {/* hidden input so form validation can require a time */}
            <input type="hidden" name="booking_time" value={time} required />
          </div>

          <button
            type="submit"
            disabled={!service || !date || !time}
            className="btn-gold btn-gold-hover w-full disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {t.form.next ?? "Suivant →"}
          </button>
        </form>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4">
          {/* Summary pill */}
          <div className="bg-ink border border-gold/20 px-4 py-3 text-xs text-ivory/60 flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-gold">{service}</span>
            <span>{date}</span>
            <span>{time}</span>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="ml-auto text-ivory/40 hover:text-gold underline underline-offset-2"
            >
              {t.form.edit ?? "Modifier"}
            </button>
          </div>

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

// ─── Shared helpers ──────────────────────────────────────────────────────────
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
