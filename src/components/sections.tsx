// All landing-page sections in one file for easy maintenance.
import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { BookingForm } from "./BookingForm";
import { useT } from "@/lib/i18n";
import heroBg from "@/assets/hero-nails.png.asset.json";
import heroBgMobile from "@/assets/hero-nails-mobile.jpg.asset.json";
import heroBrows from "@/assets/hero-brows-new2.jpg.asset.json";

// ─────────────────────────────────────────────────────────────
// HERO BROW PHOTO — verticale positie per breakpoint tunen.
// Lager % = foto schuift omhoog (oog komt hoger in beeld).
// Hoger % = foto schuift omlaag (oog komt lager in beeld).
// ─────────────────────────────────────────────────────────────
const HERO_BROW_OFFSET = {
  mobile: "500%", // < 768px
  tablet: "500%", // 768px – 1023px
  desktop: "500%", // ≥ 1024px
};

export function Hero() {
  const { t } = useT();
  const SLIDES = [
    { mob: heroBgMobile.url, desk: heroBg.url },
    { mob: "/hero-cornrows.jpg", desk: "/hero-cornrows.jpg" },
    { mob: heroBrows.url, desk: heroBrows.url },
  ];
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState<"left" | "right">("left");

  const goTo = (next: number, direction: "left" | "right") => {
    setCur((c) => {
      if (next === c) return c;
      setPrev(c);
      setDir(direction);
      setTimeout(() => setPrev(null), 1100);
      return next;
    });
  };
  const goNext = () => goTo((cur + 1) % SLIDES.length, "left");
  const goPrev = () => goTo((cur - 1 + SLIDES.length) % SLIDES.length, "right");

  // Auto-advance every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setCur((c) => {
        const next = (c + 1) % SLIDES.length;
        setPrev(c);
        setDir("left");
        setTimeout(() => setPrev(null), 1100);
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Swipe handling for mobile empty area
  const touchRef = useRef({ x: 0, y: 0, active: false });

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.x = t.clientX;
    touchRef.y = t.clientY;
    touchRef.active = true;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.active) return;
    touchRef.active = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.x;
    const dy = t.clientY - touchRef.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };


  return (
    <>
      <section id="top" className="relative bg-ink text-ivory pt-24 pb-4 lg:pt-36 lg:pb-28 overflow-hidden">
        {/* Slide backgrounds */}
        <style>{`
        @keyframes slideInRight  { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideOutLeft  { from { opacity: 1; transform: translateX(0); }    to { opacity: 0; transform: translateX(-100%); } }
        .hero-slide-in  { animation: slideInRight 1.1s ease-in-out forwards; }
        .hero-slide-out { animation: slideOutLeft  1.1s ease-in-out forwards; }
        .hero-brow-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center ${HERO_BROW_OFFSET.mobile};
        }
        @media (min-width: 768px)  { .hero-brow-img { object-position: center ${HERO_BROW_OFFSET.tablet}; } }
        @media (min-width: 1024px) { .hero-brow-img { object-position: center ${HERO_BROW_OFFSET.desktop}; } }
      `}</style>

        {/* Outgoing slide */}
        {prev !== null && (
          <div key={`out-${prev}`} className="hero-slide-out absolute inset-0 lg:hidden" aria-hidden>
            {prev === 2 ? (
              <img src={SLIDES[prev].mob} alt="" className="hero-brow-img" />
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${SLIDES[prev].mob})`,
                  backgroundPosition: prev === 0 ? "center" : "center top",
                }}
              />
            )}
          </div>
        )}
        {prev !== null && (
          <div key={`out-desk-${prev}`} className="hero-slide-out absolute inset-0 hidden lg:block" aria-hidden>
            {prev === 2 ? (
              <img src={SLIDES[prev].desk} alt="" className="hero-brow-img" />
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${SLIDES[prev].desk})` }}
              />
            )}
          </div>
        )}

        {/* Incoming / current slide */}
        <div
          key={`in-mob-${cur}`}
          className={`absolute inset-0 lg:hidden ${prev !== null ? "hero-slide-in" : ""}`}
          aria-hidden
        >
          {cur === 2 ? (
            <img src={SLIDES[cur].mob} alt="" className="hero-brow-img" />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${SLIDES[cur].mob})`,
                backgroundPosition: cur === 0 ? "center" : "center top",
              }}
            />
          )}
        </div>
        <div
          key={`in-desk-${cur}`}
          className={`absolute inset-0 hidden lg:block ${prev !== null ? "hero-slide-in" : ""}`}
          aria-hidden
        >
          {cur === 2 ? (
            <img src={SLIDES[cur].desk} alt="" className="hero-brow-img" />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${SLIDES[cur].desk})` }}
            />
          )}
        </div>

        {/* Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-ink/92 via-ink/10 to-transparent lg:bg-gradient-to-r lg:from-ink/80 lg:via-ink/45 lg:to-ink/10"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 20%, #8A6552 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="fade-in-up">
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-ivory">
              {t.hero.title}
            </h1>
            <div className="mt-4 gold-rule" />
            <div className="mt-4">
              <TrustBadges />
            </div>

            {/* Desktop only */}
            <p className="hidden lg:block mt-6 text-ivory/70 text-lg max-w-xl leading-relaxed">{t.hero.subtitle}</p>
            <div className="hidden lg:flex mt-6 gap-3">
              <a href="#contact" className="btn-gold btn-gold-hover">
                {t.hero.ctaBook}
              </a>
              <a href="tel:+32484164905" className="btn-gold-outline hover:bg-gold hover:text-ivory transition-colors">
                +32 484 16 49 05
              </a>
            </div>
            <div className="hidden lg:block mt-8">
              <TrustBadges />
            </div>
          </div>

          {/* Mobile form + phone — shifted down, floats inside hero */}
          <div className="lg:hidden fade-in-up mt-[260px] space-y-2 px-1">
            <BookingForm compact />
            <a
              href="tel:+32484164905"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gold/90 backdrop-blur-sm text-ivory font-display tracking-widest text-xs uppercase hover:bg-gold transition-colors"
            >
              <span>📞</span> +32 484 16 49 05
            </a>
          </div>

          {/* Desktop form */}
          <div id="contact" className="fade-in-up hidden lg:block">
            <BookingForm />
          </div>
        </div>
      </section>

      {/* À propos — salon intro */}
      <section id="apropos" className="bg-ink text-ivory py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="eyebrow">À propos</p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.1] text-ivory">
            Le seul salon du Limbourg dédié aux cheveux afro, bouclés &amp; crépus
          </h2>
          <div className="mt-5 gold-rule" />
          <p className="mt-6 text-ivory/70 text-base sm:text-lg leading-relaxed">{t.hero.subtitle}</p>
          <p className="mt-4 text-ivory/55 text-sm sm:text-base leading-relaxed">
            Chez GiGi L Coiffure, chaque cliente — peau claire ou foncée, boucles fines ou crépues — trouve un
            savoir-faire pensé pour son type de cheveux et de peau. Tresses africaines, tissage, coloration, brushing,
            locks et microshading sous un même toit, à Tongres.
          </p>

          <div className="mt-10">
            <AboutGalleryFlow />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contact" className="btn-gold btn-gold-hover">
              Prendre rendez-vous
            </a>
            <a href="tel:+32484164905" className="btn-gold-outline hover:bg-gold hover:text-ivory transition-colors">
              +32 484 16 49 05
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// Subtle trust signals — single horizontal row like reference photo
function TrustBadges() {
  const { t } = useT();
  return (
    <div className="bg-carbon/80 backdrop-blur-sm border border-gold/30 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between sm:justify-start gap-2 sm:gap-6 flex-nowrap">
      {/* Google rating */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <div className="flex text-gold text-[10px] sm:text-xs leading-none">
          {"★★★★★".split("").map((s, i) => (
            <span key={i} className={i === 4 ? "opacity-50" : ""}>
              {s}
            </span>
          ))}
        </div>
        <span className="text-ivory text-[11px] sm:text-xs font-medium">4,6</span>
        <span className="text-ivory/40 text-[10px] sm:text-xs hidden xs:inline sm:inline">Google</span>
      </div>

      <span className="w-px h-4 bg-gold/25 shrink-0" aria-hidden />

      {/* Clients */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <span className="text-gold text-[11px] sm:text-xs" aria-hidden>
          ✓
        </span>
        <span className="text-ivory text-[11px] sm:text-xs font-medium">{t.hero.badges.clientsCount}</span>
        <span className="text-ivory/40 text-[10px] sm:text-xs hidden xs:inline sm:inline">{t.hero.badges.clients}</span>
      </div>

      <span className="w-px h-4 bg-gold/25 shrink-0" aria-hidden />

      {/* Certified */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <span className="text-gold text-[11px] sm:text-xs" aria-hidden>
          ♛
        </span>
        <span className="text-ivory text-[10px] sm:text-xs">{t.hero.badges.certifiedTitle}</span>
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

        {/* Category cards: 2×2 grid.
            Rij 1: Afro coiffure & Kapsalon  |  Rij 2: Microshading & Nails */}
        <div className="mt-12 lg:mt-14 grid grid-cols-2 gap-3 sm:gap-5">
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
                <div
                  className="w-full h-full flex-col items-center justify-center bg-gradient-to-br from-carbon to-ink"
                  style={{ display: "none" }}
                >
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
          <a
            href="/galerie"
            className="text-xs tracking-[0.2em] uppercase text-ink hover:text-gold border-b border-gold/40 hover:border-gold pb-1 transition-colors"
          >
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

const GALLERY_IMAGES = [
  "braids-bordeaux-glasses.jpeg",
  "burgundy-feedin-braids.jpeg",
  "cat-microshading.png",
  "cat-nails.jpeg",
  "cornrows-homme.jpeg",
  "curly-naturel.jpeg",
  "feedin-braids-cowrie.jpeg",
  "knotless-blond.jpeg",
  "microshading-sourcils.png",
  "nails-cat-eye-grey.jpeg",
  "nails-glitter-nude.jpeg",
  "nails-gold-chrome.jpeg",
  "nails-green-french.png",
  "nails-red-almond.jpeg",
  "tissage-bordeaux-wavy.jpeg",
  "tissage-lisse-brun.jpeg",
  "twists-curly-ends.jpeg",
];

function AboutGalleryFlow() {
  const col1 = GALLERY_IMAGES.filter((_, i) => i % 2 === 0);
  const col2 = GALLERY_IMAGES.filter((_, i) => i % 2 === 1);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5" style={{ height: "520px" }}>
      <GalleryColumn images={col1} direction="up" />
      <GalleryColumn images={col2} direction="down" />
    </div>
  );
}

function GalleryColumn({ images, direction }: { images: string[]; direction: "up" | "down" }) {
  const items = [...images, ...images, ...images];
  const animName = direction === "up" ? "galScrollUp" : "galScrollDown";
  const itemH = 240; // px — image card height + gap
  const totalH = images.length * itemH;

  return (
    <div className="relative overflow-hidden" style={{ height: "520px" }}>
      {/* Top fade (ink) */}
      <div
        className="absolute top-0 left-0 right-0 h-28 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, var(--ink, #0e0c0a) 0%, transparent 100%)" }}
      />
      {/* Bottom fade (ink) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, var(--ink, #0e0c0a) 0%, transparent 100%)" }}
      />

      <style>{`
        @keyframes galScrollUp {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-${totalH}px); }
        }
        @keyframes galScrollDown {
          0%   { transform: translateY(-${totalH}px); }
          100% { transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          animation: `${animName} ${images.length * 5}s linear infinite`,
          willChange: "transform",
        }}
      >
        {items.map((src, i) => (
          <div
            key={i}
            className="mb-3 sm:mb-5 border border-gold/30 p-1.5 bg-ink"
            style={{ height: `${itemH - 12}px` }}
          >
            <img src={`/gallery/${src}`} alt="" loading="lazy" className="block w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Reviews() {
  const { t } = useT();

  const REVIEWS = [
    {
      name: "Lahla Moussa",
      stars: 5,
      text: "Salon de qualité, la coiffeuse est au top, ambiance garantie, coiffure exactement ce que j'ai demandé. Je reviendrai ! 🔥🔥",
    },
    {
      name: "Sara Neven",
      stars: 5,
      text: "Mijn dochter haar haren zijn altijd super mooi in orde! Super bekwame Afrikaanse kapster.",
    },
    {
      name: "K. B.",
      stars: 5,
      text: "Coiffeuse vraiment très accueillante, sympathique, ponctuelle et professionnelle. Son salon est beau, propre, je recommande.",
    },
    {
      name: "drissia larabi",
      stars: 5,
      text: "C'était magnifique. Elle est très gentille. Je suis satisfaite de son travail. Un très très super broching !",
    },
    {
      name: "Jean François B.",
      stars: 5,
      text: "Accueil au top et le résultat de la coupe de cheveux est excellent, je recommande vivement.",
    },
    { name: "Marylene Rahir", stars: 5, text: "Super travail et super coiffeuse. Sympa et professionnelle." },
    {
      name: "Wendy",
      stars: 5,
      text: "Coiffeuse sympathique, accueil le client très bien, prend le temps de conseiller. Mon coiffeur préféré !",
    },
    {
      name: "christine leclercq",
      stars: 5,
      text: "Commerçante artiste comique avec beaucoup de professionnalisme. UNIQUE.",
    },
    {
      name: "Nathalie Alberico",
      stars: 5,
      text: "Coiffeuse professionnelle et super sympathique. On rigole beaucoup.",
    },
    {
      name: "Manuella Isabella",
      stars: 5,
      text: "Coiffeuse super sympa, travail de qualité je la recommande. Tjrs au top.",
    },
    { name: "Andre Lux", stars: 5, text: "Cadre exceptionnel, patronne divine et d'une gentillesse sans pareils." },
    { name: "Patricia Piedboeuf", stars: 5, text: "Ambiance joyeuse et travail tjrs parfait." },
    {
      name: "Jean Francois Carrasco",
      stars: 5,
      text: "Très bien accueillit, bien rigoler, je suis content de ma coupe aussi.",
    },
    { name: "LINA MOUSSA BACKA", stars: 5, text: "Best Salon du monde for me 🙏🏾💎" },
    { name: "Rachel Evrard", stars: 5, text: "Super patronne." },
    { name: "Régis SOSSOU BIADJA", stars: 5, text: "C'est juste top!!!" },
    { name: "Claudine Ida", stars: 5, text: "Génial." },
    {
      name: "patricia piedboeuf",
      stars: 5,
      text: "Un accueil plus que sympathique, on s'y sent comme à la maison. Merci à Armande pour son originalité.",
    },
    { name: "Novitz Janos", stars: 5, text: "Très bo travail." },
    { name: "Anick Rabe", stars: 5, text: "Convivial. La patronne est très gentille et propose un super accueil." },
  ];

  // Split into two columns — stagger so they feel different
  const col1 = REVIEWS.filter((_, i) => i % 2 === 0);
  const col2 = REVIEWS.filter((_, i) => i % 2 === 1);

  return (
    <section className="bg-sand py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <p className="eyebrow">{t.reviews?.eyebrow ?? "Google Reviews"}</p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl text-ink">
            {t.reviews?.title ?? "Ce que disent nos clientes"}
          </h2>
          <div className="mt-5 gold-rule" />
          <p className="mt-4 text-smoke text-sm">★ 4,6/5 · 28 avis Google vérifiés</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5" style={{ height: "520px" }}>
          <ReviewColumn reviews={col1} direction="up" />
          <ReviewColumn reviews={col2} direction="down" />
        </div>
      </div>
    </section>
  );
}

type ReviewItem = { name: string; stars: number; text: string };

function ReviewColumn({ reviews, direction }: { reviews: ReviewItem[]; direction: "up" | "down" }) {
  const [paused, setPaused] = useState(false);

  // Triple the list so we always have content above and below for seamless looping
  const items = [...reviews, ...reviews, ...reviews];

  // CSS animation: scrolls at 35s per copy, direction determines translateY sign
  const animName = direction === "up" ? "scrollUp" : "scrollDown";
  const itemH = 160; // px — approximate card height
  const totalH = reviews.length * itemH;

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: "520px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Top fade */}
      <div
        className="absolute top-0 left-0 right-0 h-28 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, var(--sand) 0%, transparent 100%)" }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, var(--sand) 0%, transparent 100%)" }}
      />

      <style>{`
        @keyframes scrollUp {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-${totalH}px); }
        }
        @keyframes scrollDown {
          0%   { transform: translateY(-${totalH}px); }
          100% { transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          animation: `${animName} ${reviews.length * 5}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          willChange: "transform",
        }}
      >
        {items.map((r, i) => {
          // Middle card of each visible trio gets full opacity; top & bottom fade via CSS mask above
          return (
            <div
              key={i}
              className="mb-3 bg-white border border-border p-4 rounded-lg"
              style={{ minHeight: `${itemH - 12}px` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-medium shrink-0">
                  {r.name[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium text-ink truncate">{r.name}</span>
              </div>
              <div className="text-gold text-xs mb-2">{"★".repeat(r.stars)}</div>
              <p className="text-smoke text-xs leading-relaxed line-clamp-4">{r.text}</p>
            </div>
          );
        })}
      </div>
    </div>
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
                  <span
                    className={`text-gold text-2xl font-light leading-none transition-transform ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
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
        <a href="#contact" className="btn-gold btn-gold-hover mt-8">
          {t.footer.ctaBtn}
        </a>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <p className="font-display text-xl">
            GiGi <span className="text-gold">L</span> Coiffure
          </p>
          <address className="mt-4 not-italic text-ivory/65 text-sm leading-relaxed">
            Koninksemsteenweg 144
            <br />
            3700 Tongeren — België
            <br />
            <a href="tel:+32484164905" className="text-gold hover:underline">
              +32 484 16 49 05
            </a>
          </address>
        </div>
        <div>
          <p className="eyebrow">{t.footer.hoursTitle}</p>
          <ul className="mt-4 text-ivory/65 text-sm space-y-1">
            {t.footer.hoursLines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">{t.footer.linksTitle}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                className="text-ivory/80 hover:text-gold"
                href="https://www.google.com/maps/search/?api=1&query=Koninksemsteenweg+144+Tongeren"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Maps →
              </a>
            </li>
            <li>
              <a
                className="text-ivory/80 hover:text-gold"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook →
              </a>
            </li>
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
