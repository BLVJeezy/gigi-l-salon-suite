// Shared header with logo, nav, language switcher, mobile menu.
import { useState } from "react";
import { useT, LANGS, type Lang } from "@/lib/i18n";

export function Header() {
  const { t, lang, setLang } = useT();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#services", label: t.nav.services },
    { href: "#why", label: t.nav.why },
    { href: "#gallery", label: t.nav.gallery },
    { href: "#faq", label: t.nav.faq },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink/90 backdrop-blur-md border-b border-gold/15">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="font-display text-ivory text-xl tracking-wide">
          GiGi <span className="text-gold">L</span> <span className="hidden sm:inline text-ivory/80 text-sm tracking-[0.25em] uppercase ml-1">Coiffure</span>
        </a>

        <nav className="hidden lg:flex items-center gap-8 text-ivory/80 text-sm">
          {links.map(l => (
            <a key={l.href} href={l.href} className="hover:text-gold transition-colors">{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          <LangSwitcher current={lang} onChange={setLang} />
          <a href="#contact" className="hidden sm:inline-flex btn-gold btn-gold-hover">{t.nav.book}</a>
          <button
            aria-label="Menu"
            className="lg:hidden text-ivory p-2"
            onClick={() => setOpen(v => !v)}
          >
            <div className="space-y-1.5">
              <span className="block w-6 h-px bg-ivory" />
              <span className="block w-6 h-px bg-ivory" />
              <span className="block w-6 h-px bg-ivory" />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-ink border-t border-gold/15 px-5 py-6 space-y-4">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-ivory/85 hover:text-gold text-base"
            >
              {l.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} className="btn-gold btn-gold-hover w-full mt-2">{t.nav.book}</a>
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
