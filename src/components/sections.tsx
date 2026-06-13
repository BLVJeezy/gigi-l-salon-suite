// All landing-page sections in one file for easy maintenance.
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookingForm } from "./BookingForm";
import { useT } from "@/lib/i18n";

export function Hero() {
  const { t } = useT();
  return (
    <section id="top" className="relative bg-ink text-ivory pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #8A6552 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
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
            {/* Desktop CTA → scrollt naar inline form */}
            <a href="#contact" className="btn-gold btn-gold-hover hidden lg:inline-flex">
              {t.hero.ctaBook}
            </a>
            <a href="tel:+32484164905" className="btn-gold-outline hover:bg-gold hover:text-ivory transition-colors hidden lg:inline-flex">
              +32 484 16 49 05
            </a>
          </div>

          {/* Trust badges */}
          <TrustBadges />
        </div>

        {/* Mobile: form + phone inline under hero text */}
        <div className="lg:hidden fade-in-up space-y-3">
          <BookingForm />
          <a href="tel:+32484164905" className="btn-gold-outline hover:bg-gold hover:text-ivory transition-colors w-full text-center">
            +32 484 16 49 05
          </a>
        </div>

        {/* Desktop: form in right column */}
        <div id="contact" className="fade-in-up hidden lg:block">
          <BookingForm />
        </div>
      </div>
    </section>
  );
}

// Subtle trust signals — Google rating, client count, certified salon.
// Mobile: 3-column grid, compact and centered. Desktop: inline row with dividers.
function TrustBadges() {
  const { t } = useT();
  return (
    <div className="mt-8 sm:mt-10 grid grid-cols-3 sm:flex sm:flex-wrap sm:items-center gap-y-4 sm:gap-x-8 border-t border-gold/15 pt-6 sm:border-0 sm:pt-0">
      {/* Google rating */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2.5 text-center sm:text-left">
        <div className="flex text-gold text-xs sm:text-sm" aria-hidden>
          {"★★★★★".split("").map((s, i) => (
            <span key={i} className={i === 4 ? "opacity-50" : ""}>{s}</span>
          ))}
        </div>
        <div className="leading-tight">
          <div className="text-ivory text-sm font-medium">4,6/5</div>
          <div className="text-ivory/45 text-[10px] sm:text-[11px] tracking-wide">{t.hero.badges.reviews}</div>
        </div>
      </div>

      <span className="hidden sm:block w-px h-8 bg-gold/20" aria-hidden />

      {/* Clients */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2.5 text-center sm:text-left">
        <span className="text-gold text-lg sm:text-xl leading-none font-display" aria-hidden>✓</span>
        <div className="leading-tight">
          <div className="text-ivory text-sm font-medium">{t.hero.badges.clientsCount}</div>
          <div className="text-ivory/45 text-[10px] sm:text-[11px] tracking-wide">{t.hero.badges.clients}</div>
        </div>
      </div>

      <span className="hidden sm:block w-px h-8 bg-gold/20" aria-hidden />

      {/* Certified */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2.5 text-center sm:text-left">
        <span className="text-gold text-base sm:text-lg leading-none" aria-hidden>♛</span>
        <div className="leading-tight">
          <div className="text-ivory text-sm font-medium">{t.hero.badges.certifiedTitle}</div>
          <div className="text-ivory/45 text-[10px] sm:text-[11px] tracking-wide">{t.hero.badges.certifiedSub}</div>
        </div>
      </div>
    </div>
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

        {/* Category cards: photo → title → mini description → button.
            Mobile: 2-col grid (3rd wraps). Desktop: 3-col. */}
        <div className="mt-12 lg:mt-14 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {t.services.cats.map((c) => (
            <div key={c.key} className="group flex flex-col bg-white border border-border overflow-hidden">
              {/* Photo */}
              <div className="relative aspect-[4/5] sm:aspect-[3/4] bg-carbon overflow-hidden">
                <img
                  src={c.img}
                  alt={c.t}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    const el = e.currentTarget;
                    el.style.display = "none";
                    const ph = el.nextElementSibling as HTMLElement | null;
                    if (ph) ph.style.display = "flex";
                  }}
                />
                <div className="w-full h-full flex-col items-center justify-center bg-gradient-to-br from-carbon to-ink" style={{ display: "none" }}>
                  <span className="font-display text-gold/25 text-4xl select-none">GL</span>
                </div>
              </div>
              {/* Text */}
              <div className="flex flex-col flex-1 p-4 sm:p-5">
                <h3 className="font-display text-lg sm:text-xl text-ink">{c.t}</h3>
                <p className="mt-1.5 text-smoke text-xs sm:text-sm leading-relaxed flex-1">{c.d}</p>
                <Link
                  to="/services"
                  className="mt-4 inline-flex items-center justify-center gap-2 border border-gold text-gold text-xs tracking-widest uppercase py-2.5 px-3 hover:bg-gold hover:text-ivory transition-colors"
                >
                  {t.services.learnMore} <span aria-hidden>→</span>
                </Link>
              </div>
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
  const items = [
    { src: "/gallery/braids-bordeaux-glasses.jpeg", alt: "Burgundy braids" },
    { src: "/gallery/tissage-lisse-brun.jpeg", alt: "Sleek brown weave" },
    { src: "/gallery/knotless-blond.jpeg", alt: "Blonde knotless braids" },
    { src: "/gallery/cornrows-homme.jpeg", alt: "Men's cornrows" },
    { src: "/gallery/curly-naturel.jpeg", alt: "Natural curly hair" },
    { src: "/gallery/feedin-braids-cowrie.jpeg", alt: "Feed-in braids with cowrie" },
  ];
  return (
    <section id="gallery" className="bg-ivory py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="max-w-2xl">
            <p className="eyebrow">{t.gallery.eyebrow}</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl text-ink">{t.gallery.title}</h2>
            <div className="mt-5 gold-rule" />
          </div>
          <a href="/galerie" className="text-xs tracking-[0.2em] uppercase text-ink hover:text-gold border-b border-gold/40 hover:border-gold pb-1 transition-colors">
            {t.gallery.eyebrow} →
          </a>
        </div>
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((it, i) => (
            <a
              key={i}
              href="/galerie"
              className="group relative block aspect-square overflow-hidden bg-carbon border border-gold/30"
            >
              <img
                src={it.src}
                alt={it.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors" />
            </a>
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

      {/* Google Maps embed */}
      <div className="border-t border-gold/15">
        <iframe
          title="GiGi L Coiffure — Koninksemsteenweg 144, Tongeren"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2523.0227220048405!2d5.452718676974883!3d50.775152363931205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c0f4051dfa34cf%3A0x2417dcea3df95f23!2sGIGI%20L%20coiffure!5e0!3m2!1snl!2sbe!4v1781304556487!5m2!1snl!2sbe"
          width="100%"
          height="360"
          style={{ border: 0, filter: "grayscale(0.3) contrast(1.05)" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block"
        />
      </div>

      <div className="border-t border-gold/15 py-6 text-center text-ivory/40 text-xs">
        © 2025 GiGi L Coiffure. {t.footer.rights}
      </div>
    </footer>
  );
}
