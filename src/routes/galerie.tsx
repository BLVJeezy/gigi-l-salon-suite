// /galerie — photo gallery with category filter
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LangProvider, useT } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/galerie")({
  head: () => ({
    meta: [
      { title: "Galerie — GiGi L Coiffure Tongres" },
      { name: "description", content: "Découvrez nos réalisations : tresses africaines, box braids, tissages, microshading, chignons et coupes européennes à Tongres." },
      { property: "og:title", content: "Galerie — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/galerie" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/galerie" }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <GalleryPage />
      <Footer />
    </LangProvider>
  ),
});

function GalleryPage() {
  const { t } = useT();
  const [active, setActive] = useState<string>("all");

  const categories = [
    { key: "all", label: t.galleryPage.filterAll },
    { key: "tresses", label: t.galleryPage.filterTresses },
    { key: "tissage", label: t.galleryPage.filterTissage },
    { key: "locks", label: t.galleryPage.filterLocks },
    { key: "microshading", label: t.galleryPage.filterMicroshading },
    { key: "coupes", label: t.galleryPage.filterCoupes },
    { key: "chignons", label: t.galleryPage.filterChignons },
  ];

  // Placeholder items — replace src with real image paths when photos are ready.
  // Each item has a category key that matches the filter above.
  const items: { cat: string; alt: string; src?: string }[] = [
    { cat: "tresses", alt: "Box braids longues" },
    { cat: "tresses", alt: "Cornrows motif géométrique" },
    { cat: "tresses", alt: "Fulani braids" },
    { cat: "tresses", alt: "Knotless braids mi-longues" },
    { cat: "tissage", alt: "Tissage naturel volume" },
    { cat: "tissage", alt: "Tissage lisse longueur" },
    { cat: "locks", alt: "Locks starter" },
    { cat: "locks", alt: "Crochet braids" },
    { cat: "locks", alt: "Locks entretien retwist" },
    { cat: "microshading", alt: "Microshading sourcils effet poudré" },
    { cat: "microshading", alt: "Sourcils redessinés microshading" },
    { cat: "coupes", alt: "Coupe femme cheveux naturels" },
    { cat: "coupes", alt: "Coupe et coloration" },
    { cat: "chignons", alt: "Chignon de mariée" },
    { cat: "chignons", alt: "Chignon cérémonie" },
  ];

  const filtered = active === "all" ? items : items.filter(i => i.cat === active);

  return (
    <main className="min-h-screen bg-ivory pt-16">
      {/* Header strip */}
      <div className="bg-ink text-ivory py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="eyebrow">{t.gallery.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl text-ivory leading-[1.05]">
            {t.galleryPage.title}
          </h1>
          <div className="mt-5 gold-rule" />
          <p className="mt-5 text-ivory/65 max-w-xl text-base leading-relaxed">
            {t.galleryPage.subtitle}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-16 z-40 bg-ivory border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-4 scrollbar-none">
            {categories.map(c => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActive(c.key)}
                className={`flex-shrink-0 px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
                  active === c.key
                    ? "bg-gold text-ink border-gold font-medium"
                    : "bg-transparent text-smoke border-smoke/30 hover:border-gold hover:text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {filtered.map((item, i) => (
            <div key={`${active}-${i}`} className="group relative aspect-square overflow-hidden bg-carbon border border-gold/20">
              {item.src ? (
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                // Placeholder — remove once real photos are added
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <span className="font-display text-gold/30 text-3xl">GL</span>
                  <span className="text-gold/25 text-[10px] tracking-widest uppercase px-3 text-center leading-snug">
                    {item.alt}
                  </span>
                </div>
              )}
              {/* Hover overlay with alt text */}
              <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-ivory text-xs leading-snug">{item.alt}</p>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-smoke py-20 text-sm">{t.galleryPage.empty}</p>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="bg-sand py-14 lg:py-18">
        <div className="mx-auto max-w-xl px-5 sm:px-8 text-center">
          <p className="font-display text-2xl sm:text-3xl text-ink">{t.galleryPage.ctaTitle}</p>
          <p className="mt-3 text-smoke text-sm">{t.galleryPage.ctaSub}</p>
          <Link to="/reservations" className="btn-gold btn-gold-hover mt-6 inline-flex">
            {t.nav.book}
          </Link>
        </div>
      </section>
    </main>
  );
}
