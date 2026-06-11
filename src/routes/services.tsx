// /services — full services page with pricing hints and per-service CTAs
import { createFileRoute, Link } from "@tanstack/react-router";
import { LangProvider, useT } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Nos services — GiGi L Coiffure Tongres" },
      { name: "description", content: "Tresses africaines, tissage, locks, microshading, perruques, mèches, ongles et maquillage. Tous les services de GiGi L Coiffure à Tongres." },
      { property: "og:title", content: "Nos services — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/services" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/services" }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <ServicesPage />
      <Footer />
    </LangProvider>
  ),
});

function ServicesPage() {
  const { t } = useT();
  return (
    <main className="min-h-screen bg-ivory pt-16">
      {/* Header strip */}
      <div className="bg-ink text-ivory py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="eyebrow">{t.services.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl text-ivory leading-[1.05]">
            {t.services.title}
          </h1>
          <div className="mt-5 gold-rule" />
        </div>
      </div>

      {/* Services grid */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 lg:py-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {t.services.items.map((s, i) => (
            <div key={i} className="bg-ivory p-7 lg:p-9 flex flex-col hover:bg-sand transition-colors group">
              <div className="text-gold text-xs tracking-[0.2em] mb-3">0{i + 1}</div>
              <h2 className="font-display text-xl text-ink mb-3">{s.t}</h2>
              <p className="text-smoke text-sm leading-relaxed flex-1">{s.d}</p>
              <Link
                to="/reservations"
                className="mt-6 inline-flex items-center gap-2 text-gold text-xs tracking-widest uppercase hover:gap-3 transition-all"
              >
                {t.servicesPage.bookCta} <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA banner */}
      <section className="bg-carbon text-ivory py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-ivory">{t.servicesPage.ctaTitle}</h2>
          <p className="mt-4 text-ivory/65 max-w-lg mx-auto">{t.servicesPage.ctaSub}</p>
          <Link to="/reservations" className="btn-gold btn-gold-hover mt-8 inline-flex">
            {t.nav.book}
          </Link>
        </div>
      </section>
    </main>
  );
}
