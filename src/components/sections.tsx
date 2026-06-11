// All landing-page sections in one file for easy maintenance.
import { useState } from "react";
import { BookingForm } from "./BookingForm";
import { useT } from "@/lib/i18n";

export function Hero() {
  const { t } = useT();
  return (
    <section id="top" className="relative bg-ink text-ivory pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #C9A24B 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="fade-in-up">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ivory">
            {t.hero.title}
          </h1>
          <div className="mt-6 gold-rule" />
          <p className="mt-6 text-ivory/70 text-base sm:text-lg max-w-xl leading-relaxed">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href="#contact" className="btn-gold btn-gold-hover">{t.hero.ctaBook}</a>
            <a href="tel:+32484164905" className="btn-gold-outline hover:bg-gold hover:text-ink transition-colors">
              +32 484 16 49 05
            </a>
          </div>
        </div>
        <div id="contact" className="fade-in-up">
          <BookingForm />
        </div>
      </div>
    </section>
  );
}

export function Services() {
  const { t } = useT();
  return (
    <section id="services" className="bg-ivory py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.services.eyebrow}</p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl text-ink">{t.services.title}</h2>
          <div className="mt-5 gold-rule" />
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {t.services.items.map((s, i) => (
            <div key={i} className="bg-ivory p-7 lg:p-9 hover:bg-sand transition-colors">
              <div className="text-gold text-xs tracking-[0.2em] mb-3">0{i + 1}</div>
              <h3 className="font-display text-xl text-ink mb-3">{s.t}</h3>
              <p className="text-smoke text-sm leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Why() {
  const { t } = useT();
  return (
    <section id="why" className="bg-carbon text-ivory py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.why.eyebrow}</p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl text-ivory">{t.why.title}</h2>
          <div className="mt-5 gold-rule" />
        </div>
        <div className="mt-14 grid md:grid-cols-2 gap-6 lg:gap-8">
          {t.why.items.map((it, i) => (
            <div key={i} className="border-l-2 border-gold pl-6 py-2">
              <h3 className="font-display text-xl text-ivory">{it.t}</h3>
              <p className="mt-2 text-ivory/65 text-sm leading-relaxed">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Gallery() {
  const { t } = useT();
  // NOTE: replace the placeholder divs with real <img src="..." /> tags when photos are ready.
  const items = Array.from({ length: 6 });
  return (
    <section id="gallery" className="bg-ivory py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.gallery.eyebrow}</p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl text-ink">{t.gallery.title}</h2>
          <div className="mt-5 gold-rule" />
        </div>
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((_, i) => (
            // REPLACE THIS DIV WITH <img src="/path-to-photo.jpg" alt="..." className="aspect-square w-full object-cover border border-gold/40" />
            <div
              key={i}
              className="aspect-square bg-carbon border border-gold/40 flex items-center justify-center text-gold/40 font-display text-3xl"
            >
              GL
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { t } = useT();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-sand py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div>
          <p className="eyebrow">{t.faq.eyebrow}</p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl text-ink">{t.faq.title}</h2>
          <div className="mt-5 gold-rule" />
        </div>
        <div className="mt-12 divide-y divide-ink/15 border-t border-b border-ink/15">
          {t.faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full py-5 flex items-center justify-between text-left gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-lg text-ink">{item.q}</span>
                  <span className={`text-gold text-2xl font-light leading-none transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
                </button>
                {isOpen && <p className="pb-6 text-smoke text-sm leading-relaxed pr-8">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useT();
  return (
    <footer className="bg-ink text-ivory">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 lg:py-24 text-center border-b border-gold/15">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ivory">{t.footer.ctaTitle}</h2>
        <p className="mt-4 text-ivory/65 max-w-xl mx-auto">{t.footer.ctaSub}</p>
        <a href="#contact" className="btn-gold btn-gold-hover mt-8">{t.footer.ctaBtn}</a>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <p className="font-display text-xl">GiGi <span className="text-gold">L</span> Coiffure</p>
          <address className="mt-4 not-italic text-ivory/65 text-sm leading-relaxed">
            Koninksemsteenweg 144<br />
            3700 Tongeren — België<br />
            <a href="tel:+32484164905" className="text-gold hover:underline">+32 484 16 49 05</a>
          </address>
        </div>
        <div>
          <p className="eyebrow">{t.footer.hoursTitle}</p>
          <ul className="mt-4 text-ivory/65 text-sm space-y-1">
            {t.footer.hoursLines.map(l => <li key={l}>{l}</li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow">{t.footer.linksTitle}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a className="text-ivory/80 hover:text-gold" href="https://www.google.com/maps/search/?api=1&query=Koninksemsteenweg+144+Tongeren" target="_blank" rel="noopener noreferrer">Google Maps →</a></li>
            <li><a className="text-ivory/80 hover:text-gold" href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook →</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold/15 py-6 text-center text-ivory/40 text-xs">
        © 2025 GiGi L Coiffure. {t.footer.rights}
      </div>
    </footer>
  );
}
