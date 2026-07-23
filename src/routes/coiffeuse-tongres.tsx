import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { BookingSection, Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/coiffeuse-tongres")({
  head: () => ({
    meta: [
      { title: "Coiffeuse à Tongres — GiGi L Coiffure | Spécialiste cheveux afro" },
      { name: "description", content: "Coiffeuse spécialisée à Tongres en cheveux afro, bouclés et crépus. Tresses africaines, brushing, coloration, tissage et microshading. GiGi L Coiffure — Koninksemsteenweg 144, Tongres. ★ 4,6/5 Google." },
      { property: "og:title", content: "Coiffeuse à Tongres — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/coiffeuse-tongres" },
      { property: "og:image", content: "https://gigilcoiffure.be/gallery/tissage-lisse-brun.jpeg" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/coiffeuse-tongres" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HairSalon",
      name: "GiGi L Coiffure",
      description: "Coiffeuse spécialisée à Tongres en cheveux afro, bouclés et crépus.",
      telephone: "+32484164905",
      url: "https://gigilcoiffure.be/coiffeuse-tongres",
      address: { "@type": "PostalAddress", streetAddress: "Koninksemsteenweg 144", postalCode: "3700", addressLocality: "Tongres", addressCountry: "BE" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.6", reviewCount: "29" },
    }) }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-20 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Tongres · Limbourg · Spécialiste afro</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">
              Coiffeuse à Tongres
            </h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-6 text-ivory/70 text-lg leading-relaxed">
              GiGi L est votre coiffeuse à Tongres spécialisée dans les cheveux afro, bouclés, frisés et crépus — mais aussi européens. Tresses africaines, tissage, brushing, coloration, balayage, microshading et ongles. Koninksemsteenweg 144, Tongres.
            </p>
            <Link to="/reservations" className="mt-8 btn-gold btn-gold-hover inline-flex">
              Prendre rendez-vous
            </Link>
          </div>
        </section>

        <div className="w-full max-h-80 overflow-hidden">
          <img src="/gallery/tissage-lisse-brun.jpeg" alt="Coiffeuse à Tongres — GiGi L Coiffure"
            className="w-full h-full object-cover object-top" loading="lazy" />
        </div>

        <section className="py-14 px-5 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-ink mb-6">Votre coiffeuse spécialisée à Tongres</h2>
          <p className="text-smoke leading-relaxed mb-6">
            Trouver une bonne coiffeuse à Tongres qui maîtrise vraiment les cheveux afro et texturés n'est pas toujours facile. GiGi L Coiffure comble ce manque depuis plusieurs années avec un savoir-faire reconnu par ses clientes — 4,6/5 sur Google avec 29 avis.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: "Tresses africaines", d: "Box braids, cornrows, knotless, twists — la spécialité de votre coiffeuse à Tongres." },
              { t: "Brushing & coiffage", d: "Brushing professionnel pour volume, brillance et tenue." },
              { t: "Coloration & balayage", d: "Couleur en un ton, highlights ou balayage peint à la main." },
              { t: "Tissage & extensions", d: "Pose de tissage, retrait et extensions pour plus de volume ou de longueur." },
              { t: "Coupe femme & homme", d: "Coupe sur mesure adaptée à la forme de votre visage." },
              { t: "Microshading", d: "Sourcils redessinés — effet poudré naturel jusqu'à 18 mois." },
            ].map(s => (
              <div key={s.t} className="bg-white border border-border p-5">
                <h3 className="font-display text-lg text-ink mb-1">{s.t}</h3>
                <p className="text-smoke text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-sand p-6">
            <h3 className="font-display text-xl text-ink mb-4">FAQ — Coiffeuse à Tongres</h3>
            {[
              { q: "Faut-il prendre rendez-vous ?", a: "Oui, nous travaillons uniquement sur rendez-vous. Réservez en ligne ou appelez le +32 484 16 49 05." },
              { q: "La coiffeuse s'occupe-t-elle de tous les types de cheveux ?", a: "Oui — cheveux afro, bouclés, frisés, crépus et européens. Chaque texture est accueillie avec les techniques adaptées." },
              { q: "Où se trouve la coiffeuse à Tongres ?", a: "Koninksemsteenweg 144, 3700 Tongres — accessible depuis Vreren, Lauw, Koninksem et les environs." },
            ].map(f => (
              <div key={f.q} className="mb-4">
                <p className="font-medium text-ink">{f.q}</p>
                <p className="text-smoke text-sm mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-sand py-6 px-5">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-4">
            {[
              ["/salon-coiffure-tongres", "Salon de coiffure Tongres"],
              ["/vlechten-tongeren", "Tresses Tongres"],
              ["/braids-limburg", "Braids Limbourg"],
              ["/microshading-tongeren", "Microshading Tongres"],
            ].map(([to, label]) => (
              <Link key={to} to={to as any} className="text-gold hover:text-gold-deep text-sm underline underline-offset-2">{label} →</Link>
            ))}
          </div>
        </section>

        <BookingSection />
      </main>
      <Footer />
    </LangProvider>
  ),
});
