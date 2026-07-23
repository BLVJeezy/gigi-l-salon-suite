import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { BookingSection, Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/salon-coiffure-tongres")({
  head: () => ({
    meta: [
      { title: "Salon de coiffure à Tongres — GiGi L Coiffure | Spécialiste afro & européen" },
      { name: "description", content: "Salon de coiffure à Tongres spécialisé en cheveux afro, bouclés et crépus. Tresses africaines, tissage, brushing, coloration, microshading et ongles. GiGi L Coiffure — Koninksemsteenweg 144, Tongres." },
      { property: "og:title", content: "Salon de coiffure à Tongres — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/salon-coiffure-tongres" },
      { property: "og:image", content: "https://gigilcoiffure.be/gallery/cornrows-homme.jpeg" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/salon-coiffure-tongres" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HairSalon",
      name: "GiGi L Coiffure",
      description: "Salon de coiffure à Tongres spécialisé en cheveux afro, bouclés et crépus.",
      telephone: "+32484164905",
      url: "https://gigilcoiffure.be/salon-coiffure-tongres",
      address: { "@type": "PostalAddress", streetAddress: "Koninksemsteenweg 144", postalCode: "3700", addressLocality: "Tongres", addressCountry: "BE" },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Thursday","Friday","Saturday"], opens: "09:00", closes: "20:00" },
      ],
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.6", reviewCount: "29" },
    }) }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-20 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Tongres · Limbourg · Belgique</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">
              Salon de coiffure à Tongres
            </h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-6 text-ivory/70 text-lg leading-relaxed">
              GiGi L Coiffure est le salon de coiffure à Tongres spécialisé dans les cheveux afro, bouclés et crépus — mais aussi les cheveux européens. Tresses africaines, tissage, brushing, coloration, microshading et ongles : tout sous un même toit au Koninksemsteenweg 144.
            </p>
            <Link to="/reservations" className="mt-8 btn-gold btn-gold-hover inline-flex">
              Prendre rendez-vous
            </Link>
          </div>
        </section>

        <div className="w-full max-h-80 overflow-hidden">
          <img src="/gallery/cornrows-homme.jpeg" alt="Salon de coiffure à Tongres — GiGi L Coiffure"
            className="w-full h-full object-cover object-top" loading="lazy" />
        </div>

        <section className="py-14 px-5 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-ink mb-6">Un salon de coiffure unique à Tongres</h2>
          <p className="text-smoke leading-relaxed mb-8">
            Notre salon de coiffure à Tongres accueille toutes les clientes, quel que soit leur type de cheveux. Qu'il s'agisse de cheveux afro, bouclés, frisés, crépus ou lisses — nos coiffeuses maîtrisent les techniques adaptées à chaque texture.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: "Tresses africaines & braids", d: "Box braids, cornrows, knotless braids, twists — spécialité maison.", link: "/vlechten-tongeren" },
              { t: "Tissage & extensions", d: "Pose de tissage, extensions tape-in et perruques professionnelles.", link: "/extensions-tongeren" },
              { t: "Coiffure européenne", d: "Brushing, coloration, balayage, coupe femme & homme.", link: "/kapster-tongeren" },
              { t: "Microshading sourcils", d: "Sourcils redessinés — effet poudré naturel jusqu'à 18 mois.", link: "/microshading-tongeren" },
              { t: "Ongles & manucure", d: "Pose complète gel, retouche, vernis semi-permanent et pédicure.", link: "/nagels-tongeren" },
              { t: "Rasta & dreadlocks", d: "Pose et entretien de locks naturelles à Tongres.", link: "/vlechten-tongeren" },
            ].map(s => (
              <Link key={s.t} to={s.link as any} className="bg-white border border-border p-5 hover:border-gold transition-colors block">
                <h3 className="font-display text-lg text-ink mb-1">{s.t}</h3>
                <p className="text-smoke text-sm leading-relaxed">{s.d}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-sand py-12 px-5">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl text-ink mb-4">Pourquoi choisir notre salon de coiffure à Tongres ?</h2>
            <div className="space-y-3 text-smoke">
              <p>✓ Spécialiste cheveux afro, bouclés et crépus — le seul salon du Limbourg entièrement dédié</p>
              <p>✓ Ouvert lundi, jeudi au samedi — horaires larges de 09h00 à 20h00</p>
              <p>✓ Koninksemsteenweg 144, Tongres — accessible depuis Vreren, Lauw, Koninksem et les environs</p>
              <p>✓ 4,6/5 sur Google · 29 avis vérifiés</p>
              <p>✓ Réservation en ligne disponible 24h/24</p>
            </div>
          </div>
        </section>

        <section className="bg-sand py-6 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="text-smoke text-xs mb-3 uppercase tracking-wider">Autres services</p>
            <div className="flex flex-wrap gap-4">
              {[
                ["/vlechten-tongeren", "Tresses Tongres"],
                ["/braids-limburg", "Braids Limbourg"],
                ["/coiffeuse-tongres", "Coiffeuse Tongres"],
                ["/microshading-tongeren", "Microshading Tongres"],
                ["/nagels-tongeren", "Ongles Tongres"],
              ].map(([to, label]) => (
                <Link key={to} to={to as any} className="text-gold hover:text-gold-deep text-sm underline underline-offset-2">{label} →</Link>
              ))}
            </div>
          </div>
        </section>

        <BookingSection />
      </main>
      <Footer />
    </LangProvider>
  ),
});
