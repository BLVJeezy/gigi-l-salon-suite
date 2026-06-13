// /galerie — fotogalerij met categoriefiltter
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LangProvider, useT } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections";

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

// ─── Photo data ──────────────────────────────────────────────────────────────
// Replace `src` with the real image path when photos are ready.
// `span` controls grid size: 1 = 1×1, 2 = 2×1 wide, 3 = 1×2 tall
type Photo = { cat: string; alt_fr: string; alt_nl: string; alt_en: string; src?: string; span?: 1 | 2 | 3 };

const PHOTOS: Photo[] = [
  { cat: "tresses", alt_fr: "Box braids longues",              alt_nl: "Lange box braids",             alt_en: "Long box braids",             span: 2 },
  { cat: "tresses", alt_fr: "Cornrows motif géométrique",      alt_nl: "Cornrows geometrisch",          alt_en: "Geometric cornrows" },
  { cat: "tresses", alt_fr: "Knotless braids mi-longues",      alt_nl: "Knotless braids halflang",      alt_en: "Mid-length knotless braids" },
  { cat: "tresses", alt_fr: "Fulani braids avec perles",       alt_nl: "Fulani braids met kralen",      alt_en: "Fulani braids with beads",    span: 3 },
  { cat: "tresses", alt_fr: "Box braids couleur",              alt_nl: "Gekleurde box braids",          alt_en: "Coloured box braids" },
  { cat: "tissage", alt_fr: "Tissage naturel volume",          alt_nl: "Weave natuurlijk volume",       alt_en: "Natural volume weave",        span: 2 },
  { cat: "tissage", alt_fr: "Tissage lisse longueur",          alt_nl: "Stijle weave lange lengte",     alt_en: "Sleek long weave" },
  { cat: "tissage", alt_fr: "Tissage bouclé",                  alt_nl: "Krullende weave",               alt_en: "Curly weave" },
  { cat: "locks",   alt_fr: "Locks starter",                   alt_nl: "Locks aanleggen",               alt_en: "Starter locs",                span: 3 },
  { cat: "locks",   alt_fr: "Crochet braids",                  alt_nl: "Crochet braids",                alt_en: "Crochet braids" },
  { cat: "locks",   alt_fr: "Retwist et entretien locks",      alt_nl: "Retwist locksonderhoud",        alt_en: "Loc retwist maintenance" },
  { cat: "micro",   alt_fr: "Microshading effet poudré",       alt_nl: "Microshading poedereffect",     alt_en: "Microshading powder effect",  span: 2 },
  { cat: "micro",   alt_fr: "Sourcils redessinés précis",      alt_nl: "Hergetekende wenkbrauwen",      alt_en: "Precision brow reshape" },
  { cat: "coupes",  alt_fr: "Coupe femme cheveux naturels",    alt_nl: "Damesknippen natuurlijk haar",  alt_en: "Women's natural hair cut" },
  { cat: "coupes",  alt_fr: "Coupe et coloration",             alt_nl: "Knippen en kleuren",            alt_en: "Cut and colour",              span: 2 },
  { cat: "chignons",alt_fr: "Chignon de mariée",               alt_nl: "Bruidskapsels",                 alt_en: "Bridal updo",                 span: 3 },
  { cat: "chignons",alt_fr: "Chignon cérémonie",               alt_nl: "Feestkapsel",                   alt_en: "Ceremony updo" },
  { cat: "chignons",alt_fr: "Tresse chignon élaboré",          alt_nl: "Elaborate vlecht-chignon",      alt_en: "Elaborate braided updo" },
];

