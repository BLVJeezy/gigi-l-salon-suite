// /galerie — fotogalerij met categoriefiltter
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LangProvider, useT } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { BookingSection, Footer } from "@/components/sections";
import { listPublicGallery, type GalleryItem } from "@/lib/gallery.functions";

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
      <BookingSection />
      <Footer />
    </LangProvider>
  ),
});

// ─── Photo data ──────────────────────────────────────────────────────────────
// Replace `src` with the real image path when photos are ready.
// `span` controls grid size: 1 = 1×1, 2 = 2×1 wide, 3 = 1×2 tall
type Photo = { cat: string; alt_fr: string; alt_nl: string; alt_en: string; src?: string; span?: 1 | 2 | 3 };

const PHOTOS: Photo[] = [
  { cat: "tresses", src: "/gallery/nattes-burgundy-long.png", alt_fr: "Cornrows bordeaux longs devant le mur GiGi L", alt_nl: "Lange bordeaux cornrows voor de GiGi L muur", alt_en: "Long burgundy cornrows in front of the GiGi L wall", span: 3 },
  { cat: "tresses", src: "/gallery/nattes-cornrows-top.png", alt_fr: "Cornrows homme vue de dessus", alt_nl: "Cornrows heren van bovenaf", alt_en: "Men's cornrows top view", span: 2 },
  { cat: "tresses", src: "/gallery/nattes-curly-top.png", alt_fr: "Cornrows avec afro bouclé", alt_nl: "Cornrows met krullende afro", alt_en: "Cornrows with curly afro top" },
  { cat: "tresses", src: "/gallery/nattes-cornrows-side.png", alt_fr: "Cornrows homme avec fondu et natte tressée", alt_nl: "Cornrows heren met fade en gevlochten staart", alt_en: "Men's cornrows with fade and braided tail", span: 3 },
  { cat: "tresses", src: "/gallery/burgundy-feedin-braids.jpeg", alt_fr: "Tresses collées bordeaux", alt_nl: "Bordeaux feed-in braids", alt_en: "Burgundy feed-in braids", span: 3 },
  { cat: "tresses", src: "/gallery/cornrows-homme.jpeg", alt_fr: "Cornrows homme", alt_nl: "Cornrows heren", alt_en: "Men's cornrows" },
  { cat: "tresses", src: "/gallery/feedin-braids-cowrie.jpeg", alt_fr: "Tresses collées avec coquillages", alt_nl: "Feed-in braids met kauri", alt_en: "Feed-in braids with cowrie shells", span: 2 },
  { cat: "tresses", src: "/gallery/knotless-blond.jpeg", alt_fr: "Knotless braids blond bouclé", alt_nl: "Knotless braids blond met krul", alt_en: "Blonde knotless braids with curls" },
  { cat: "tresses", src: "/gallery/braids-bordeaux-glasses.jpeg", alt_fr: "Tresses bordeaux", alt_nl: "Bordeaux braids", alt_en: "Burgundy braids", span: 3 },
  { cat: "tissage", src: "/gallery/tissage-lisse-brun.jpeg", alt_fr: "Tissage lisse brun", alt_nl: "Stijle bruine weave", alt_en: "Sleek brown weave", span: 2 },
  { cat: "tissage", src: "/gallery/tissage-bordeaux-wavy.jpeg", alt_fr: "Tissage bordeaux ondulé", alt_nl: "Bordeaux golvende weave", alt_en: "Burgundy wavy weave", span: 3 },
  { cat: "tissage", src: "/gallery/curly-naturel.jpeg", alt_fr: "Cheveux bouclés naturels", alt_nl: "Natuurlijk krullend haar", alt_en: "Natural curly hair" },
  { cat: "locks", src: "/gallery/twists-curly-ends.jpeg", alt_fr: "Twists avec pointes bouclées", alt_nl: "Twists met krullende uiteinden", alt_en: "Twists with curly ends" },
  { cat: "nails", src: "/gallery/nails-red-almond.jpeg", alt_fr: "Vernis rouge, forme amande", alt_nl: "Rode lak, amandelvorm", alt_en: "Red polish, almond shape", span: 2 },
  { cat: "nails", src: "/gallery/nails-glitter-nude.jpeg", alt_fr: "Nude pailleté", alt_nl: "Nude met glitter", alt_en: "Glitter nude", span: 3 },
  { cat: "nails", src: "/gallery/nails-cat-eye-grey.jpeg", alt_fr: "Vernis cat-eye gris", alt_nl: "Cat-eye lak grijs", alt_en: "Grey cat-eye polish" },
  { cat: "nails", src: "/gallery/nails-gold-chrome.jpeg", alt_fr: "Chrome doré, forme amande", alt_nl: "Goud chrome, amandelvorm", alt_en: "Gold chrome, almond shape", span: 2 },
  { cat: "nails", src: "/gallery/nails-green-french.png", alt_fr: "French vert avec strass", alt_nl: "Groene french met steentjes", alt_en: "Green French tips with gems" },
  { cat: "perruques", src: "/gallery/perruque-pink-bob.png", alt_fr: "Perruque lace bob rose", alt_nl: "Lace bob pruik roze", alt_en: "Pink lace bob wig", span: 3 },
  { cat: "perruques", src: "/gallery/perruque-honey-wavy.png", alt_fr: "Perruque longue ondulée blond miel", alt_nl: "Lange golvende honingblonde pruik", alt_en: "Long wavy honey-blonde wig", span: 2 },
  { cat: "micro", src: "/gallery/microshading-sourcils.png", alt_fr: "Microshading sourcils — effet poudré naturel", alt_nl: "Microshading wenkbrauwen — natuurlijk poedereffect", alt_en: "Microshading brows — natural powder effect", span: 2 },
  { cat: "micro", src: "/__l5e/assets-v1/5e59da53-63fb-4e03-a1b6-1ecc4917728e/hero-brows-new2.jpg", alt_fr: "Microshading sourcils — résultat naturel", alt_nl: "Microshading wenkbrauwen — natuurlijk resultaat", alt_en: "Microshading brows — natural result" },
];

