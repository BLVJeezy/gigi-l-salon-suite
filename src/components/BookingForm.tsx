// Booking form embedded in the hero. POSTs via createBooking server fn.
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createBooking } from "@/lib/bookings.functions";
import { useT } from "@/lib/i18n";

const TIME_SLOTS = [
  "09:00","10:00","10:30","11:00","11:30","12:00",
  "13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30",
];

export function BookingForm() {
  const { t, lang } = useT();
  const submit = useServerFn(createBooking);
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");

  const today = new Date().toISOString().slice(0, 10);
  const serviceOptions = t.services.items.map(s => s.t);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    try {
      await submit({
        data: {
          name: String(fd.get("name") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          email: String(fd.get("email") ?? ""),
          service: String(fd.get("service") ?? ""),
          booking_date: String(fd.get("booking_date") ?? ""),
          booking_time: String(fd.get("booking_time") ?? ""),
          message: String(fd.get("message") ?? ""),
          lang,
        },
      });
      setState("ok");
    } catch (err) {
      console.error(err);
      setState("err");
    }
  }

  if (state === "ok") {
    return (
      <div className="bg-carbon border border-gold/40 p-8 text-center">
        <div className="text-gold text-3xl font-display mb-3">✓</div>
        <p className="font-display text-ivory text-xl mb-2">{t.form.success}</p>
        <a href="tel:+32484164905" className="text-gold text-sm tracking-wider hover:underline">+32 484 16 49 05</a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-carbon border border-gold/30 p-6 sm:p-7 space-y-4">
      <h3 className="font-display text-ivory text-2xl">{t.form.title}</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field name="name" label={t.form.name} required />
        <Field name="phone" label={t.form.phone} type="tel" required />
      </div>
      <Field name="email" label={t.form.email} type="email" />

      <div>
        <Label>{t.form.service} *</Label>
        <select name="service" required className={inputCls}>
          <option value="">{t.form.servicePlaceholder}</option>
          {serviceOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>{t.form.date} *</Label>
          <input type="date" name="booking_date" required min={today} className={inputCls} />
        </div>
        <div>
          <Label>{t.form.time} *</Label>
          <select name="booking_time" required className={inputCls}>
            <option value="">--</option>
            {TIME_SLOTS.map(time => <option key={time} value={time}>{time}</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label>{t.form.message}</Label>
        <textarea name="message" rows={3} className={inputCls} />
      </div>

      <button type="submit" disabled={state === "sending"} className="btn-gold btn-gold-hover w-full disabled:opacity-60">
        {state === "sending" ? t.form.sending : t.form.submit}
      </button>

      {state === "err" && <p className="text-red-400 text-xs">{t.form.error}</p>}

      <p className="text-center text-ivory/50 text-xs pt-1">
        <a href="https://gigilcoiffure.be/rdv/" target="_blank" rel="noopener noreferrer" className="hover:text-gold underline underline-offset-2">
          {t.form.onlineLink}
        </a>
      </p>
    </form>
  );
}

const inputCls =
  "w-full bg-ink border border-gold/20 text-ivory px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-ivory/70 text-xs tracking-wider uppercase mb-1.5">{children}</label>;
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <Label>{label}{required && " *"}</Label>
      <input name={name} type={type} required={required} aria-label={label} className={inputCls} />
    </div>
  );
}
