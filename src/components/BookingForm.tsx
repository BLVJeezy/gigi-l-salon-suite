// Booking form — 5-step wizard
// Step 1: Kies categorie (Coiffure · Nails · Microshading)
// Step 2: Kies dienst (gefilterd op categorie)
// Step 3: Kies datum
// Step 4: Kies uur
// Step 5: Naam · Email · Telefoon
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/bookings.functions";
import { useT } from "@/lib/i18n";

const TIME_SLOTS = [
  "09:00","10:00","10:30","11:00","11:30","12:00",
  "13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30",
];

// Welke service-index hoort bij welke hoofdcategorie.
// Volgorde van services.items: 0 Tresses, 1 Coupes, 2 Locks, 3 Tissages,
// 4 Chignons, 5 Colorations, 6 Microshading, 7 Ongles&maquillage, 8 Perruques
const CATEGORY_SERVICE_INDICES: Record<string, number[]> = {
  coiffure: [0, 1, 2, 3, 4, 5, 8],
  nails: [7],
  microshading: [6],
};

type CategoryKey = "coiffure" | "nails" | "microshading";
type Step = 1 | 2 | 3 | 4 | 5;
const TOTAL = 5;

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => (
        <div key={n} className="flex items-center gap-1 flex-1">
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
  category, service, date, time, onEdit,
}: {
  category?: string; service?: string; date?: string; time?: string; onEdit: (s: Step) => void;
}) {
  const { t } = useT();
  return (
    <div className="bg-ink border border-gold/20 px-3 py-2.5 text-xs text-ivory/60 flex flex-wrap gap-x-3 gap-y-1 mb-4">
      {category && (
        <button type="button" onClick={() => onEdit(1)} className="text-ivory/50 hover:text-ivory hover:underline">{category}</button>
      )}
      {service && (
        <button type="button" onClick={() => onEdit(2)} className="text-gold hover:underline">{service}</button>
      )}
      {date && (
        <button type="button" onClick={() => onEdit(3)} className="hover:text-ivory hover:underline">{date}</button>
      )}
      {time && (
        <button type="button" onClick={() => onEdit(4)} className="hover:text-ivory hover:underline">{time}</button>
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

  const [category, setCategory] = useState<CategoryKey | "">("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  // Hoofdcategorieën — alleen titel, geen uitleg
  const categories: { key: CategoryKey; label: string }[] = [
    { key: "coiffure", label: t.form.categories.coiffure },
    { key: "nails", label: t.form.categories.nails },
    { key: "microshading", label: t.form.categories.microshading },
  ];

  // Services gefilterd op gekozen categorie
  const filteredServices = category
    ? CATEGORY_SERVICE_INDICES[category].map((i) => t.services.items[i]?.t).filter(Boolean)
    : [];

  const categoryLabel = categories.find((c) => c.key === category)?.label;

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

      {/* ── STAP 1 — Kies categorie ── */}
      {step === 1 && (
        <div className="space-y-4">
          <Label>{t.form.categoryLabel} *</Label>
          <div className="flex flex-col gap-3">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setCategory(c.key);
                  setService(""); // reset eventuele eerdere dienstkeuze
                  setStep(2);
                }}
                className={`w-full text-center px-4 py-5 text-base font-display tracking-wide border transition-colors ${
                  category === c.key
                    ? "bg-gold text-ink border-gold"
                    : "bg-ink border-gold/30 text-ivory hover:border-gold hover:bg-gold/5"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STAP 2 — Kies dienst (gefilterd) ── */}
      {step === 2 && (
        <div className="space-y-4">
          <SummaryPill category={categoryLabel} onEdit={setStep} />
          <Label>{t.form.service} *</Label>
          <div className="flex flex-col gap-2">
            {filteredServices.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setService(s as string); setStep(3); }}
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

      {/* ── STAP 3 — Kies datum ── */}
      {step === 3 && (
        <div className="space-y-4">
          <SummaryPill category={categoryLabel} service={service} onEdit={setStep} />
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
            onClick={() => setStep(4)}
            className="btn-gold btn-gold-hover w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.form.next ?? "Volgende →"}
          </button>
        </div>
      )}

      {/* ── STAP 4 — Kies uur ── */}
      {step === 4 && (
        <div className="space-y-4">
          <SummaryPill category={categoryLabel} service={service} date={date} onEdit={setStep} />
          <div>
            <Label>{t.form.time} *</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => { setTime(slot); setStep(5); }}
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

      {/* ── STAP 5 — Naam · Email · Telefoon ── */}
      {step === 5 && (
        <form onSubmit={handleFinalSubmit} className="space-y-4">
          <SummaryPill category={categoryLabel} service={service} date={date} time={time} onEdit={setStep} />

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
