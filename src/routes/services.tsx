import { createFileRoute, Link } from "@tanstack/react-router";
import { LangProvider, useT } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { BookingSection, Footer } from "@/components/sections";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Nos services — GiGi L Coiffure Tongres | Tresses, Nagels & Microshading" },
      { name: "description", content: "Tous les services de GiGi L Coiffure à Tongres : tresses africaines, box braids, kapsalon, microshading sourcils, ongles gel, extensions et perruques. Réservez en ligne." },
      { property: "og:title", content: "Nos services — GiGi L Coiffure Tongres" },
      { property: "og:url", content: "https://gigilcoiffure.be/services" },
      { property: "og:image", content: "https://gigilcoiffure.be/gallery/cornrows-homme.jpeg" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/services" }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <ServicesPage />
      <BookingSection />
      <Footer />
    </LangProvider>
  ),
});

const SERVICES = [
  {
    to: "/vlechten-tongeren",
    img: "/gallery/cornrows-homme.jpeg",
    labelNL: "Vlechten & braids",
    labelFR: "Tresses africaines",
    labelEN: "Braids",
    descNL: "Box braids, cornrows, knotless, feed-in braids, twists en Senegalese twists. De specialiteit van GiGi L.",
    descFR: "Box braids, cornrows, knotless, feed-in braids, twists et nattes sénégalaises. La spécialité de GiGi L.",
    descEN: "Box braids, cornrows, knotless, feed-in braids, twists and Senegalese twists. GiGi L's speciality.",
  },
  {
    to: "/box-braids-tongeren",
    img: "/gallery/knotless-blond.jpeg",
    labelNL: "Box braids",
    labelFR: "Box braids",
    labelEN: "Box braids",
    descNL: "Knotless of klassiek, kort of lang, met of zonder kleur. Beschermend kapsel dat 6–8 weken mooi blijft.",
    descFR: "Knotless ou classique, court ou long, avec ou sans couleur. Coiffure protectrice qui tient 6 à 8 semaines.",
    descEN: "Knotless or classic, short or long, with or without colour. Protective style lasting 6–8 weeks.",
  },
  {
    to: "/extensions-tongeren",
    img: "/gallery/tissage-lisse-brun.jpeg",
    labelNL: "Extensions & pruiken",
    labelFR: "Extensions & perruques",
    labelEN: "Extensions & wigs",
    descNL: "Weave extensions, tape-in, clip-in en pruiken. Professionele plaatsing op maat.",
    descFR: "Extensions weave, tape-in, clip-in et perruques. Pose professionnelle sur mesure.",
    descEN: "Weave, tape-in, clip-in extensions and wigs. Professional fitting tailored to you.",
  },
  {
    to: "/kapster-tongeren",
    img: "/gallery/tissage-lisse-brun.jpeg",
    labelNL: "Kapsalon",
    labelFR: "Coiffure européenne",
    labelEN: "Hair salon",
    descNL: "Brushing coupe, brushing, haren kleuren, balayage en knipbeurten voor dames en heren.",
    descFR: "Brushing coupe, brushing, coloration, balayage et coupes pour dames et hommes.",
    descEN: "Brushing cut, blow-dry, hair colouring, balayage and cuts for women and men.",
  },
  {
    to: "/microshading-tongeren",
    img: "/gallery/cat-microshading.png",
    labelNL: "Microshading wenkbrauwen",
    labelFR: "Microshading sourcils",
    labelEN: "Microshading brows",
    descNL: "Permanente make-up met een zacht poedereffect. Tot 18 maanden mooi, ook retouche mogelijk.",
    descFR: "Maquillage permanent avec un effet poudré naturel. Jusqu'à 18 mois, retouche possible.",
    descEN: "Permanent make-up with a soft powder effect. Lasts up to 18 months, touch-up available.",
  },
  {
    to: "/nagels-tongeren",
    img: "/gallery/cat-nails.jpeg",
    labelNL: "Nagels",
    labelFR: "Ongles",
    labelEN: "Nails",
    descNL: "Gelnagels, bijwerking, semi-permanente lak en pedicure. Alles voor perfect verzorgde nagels.",
    descFR: "Ongles gel, retouche, vernis semi-permanent et pédicure. Tout pour des ongles impeccables.",
    descEN: "Gel nails, infill, semi-permanent polish and pedicure. Everything for perfect nails.",
  },
  {
    to: "/beauty-salon-tongeren",
    img: "/gallery/nattes-curly-top.png",
    labelNL: "Beauty salon",
    labelFR: "Beauty salon",
    labelEN: "Beauty salon",
    descNL: "Haar, nagels én microshading onder één dak. Het complete beauty adres in Tongeren.",
    descFR: "Cheveux, ongles et microshading sous un même toit. L'adresse beauté complète à Tongres.",
    descEN: "Hair, nails and microshading under one roof. The complete beauty address in Tongeren.",
  },
  {
    to: "/salon-coiffure-tongres",
    img: "/gallery/burgundy-feedin-braids.jpeg",
    labelNL: "Salon de coiffure Tongres",
    labelFR: "Salon de coiffure Tongres",
    labelEN: "Hair salon Tongeren",
    descNL: "Alle haartypes welkom — afro, kroes, krullend en Europees haar. Één adres voor alles.",
    descFR: "Tous les types de cheveux bienvenus — afro, crépus, bouclés et européens. Une adresse pour tout.",
    descEN: "All hair types welcome — afro, coily, curly and European. One address for everything.",
  },
];

function ServicesPage() {
  const { t, lang } = useT();
  const getLabel = (s: typeof SERVICES[0]) => lang === "fr" ? s.labelFR : lang === "en" ? s.labelEN : s.labelNL;
  const getDesc  = (s: typeof SERVICES[0]) => lang === "fr" ? s.descFR  : lang === "en" ? s.descEN  : s.descNL;

  return (
    <main className="bg-ivory min-h-screen">
      {/* Hero */}
      <section className="bg-ink text-ivory pt-32 pb-16 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow">{t.nav.servicesPage}</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">
            {lang === "fr" ? "Tous nos services à Tongres" :
             lang === "en" ? "All our services in Tongeren" :
             "Al onze diensten in Tongeren"}
          </h1>
          <div className="mt-4 gold-rule" />
          <p className="mt-5 text-ivory/60 text-base leading-relaxed max-w-2xl">
            {lang === "fr"
              ? "Tresses africaines, coiffure européenne, microshading, ongles et extensions — tout sous un même toit à Koninksemsteenweg 144, Tongres."
              : lang === "en"
              ? "African braids, European hairdressing, microshading, nails and extensions — all under one roof at Koninksemsteenweg 144, Tongeren."
              : "Afrikaanse vlechten, kapsalon, microshading, nagels en extensions — alles onder één dak op Koninksemsteenweg 144, Tongeren."}
          </p>
        </div>
      </section>

      {/* Service grid */}
      <section className="py-14 px-5">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map(s => (
            <Link key={s.to} to={s.to as any}
              className="group bg-white border border-border hover:border-gold transition-colors block overflow-hidden">
              {/* Photo */}
              <div className="overflow-hidden h-52">
                <img src={s.img} alt={getLabel(s)}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy" />
              </div>
              {/* Content */}
              <div className="p-5">
                <h2 className="font-display text-xl text-ink mb-2">{getLabel(s)}</h2>
                <p className="text-smoke text-sm leading-relaxed">{getDesc(s)}</p>
                <div className="mt-4 text-gold text-sm font-medium group-hover:underline">
                  {lang === "fr" ? "En savoir plus →" : lang === "en" ? "Learn more →" : "Meer weten →"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
