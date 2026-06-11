// Shared header — logo, page nav, lang switcher, square hamburger mobile menu.
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useT, LANGS, type Lang } from "@/lib/i18n";

export function Header() {
  const { t, lang, setLang } = useT();
  const [open, setOpen] = useState(false);

  // Real page links — used on both desktop and mobile, everywhere.
  const pageLinks = [
    { to: "/services" as const, label: t.nav.servicesPage },
    { to: "/galerie" as const, label: t.nav.galleryPage },
    { to: "/reservations" as const, label: t.nav.bookingPage },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink/90 backdrop-blur-md border-b border-gold/15">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-display text-ivory text-xl tracking-wide">
          GiGi <span className="text-gold">L</span>{" "}
          <span className="hidden sm:inline text-ivory/80 text-sm tracking-[0.25em] uppercase ml-1">Coiffure</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-ivory/80 text-sm">
          {pageLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-gold transition-colors [&.active]:text-gold"
            >
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
