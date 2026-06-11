// /services — volledige dienstenpagina
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LangProvider, useT } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Nos services — GiGi L Coiffure Tongres" },
      { name: "description", content: "Tresses africaines, tissage, locks, microshading, perruques, mèches, ongles et maquillage à Tongres. Découvrez tous les services de GiGi L Coiffure." },
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

// Icon map per service index
const ICONS = ["✦", "✂", "⬡", "◈", "✿", "◉", "◎", "◇", "◈"];

// Extended detail copy per service (FR/NL/EN via index — matches i18n items order)
const SERVICE_DETAILS_FR = [
  "Box braids, cornrows, Fulani braids, twists et knotless braids. Comptez entre 2 et 6 heures selon le style. Nos tresses protègent la fibre capillaire et tiennent 6 à 10 semaines.",
  "Coupes femmes, hommes et enfants. Brushing, coupe sèche, mise en forme — chaque coupe est adaptée à la morphologie du visage et à la texture du cheveu.",
  "Création de locks de zéro, retwist, entretien et crochet braids. Une coiffure protectrice durable qui s'adapte à votre style de vie.",
  "Pose de tissages coud à l'aiguille ou en colle. Volume naturel, longueur sur mesure. Nous sélectionnons des mèches de qualité pour un rendu naturel.",
  "Chignons romantiques, coiffures de cérémonie et looks mariage. Chaque client mérite une coiffure à la hauteur du moment.",
  "Coloration permanente, semi-permanente, balayage et décoloration — adaptés aux cheveux texturés, crépus et fins. Diagnostic capillaire inclus.",
  "Microshading : sourcils redessinés avec un effet poudré durable. Résultat naturel, précis, qui tient jusqu'à 18 mois. Séance de retouche recommandée à 6 semaines.",
  "Prothèse ongulaire, nail art et maquillage semi-permanent. Sourcils, lèvres et eye-liner permanent pour un look soigné au quotidien.",
  "Vente et pose de perruques full-lace, lace front et closure. Mèches synthétiques et naturelles. Conseil personnalisé pour choisir la longueur, la texture et la couleur.",
];

const SERVICE_DETAILS_NL = [
  "Box braids, cornrows, Fulani braids, twists en knotless braids. Reken op 2 tot 6 uur afhankelijk van de stijl. Onze vlechten beschermen de haarvezel en houden 6 tot 10 weken.",
  "Knipbeurten voor dames, heren en kinderen. Föhnen, droogknippen, styling — elke coupe is aangepast aan de gezichtsvorm en haartextuur.",
  "Locks aanleggen van nul, retwist, onderhoud en crochet braids. Een duurzame beschermkapsel die past bij uw levensstijl.",
  "Weave-plaatsing met naald of lijm. Natuurlijk volume, lengte op maat. We selecteren kwaliteitsmèches voor een natuurlijke afwerking.",
  "Romantische opsteekkapsels, ceremonie-coiffures en bruidskapsel. Elke klant verdient een kapsel dat opgewassen is voor het moment.",
  "Permanente kleur, semi-permanent, balayage en ontkleuring — aangepast aan getextureerd, kroes- en fijn haar. Haardiagnose inbegrepen.",
  "Microshading: wenkbrauwen opnieuw getekend met een poedereffect dat tot 18 maanden meegaat. Natuurlijk en precies. Retouchezitting na 6 weken aanbevolen.",
  "Nagelprothese, nail art en semi-permanente make-up. Wenkbrauwen, lippen en eye-liner permanent voor een verzorgde dagelijkse look.",
  "Verkoop en plaatsing van full-lace, lace front en closure pruiken. Synthetische en natuurlijke extensions. Persoonlijk advies over lengte, textuur en kleur.",
];

const SERVICE_DETAILS_EN = [
  "Box braids, cornrows, Fulani braids, twists and knotless braids. Allow 2 to 6 hours depending on style. Our braids protect the hair fibre and last 6 to 10 weeks.",
  "Cuts for women, men and children. Blow-dry, dry cut, styling — every cut is adapted to your face shape and hair texture.",
  "Creating locks from scratch, retwist, maintenance and crochet braids. A lasting protective style that suits your lifestyle.",
  "Weave installation by needle or glue. Natural volume, tailored length. We select quality hair for a natural finish.",
  "Romantic updos, ceremony styles and bridal hair. Every client deserves a hairstyle worthy of the occasion.",
  "Permanent colour, semi-permanent, balayage and bleaching — adapted to textured, coily and fine hair. Hair diagnosis included.",
  "Microshading: brows redefined with a powder effect lasting up to 18 months. Natural and precise. Touch-up session recommended at 6 weeks.",
  "Nail extensions, nail art and semi-permanent make-up. Brows, lips and permanent eyeliner for a polished everyday look.",
  "Sale and fitting of full-lace, lace front and closure wigs. Synthetic and natural hair. Personalised advice on length, texture and colour.",
];