function GalleryPage() {
  const { t, lang } = useT();
  const [active, setActive] = useState("all");
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  const categories = [
    { key: "all",      label: t.galleryPage.filterAll },
    { key: "tresses",  label: t.galleryPage.filterTresses },
    { key: "tissage",  label: t.galleryPage.filterTissage },
    { key: "locks",    label: t.galleryPage.filterLocks },
    { key: "micro",    label: t.galleryPage.filterMicroshading },
    { key: "coupes",   label: t.galleryPage.filterCoupes },
    { key: "chignons", label: t.galleryPage.filterChignons },
  ];

  const filtered = active === "all" ? PHOTOS : PHOTOS.filter(p => p.cat === active);

  function altFor(p: Photo) {
    return lang === "nl" ? p.alt_nl : lang === "en" ? p.alt_en : p.alt_fr;
  }

  return (
    <main className="min-h-screen bg-ivory pt-16">

      {/* ── Hero ── */}
      <section className="bg-ink text-ivory py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #C2BBB0 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-10 items-end">
          <div>
            <p className="eyebrow">{t.gallery.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl text-ivory leading-[1.05]">
              {t.galleryPage.title}
            </h1>
            <div className="mt-5 gold-rule" />
            <p className="mt-5 text-ivory/60 max-w-lg text-base leading-relaxed">
              {t.galleryPage.subtitle}
            </p>
          </div>
          <div className="lg:text-right">
            <p className="text-ivory/30 font-display text-5xl lg:text-7xl select-none">
              {PHOTOS.length}
            </p>
            <p className="text-ivory/40 text-xs tracking-widest uppercase mt-1">{t.galleryPage.photoCount}</p>
          </div>
        </div>
      </section>

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-16 z-40 bg-ivory/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            {categories.map(c => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActive(c.key)}
                className={`flex-shrink-0 px-4 py-2 text-xs tracking-widest uppercase transition-colors border ${
                  active === c.key
                    ? "bg-gold text-ink border-gold font-medium"
                    : "bg-transparent text-smoke border-smoke/25 hover:border-gold/60 hover:text-ink"
                }`}
              >
                {c.label}
                <span className={`ml-2 text-[10px] ${active === c.key ? "text-ink/60" : "text-smoke/50"}`}>
                  {c.key === "all" ? PHOTOS.length : PHOTOS.filter(p => p.cat === c.key).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Masonry-style grid ── */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-10 lg:py-14">
        {filtered.length === 0 ? (
          <p className="text-center text-smoke py-20 text-sm">{t.galleryPage.empty}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] sm:auto-rows-[220px] lg:auto-rows-[240px] gap-2 sm:gap-3">
            {filtered.map((photo, i) => (
              <div
                key={`${active}-${i}`}
                onClick={() => setLightbox(photo)}
                className={`group relative overflow-hidden bg-carbon border border-gold/15 cursor-pointer
                  ${photo.span === 2 ? "col-span-2" : ""}
                  ${photo.span === 3 ? "row-span-2" : ""}
                `}
              >
                {photo.src ? (
                  <img
                    src={photo.src}
                    alt={altFor(photo)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  /* Placeholder — swap with <img> when photos arrive */
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-carbon to-ink">
                    <span className="font-display text-gold/20 text-4xl sm:text-5xl select-none">GL</span>
                    <span className="text-gold/20 text-[9px] sm:text-[10px] tracking-widest uppercase px-4 text-center leading-relaxed">
                      {altFor(photo)}
                    </span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-ivory text-xs font-medium leading-snug">{altFor(photo)}</p>
                  <p className="text-gold/70 text-[10px] tracking-widest uppercase mt-1">
                    {categories.find(c => c.key === photo.cat)?.label}
                  </p>
                </div>

                {/* Corner tag */}
                <div className="absolute top-2 left-2 bg-ink/60 px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-gold text-[9px] tracking-widest">{String(i + 1).padStart(2, "0")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-5 text-ivory/60 hover:text-gold text-3xl leading-none"
            aria-label="Sluiten"
          >
            ×
          </button>
          <div
            className="relative max-w-2xl w-full max-h-[80vh] bg-carbon border border-gold/20 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {lightbox.src ? (
              <img src={lightbox.src} alt={altFor(lightbox)} className="w-full h-full object-contain max-h-[70vh]" />
            ) : (
              <div className="aspect-[4/3] flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-carbon to-ink">
                <span className="font-display text-gold/20 text-6xl select-none">GL</span>
                <span className="text-gold/25 text-xs tracking-widest uppercase px-6 text-center">{altFor(lightbox)}</span>
              </div>
            )}
            <div className="px-5 py-4 border-t border-gold/10 flex items-center justify-between">
              <p className="text-ivory/80 text-sm">{altFor(lightbox)}</p>
              <Link
                to="/reservations"
                onClick={() => setLightbox(null)}
                className="text-gold text-xs tracking-widest uppercase hover:underline"
              >
                {t.servicesPage.bookCta} →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <section className="bg-carbon text-ivory py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-ivory">{t.galleryPage.ctaTitle}</h2>
          <p className="mt-4 text-ivory/60 max-w-lg mx-auto text-sm sm:text-base">{t.galleryPage.ctaSub}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/reservations" className="btn-gold btn-gold-hover">{t.nav.book}</Link>
            <a href="tel:+32484164905" className="btn-gold-outline hover:bg-gold hover:text-ink transition-colors">+32 484 16 49 05</a>
          </div>
        </div>
      </section>

    </main>
  );
}
