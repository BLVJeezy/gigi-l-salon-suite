// Booking form — dynamic multi-step wizard with a small back button.
//
// Flow:
//   1. Category: Coiffure / Nails / Microshading
//   2. Service (list depends on category)
//   3. [Nails: Pose complète / Retouche only] Hands / Feet / Both
//   4. [Nails: Pose complète / Retouche only] Photo? → optional upload
//   5. Date
//   6. Time
//   7. Name · Email · Phone
//
// Extra answers (zone, photo URL) are folded into the booking `message` field.
import { useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/bookings.functions";
import { uploadBookingPhoto } from "@/lib/upload.functions";
import { useT } from "@/lib/i18n";

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30",
];

type CategoryKey = "coiffure" | "nails" | "microshading";

// Coiffure services come from the i18n services list (by index).
// Volgorde: 0 Tresses, 1 Coupes, 2 Locks, 3 Tissages, 4 Chignons, 5 Colorations, 8 Perruques
const COIFFURE_SERVICE_INDICES = [0, 1, 2, 3, 4, 5, 8];

// Internal step ids — we navigate a dynamic list, not fixed numbers.
type StepId = "category" | "service" | "zone" | "photo" | "date" | "time" | "details";

export function BookingForm({ compact = false }: { compact?: boolean }) {
  const { t, lang } = useT();
  const submit = useServerFn(createBooking);
  const upload = useServerFn(uploadBookingPhoto);
  const fileRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  const [category, setCategory] = useState<CategoryKey | "">("");
  const [service, setService] = useState("");
  const [zone, setZone] = useState("");          // "hands" | "feet" | "both"
  const [photoUrl, setPhotoUrl] = useState("");   // uploaded URL
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const categories: { key: CategoryKey; label: string }[] = [
    { key: "coiffure", label: t.form.categories.coiffure },
    { key: "nails", label: t.form.categories.nails },
    { key: "microshading", label: t.form.categories.microshading },
  ];

  // Service options per category
  const nailsServices = t.form.nails.services;     // array of strings
  const microServices = t.form.microshading.services;
  const coiffureServices = COIFFURE_SERVICE_INDICES.map((i) => t.services.items[i]?.t).filter(Boolean) as string[];

  const serviceOptions =
    category === "nails" ? nailsServices :
    category === "microshading" ? microServices :
    category === "coiffure" ? coiffureServices : [];

  // Does this nails service need the zone + photo questions?
  // Pose complète (index 0) and Retouche (index 1) of nails.
  const nailsNeedsZone =
    category === "nails" && (service === nailsServices[0] || service === nailsServices[1]);

  // Build the dynamic step order based on current answers.
  const steps: StepId[] = ["category", "service"];
  if (nailsNeedsZone) steps.push("zone", "photo");
  steps.push("date", "time", "details");

  const [stepIndex, setStepIndex] = useState(0);
  const current = steps[Math.min(stepIndex, steps.length - 1)];
  const total = steps.length;

  function goNext() { setStepIndex((i) => Math.min(i + 1, steps.length - 1)); }
  function goBack() { setStepIndex((i) => Math.max(i - 1, 0)); }

  // When category/service changes the step list can shrink — clamp index.
  function pickCategory(c: CategoryKey) {
    setCategory(c); setService(""); setZone(""); setPhotoUrl("");
    setStepIndex(1);
  }
  function pickService(s: string) {
    setService(s); setZone(""); setPhotoUrl("");
    setStepIndex(2);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr("");
    if (file.size > 6_000_000) { setUploadErr(t.form.photo.tooLarge); return; }
    setUploading(true);
    try {
      const dataUrl: string = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = () => rej(new Error("read failed"));
        r.readAsDataURL(file);
      });
      const { url } = await upload({ data: { dataUrl, filename: file.name } });
      setPhotoUrl(url);
    } catch {
      setUploadErr(t.form.photo.failed);
    } finally {
      setUploading(false);
    }
  }

  function buildMessage() {
    const parts: string[] = [];
    if (zone) parts.push(`${t.form.zone.label}: ${t.form.zone[zone as "hands" | "feet" | "both"]}`);
    if (photoUrl) parts.push(`${t.form.photo.label}: ${photoUrl}`);
    return parts.join(" · ");
  }

  async function handleFinalSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      await submit({
        data: {
          name, phone, email, service,
          booking_date: date, booking_time: time,
          message: buildMessage(), lang,
        },
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

  const categoryLabel = categories.find((c) => c.key === category)?.label;

  return (
    <div className="relative">
      {/* Only header + progress bar get a dark backdrop */}
      <div className={`bg-carbon/80 backdrop-blur-sm border border-gold/30 ${compact ? "px-4 pt-4 pb-3" : "px-6 pt-6 pb-4 sm:px-7 sm:pt-7"}`}>
        {/* Header row: title + back button */}
        <div className="flex items-center gap-3 mb-3">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              aria-label={t.form.back}
              className="w-7 h-7 flex-shrink-0 flex items-center justify-center border border-gold/30 text-ivory hover:border-gold hover:bg-gold/10 transition-colors"
            >
              ←
            </button>
          )}
          <h3 className={`font-display text-ivory ${compact ? "text-lg" : "text-2xl"}`}>{t.form.title}</h3>
        </div>

        <ProgressBar index={stepIndex} total={total} />

        {/* Summary pill (shows from step 2 on) */}
        {stepIndex > 0 && (
          <div className="bg-ink border border-gold/20 px-3 py-2.5 text-xs text-ivory/60 flex flex-wrap gap-x-3 gap-y-1 mt-4">
            {categoryLabel && <span className="text-ivory/50">{categoryLabel}</span>}
            {service && <span className="text-gold">{service}</span>}
            {zone && <span>{t.form.zone[zone as "hands" | "feet" | "both"]}</span>}
            {photoUrl && <span className="text-green-400">📷</span>}
            {date && <span>{date}</span>}
            {time && <span>{time}</span>}
          </div>
        )}
      </div>{/* closes header backdrop */}

      {/* Steps — transparent background, buttons keep their own bg */}

      {/* ── CATEGORY ── */}
      {current === "category" && (
        <div className="space-y-4">
          <Label>{t.form.categoryLabel} *</Label>
          <style>{`
            @keyframes shimmer {
              0%   { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            .cat-btn-shimmer {
              background-image: linear-gradient(
                105deg,
                transparent 35%,
                rgba(255,255,255,0.07) 45%,
                rgba(255,255,255,0.13) 50%,
                rgba(255,255,255,0.07) 55%,
                transparent 65%
              );
              background-size: 200% 100%;
              animation: shimmer 8s ease-in-out infinite;
            }
            .cat-btn-shimmer:nth-child(2) { animation-delay: 2.5s; }
            .cat-btn-shimmer:nth-child(3) { animation-delay: 5s; }
          `}</style>
          <div className="flex flex-col gap-3">
            {categories.map((c) => (
              <button key={c.key} type="button" onClick={() => pickCategory(c.key)}
                className={`cat-btn-shimmer w-full text-center border transition-colors font-display tracking-wide ${
                  compact ? "px-3 py-3 text-sm" : "px-4 py-5 text-base"
                } ${
                  category === c.key ? "bg-gold text-ivory border-gold" : "bg-ink border-gold/30 text-ivory hover:border-gold hover:bg-gold/5"
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── SERVICE ── */}
      {current === "service" && (
        <div className="space-y-4">
          <Label>{t.form.service} *</Label>
          <div className="flex flex-col gap-2">
            {serviceOptions.map((s, i) => {
              // Nails "Réparation 1 doigt" (index 3) gets a hint line
              const showRepairHint = category === "nails" && i === 3;
              return (
                <button key={s} type="button" onClick={() => pickService(s)}
                  className={`w-full text-left px-4 py-3 text-sm border transition-colors ${
                    service === s ? "bg-gold text-ivory border-gold font-medium" : "bg-ink border-gold/20 text-ivory/80 hover:border-gold/60 hover:text-ivory"
                  }`}>
                  {s}
                  {showRepairHint && (
                    <span className={`block text-xs mt-0.5 ${service === s ? "text-ink/70" : "text-ivory/40"}`}>
                      {t.form.nails.repairHint}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ZONE (nails only) ── */}
      {current === "zone" && (
        <div className="space-y-4">
          <Label>{t.form.zone.question} *</Label>
          <div className="flex flex-col gap-3">
            {(["hands", "feet", "both"] as const).map((z) => (
              <button key={z} type="button"
                onClick={() => { setZone(z); goNext(); }}
                className={`w-full text-center px-4 py-4 text-base border transition-colors ${
                  zone === z ? "bg-gold text-ivory border-gold font-medium" : "bg-ink border-gold/30 text-ivory hover:border-gold hover:bg-gold/5"
                }`}>
                {t.form.zone[z]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── PHOTO (nails only) ── */}
      {current === "photo" && (
        <div className="space-y-4">
          <Label>{t.form.photo.question}</Label>

          {!photoUrl ? (
            <>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()}
                className="w-full px-4 py-6 bg-ink border border-dashed border-gold/30 text-ivory/70 hover:border-gold hover:text-ivory hover:bg-carbon transition-colors text-sm disabled:opacity-50">
                {uploading ? t.form.photo.uploading : `📷 ${t.form.photo.upload}`}
              </button>
              {uploadErr && <p className="text-red-400 text-xs">{uploadErr}</p>}
            </>
          ) : (
            <div className="space-y-2">
              <div className="border border-gold/30 overflow-hidden">
                <img src={photoUrl} alt="upload" className="w-full max-h-48 object-cover" />
              </div>
              <button type="button" onClick={() => { setPhotoUrl(""); }}
                className="text-ivory/50 hover:text-gold text-xs underline">
                {t.form.photo.remove}
              </button>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={goNext}
              className="btn-gold btn-gold-hover flex-1">
              {photoUrl ? (t.form.next ?? "Volgende →") : t.form.photo.skip}
            </button>
          </div>
        </div>
      )}

      {/* ── DATE ── */}
      {current === "date" && (
        <div className="space-y-4">
          <div>
            <Label>{t.form.date} *</Label>
            <input type="date" required min={today} value={date} autoFocus
              onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <button type="button" disabled={!date} onClick={goNext}
            className="btn-gold btn-gold-hover w-full disabled:opacity-40 disabled:cursor-not-allowed">
            {t.form.next ?? "Volgende →"}
          </button>
        </div>
      )}

      {/* ── TIME ── */}
      {current === "time" && (
        <div className="space-y-4">
          <Label>{t.form.time} *</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {TIME_SLOTS.map((slot) => (
              <button key={slot} type="button" onClick={() => { setTime(slot); goNext(); }}
                className={`py-2.5 text-xs tracking-wider border transition-colors ${
                  time === slot ? "bg-gold text-ivory border-gold font-medium" : "bg-ink border-gold/20 text-ivory/70 hover:border-gold/60 hover:text-ivory"
                }`}>
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── DETAILS ── */}
      {current === "details" && (
        <form onSubmit={handleFinalSubmit} className="space-y-4">
          <Field label={t.form.name} value={name} onChange={setName} required autoFocus />
          <Field label={t.form.email} value={email} onChange={setEmail} type="email" />
          <Field label={t.form.phone} value={phone} onChange={setPhone} type="tel" required />

          <button type="submit" disabled={status === "sending" || !name || !phone}
            className="btn-gold btn-gold-hover w-full disabled:opacity-40 disabled:cursor-not-allowed">
            {status === "sending" ? t.form.sending : t.form.submit}
          </button>

          {status === "err" && <p className="text-red-400 text-xs">{t.form.error}</p>}

          <p className="text-center text-ivory/50 text-xs pt-1">
            <a href="https://gigilcoiffure.be/rdv/" target="_blank" rel="noopener noreferrer"
              className="hover:text-gold underline underline-offset-2">
              {t.form.onlineLink}
            </a>
          </p>
        </form>
      )}
    </div>
  );
}

// ─── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex items-center gap-1 mb-5">
      {Array.from({ length: total }, (_, i) => (
        <div key={i}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i < index ? "bg-gold/60" : i === index ? "bg-gold" : "bg-white/10"
          }`} />
      ))}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const inputCls =
  "w-full bg-ink border border-gold/20 text-ivory px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-ivory/70 text-xs tracking-wider uppercase mb-1.5">{children}</label>;
}

function Field({
  label, value, onChange, type = "text", required = false, autoFocus = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; autoFocus?: boolean;
}) {
  return (
    <div>
      <input
        type={type}
        required={required}
        value={value}
        autoFocus={autoFocus}
        aria-label={label}
        placeholder={`${label}${required ? " *" : ""}`}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} placeholder:text-ivory/50 placeholder:uppercase placeholder:tracking-wider placeholder:text-xs`}
      />
    </div>
  );
}