function ServicesPage() {
  const { t, lang } = useT();
  const [open, setOpen] = useState<number | null>(null);

  const details =
    lang === "nl" ? SERVICE_DETAILS_NL :
    lang === "en" ? SERVICE_DETAILS_EN :
    SERVICE_DETAILS_FR;

  return (
    <main className="min-h-screen bg-ivory pt-16">

      {/* ── Hero ── */}
      <section className="bg-ink text-ivory py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #C9A24B 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-end">
          <div>
            <p className="eyebrow">{t.services.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl text-ivory leading-[1.05]">
              {t.services.title}
            </h1>
            <div className="mt-6 gold-rule" />
            <p className="mt-6 text-ivory/60 text-base sm:text-lg leading-relaxed max-w-lg">
              {t.servicesPage.heroSub}
            </p>
          </div>
          <div className="flex lg:justify-end">
            <Link to="/reservations" className="btn-gold btn-gold-hover">
              {t.nav.book}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Services accordion/cards ── */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 lg:py-24">
        <div className="divide-y divide-border border-t border-b border-border">
          {t.services.items.map((s, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full py-6 sm:py-7 flex items-start sm:items-center gap-5 text-left group"
                  aria-expanded={isOpen}
                >
                  {/* Number + icon */}
                  <div className="flex-shrink-0 w-12 h-12 border border-gold/30 flex items-center justify-center group-hover:border-gold group-hover:bg-gold/5 transition-colors">
                    <span className="text-gold text-lg">{ICONS[i]}</span>
                  </div>
                  {/* Title + short desc */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-gold/50 text-xs tracking-[0.2em]">0{i + 1}</span>
                      <h2 className="font-display text-xl sm:text-2xl text-ink group-hover:text-gold transition-colors">{s.t}</h2>
                    </div>
                    <p className="mt-1 text-smoke text-sm leading-relaxed max-w-xl">{s.d}</p>
                  </div>
                  {/* Toggle */}
                  <span className={`flex-shrink-0 text-gold text-2xl font-light leading-none transition-transform duration-200 mt-1 sm:mt-0 ${isOpen ? "rotate-45" : ""}`}>+</span>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="pb-7 pl-17 sm:pl-20 grid sm:grid-cols-2 gap-6 lg:gap-12 items-start" style={{ paddingLeft: "4.25rem" }}>
                    <div>
                      <p className="text-smoke text-sm leading-relaxed">{details[i]}</p>
                      <Link
                        to="/reservations"
                        className="mt-5 inline-flex items-center gap-2 text-gold text-xs tracking-widest uppercase hover:gap-3 transition-all"
                      >
                        {t.servicesPage.bookCta} <span>→</span>
                      </Link>
                    </div>
                    <div className="bg-sand p-5">
                      <p className="eyebrow mb-3">{t.servicesPage.infoLabel}</p>
                      <ul className="space-y-2 text-sm text-smoke">
                        <li>📞 <a href="tel:+32484164905" className="text-gold hover:underline">+32 484 16 49 05</a></li>
                        <li>📍 Koninksemsteenweg 144, Tongeren</li>
                        <li>🕐 {t.servicesPage.byAppt}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Why block ── */}
      <section className="bg-carbon text-ivory py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.why.items.map((item, i) => (
              <div key={i} className="border-l-2 border-gold pl-5 py-1">
                <p className="font-display text-base text-ivory leading-snug">{item.t}</p>
                <p className="mt-2 text-ivory/55 text-xs leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="bg-sand py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-ink">{t.servicesPage.ctaTitle}</h2>
          <p className="mt-4 text-smoke max-w-lg mx-auto text-sm sm:text-base">{t.servicesPage.ctaSub}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/reservations" className="btn-gold btn-gold-hover">{t.nav.book}</Link>
            <a href="tel:+32484164905" className="btn-gold-outline hover:bg-gold hover:text-ink transition-colors">+32 484 16 49 05</a>
          </div>
        </div>
      </section>

    </main>
  );
}
