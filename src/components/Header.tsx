// Shared header — logo, page nav, lang switcher, square hamburger mobile menu.
import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useT, LANGS, type Lang } from "@/lib/i18n";

const DIENSTEN_LINKS = [
  { to: "/vlechten-tongeren",      labelNL: "Vlechten & braids",       labelFR: "Tresses africaines",      labelEN: "Braids" },
  { to: "/box-braids-tongeren",    labelNL: "Box braids",               labelFR: "Box braids",              labelEN: "Box braids" },
  { to: "/extensions-tongeren",    labelNL: "Extensions & pruiken",     labelFR: "Extensions & perruques",  labelEN: "Extensions & wigs" },
  { to: "/kapster-tongeren",       labelNL: "Kapsalon",                 labelFR: "Coiffure européenne",     labelEN: "Hair salon" },
  { to: "/microshading-tongeren",  labelNL: "Microshading",             labelFR: "Microshading sourcils",   labelEN: "Microshading brows" },
  { to: "/nagels-tongeren",        labelNL: "Nagels",                   labelFR: "Ongles",                  labelEN: "Nails" },
  { to: "/beauty-salon-tongeren",  labelNL: "Beauty salon",             labelFR: "Beauty salon",            labelEN: "Beauty salon" },
  { to: "/prijzen",                labelNL: "Prijzen",                  labelFR: "Tarifs",                  labelEN: "Prices" },
];

export function Header() {
  const { t, lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getLabel = (l: typeof DIENSTEN_LINKS[0]) =>
    lang === "fr" ? l.labelFR : lang === "en" ? l.labelEN : l.labelNL;

  const pageLinks = [
    { to: "/galerie" as const, label: t.nav.galleryPage },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink/90 backdrop-blur-md border-b border-gold/15">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-display text-ivory text-xl tracking-wide">
          GiGi <span className="text-gold">L</span>{" "}
          <span className="text-ivory/80 text-sm tracking-[0.25em] uppercase ml-1">Coiffure</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-ivory/80 text-sm">
          {/* Diensten dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropOpen(v => !v)}
              className={`flex items-center gap-1 hover:text-gold transition-colors ${dropOpen ? "text-gold" : ""}`}
            >
              {t.nav.servicesPage}
              <span className={`text-[10px] transition-transform ${dropOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {dropOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-ink border border-gold/20 shadow-xl z-50 py-1">
                <Link to="/services" onClick={() => setDropOpen(false)}
                  className="block px-4 py-2.5 text-ivory/60 text-xs uppercase tracking-widest border-b border-gold/10 hover:text-gold transition-colors">
                  {t.nav.servicesPage} →
                </Link>
                {DIENSTEN_LINKS.map(l => (
                  <Link key={l.to} to={l.to as any} onClick={() => setDropOpen(false)}
                    className="block px-4 py-2 text-ivory/80 hover:text-gold hover:bg-gold/5 transition-colors text-sm">
                    {getLabel(l)}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {pageLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className="hover:text-gold transition-colors [&.active]:text-gold">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          <LangSwitcher current={lang} onChange={setLang} />
          <Link to="/reservations" className="hidden sm:inline-flex btn-gold btn-gold-hover">
            {t.nav.book}
          </Link>
          {/* Square hamburger */}
          <button
            aria-label="Menu"
            className="lg:hidden w-10 h-10 flex items-center justify-center border border-gold/40 hover:border-gold hover:bg-gold/10 transition-colors"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <span className="text-ivory text-xl leading-none">×</span>
            ) : (
              <div className="space-y-1">
                <span className="block w-4 h-px bg-ivory" />
                <span className="block w-4 h-px bg-ivory" />
                <span className="block w-4 h-px bg-ivory" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-ink border-t border-gold/15 px-5 py-6 space-y-4">
          {pageLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block text-ivory/85 hover:text-gold text-base"
            >
              {l.label}
            </Link>
          ))}

          {/* Specialisaties — subtiele links naar SEO-pagina's */}
          <div className="border-t border-gold/15 pt-4">
            <p className="text-ivory/30 text-[10px] uppercase tracking-widest mb-3">{t.specialties.heading}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {t.specialties.links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to as any}
                  onClick={() => setOpen(false)}
                  className="text-ivory/50 hover:text-gold text-sm transition-colors"
                >
                  → {l.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/reservations"
            onClick={() => setOpen(false)}
            className="btn-gold btn-gold-hover w-full mt-2 text-center block"
          >
            {t.nav.book}
          </Link>
        </div>
      )}
    </header>
  );
}

function LangSwitcher({ current, onChange }: { current: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-1.5 text-xs tracking-widest" role="group" aria-label="Language">
      {LANGS.map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-ivory/25">·</span>}
          <button
            type="button"
            onClick={() => onChange(l)}
            className={`uppercase transition-colors ${current === l ? "text-gold font-medium" : "text-ivory/60 hover:text-ivory"}`}
            aria-pressed={current === l}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}