// ─── Mobile filter dropdown component ──────────────────────────────────────────
function MobileFilterDropdown({
  categories,
  active,
  onChange,
  photos,
}: {
  categories: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
  photos: Photo[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCat = categories.find((c) => c.key === active);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function countFor(key: string) {
    return key === "all" ? photos.length : photos.filter((p) => p.cat === key).length;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-5 py-3 bg-ivory border border-gold/40 text-ink text-sm tracking-widest uppercase font-medium"
      >
        <span className="flex items-center gap-2">
          {activeCat?.label}
          <span className="inline-flex items-center justify-center bg-gold/10 text-gold text-[10px] font-semibold px-1.5 py-0.5 min-w-[1.25rem]">
            {countFor(active)}
          </span>
        </span>
        <svg
          className={`w-4 h-4 text-gold transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 bg-ivory border border-gold/30 shadow-lg z-50 max-h-[60vh] overflow-y-auto scrollbar-none">
          {categories.map((c) => {
            const isActive = c.key === active;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  onChange(c.key);
                  setOpen(false);
                }}
                className={`flex items-center justify-between w-full px-5 py-3 text-sm tracking-widest uppercase transition-colors border-b border-border last:border-b-0 ${
                  isActive
                    ? "bg-gold text-ivory font-medium"
                    : "text-smoke hover:bg-sand/50 hover:text-ink"
                }`}
              >
                <span>{c.label}</span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 min-w-[1.25rem] ${
                    isActive ? "bg-ivory/20 text-ivory" : "bg-gold/10 text-gold"
                  }`}
                >
                  {countFor(c.key)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GalleryPage() {
  const { t, lang } = useT();
  const [active, setActive] = useState("all");
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [dbPhotos, setDbPhotos] = useState<Photo[]>([]);
  const loadPublic = useServerFn(listPublicGallery);

  useEffect(() => {
    let cancelled = false;
    loadPublic()
      .then((r: { items: GalleryItem[] }) => {
        if (cancelled) return;
        const mapped: Photo[] = r.items.map((it) => ({
          cat: it.category,
          src: it.url,
          alt_fr: it.caption_fr || "GiGi L Coiffure",
          alt_nl: it.caption_nl || it.caption_fr || "GiGi L Coiffure",
          alt_en: it.caption_en || it.caption_fr || "GiGi L Coiffure",
          span: (it.span === 2 || it.span === 3 ? it.span : 1) as 1 | 2 | 3,
        }));
        setDbPhotos(mapped);
      })
      .catch(() => { /* ignore — fallback to hardcoded */ });
    return () => { cancelled = true; };
  }, [loadPublic]);

  const categories = [
    { key: "all",      label: t.galleryPage.filterAll },
    { key: "tresses",  label: t.galleryPage.filterTresses },
    { key: "tissage",  label: t.galleryPage.filterTissage },
    { key: "locks",    label: t.galleryPage.filterLocks },
    { key: "micro",    label: t.galleryPage.filterMicroshading },
    { key: "nails",    label: t.galleryPage.filterNails },
    { key: "coupes",   label: t.galleryPage.filterCoupes },
    { key: "chignons", label: t.galleryPage.filterChignons },
    { key: "perruques", label: t.galleryPage.filterPerruques },
  ];

  const allPhotos: Photo[] = [...dbPhotos, ...PHOTOS];
  const filtered = active === "all" ? allPhotos : allPhotos.filter(p => p.cat === active);

  function altFor(p: Photo) {
    return lang === "nl" ? p.alt_nl : lang === "en" ? p.alt_en : p.alt_fr;
  }

  return (
    <main className="min-h-screen bg-ivory pt-16">

      {/* ── Hero ── */}
      <section className="bg-ink text-ivory py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #8A6552 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
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
              {allPhotos.length}
            </p>
            <p className="text-ivory/40 text-xs tracking-widest uppercase mt-1">{t.galleryPage.photoCount}</p>
          </div>
        </div>
      </section>

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-16 z-40 bg-ivory/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Mobile: pill dropdown */}
          <div className="sm:hidden py-3">
            <MobileFilterDropdown
              categories={categories}
              active={active}
              onChange={(key) => { setActive(key); }}
              photos={allPhotos}
            />
          </div>
          {/* Desktop: horizontal scroll pills */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            {categories.map(c => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActive(c.key)}
                className={`flex-shrink-0 px-4 py-2 text-xs tracking-widest uppercase transition-colors border ${
                  active === c.key
                    ? "bg-gold text-ivory border-gold font-medium"
                    : "bg-transparent text-smoke border-smoke/25 hover:border-gold/60 hover:text-ink"
                }`}
              >
                {c.label}
                <span className={`ml-2 text-[10px] ${active === c.key ? "text-ink/60" : "text-smoke/50"}`}>
                  {c.key === "all" ? allPhotos.length : allPhotos.filter(p => p.cat === c.key).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Masonry grid (CSS columns) ── */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-10 lg:py-14">
        {filtered.length === 0 ? (
          <p className="text-center text-smoke py-20 text-sm">{t.galleryPage.empty}</p>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 sm:gap-3 [column-fill:_balance]">
            {filtered.map((photo, i) => (
              <div
                key={`${active}-${i}`}
                onClick={() => setLightbox(photo)}
                className="group relative mb-2 sm:mb-3 break-inside-avoid overflow-hidden bg-carbon border border-gold/15 cursor-pointer"
              >
                {photo.src ? (
                  <img
                    src={photo.src}
                    alt={altFor(photo)}
                    className="w-full h-auto block object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                      const ph = el.nextElementSibling as HTMLElement | null;
                      if (ph) ph.style.display = "flex";
                    }}
                  />
                ) : null}
                {/* Placeholder */}
                <div
                  className="aspect-[3/4] w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-carbon to-ink"
                  style={{ display: photo.src ? "none" : "flex" }}
                >
                  <span className="font-display text-gold/20 text-4xl sm:text-5xl select-none">GL</span>
                  <span className="text-gold/20 text-[9px] sm:text-[10px] tracking-widest uppercase px-4 text-center leading-relaxed">
                    {altFor(photo)}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
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
            <a href="tel:+32484164905" className="btn-gold-outline hover:bg-gold hover:text-ivory transition-colors">+32 484 16 49 05</a>
          </div>
        </div>
      </section>

    </main>
  );
}
