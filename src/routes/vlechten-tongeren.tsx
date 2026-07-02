import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { BookingSection, Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/vlechten-tongeren")({
  head: () => ({
    meta: [
      { title: "Vlechten Tongeren — Box braids, cornrows & tresses | GiGi L Coiffure" },
      { name: "description", content: "Specialist vlechten in Tongeren. Box braids, cornrows, knotless braids, feed-in braids en twists. GiGi L Coiffure — Koninksemsteenweg 144, Tongeren. Bereikbaar vanuit Bilzen, Hasselt en Sint-Truiden." },
      { property: "og:title", content: "Vlechten Tongeren — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/vlechten-tongeren" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/vlechten-tongeren" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "HairSalon",
      name: "GiGi L Coiffure", telephone: "+32484164905",
      address: { "@type": "PostalAddress", streetAddress: "Koninksemsteenweg 144", postalCode: "3700", addressLocality: "Tongeren", addressCountry: "BE" },
      url: "https://gigilcoiffure.be/vlechten-tongeren",
      description: "Specialist vlechten in Tongeren: box braids, cornrows, knotless braids, twists en feed-in braids.",
    }) }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-20 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Tongeren · Limburg</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">Vlechten in Tongeren</h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-6 text-ivory/70 text-lg leading-relaxed">Box braids, cornrows, knotless braids, feed-in braids, twists — GiGi L Coiffure is het enige kapsalon in Tongeren volledig gespecialiseerd in Afrikaanse vlechten. Bereikbaar vanuit Bilzen, Hasselt en Sint-Truiden.</p>
            <Link to="/reservations" className="mt-8 btn-gold btn-gold-hover inline-flex">Afspraak maken</Link>
          </div>
        </section>
        <div className="w-full max-h-80 overflow-hidden">
          <img src="/gallery/burgundy-feedin-braids.jpeg" alt="Vlechten in Tongeren — GiGi L Coiffure" className="w-full h-full object-cover object-center" loading="lazy" />
        </div>

        <section className="py-16 px-5 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-ink mb-8">Onze vlecht-diensten in Tongeren</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: "Box braids", d: "Klassieke of knotless — kort, middenlang of lang. Beschermen je haar maanden lang." },
              { t: "Cornrows", d: "Platte vlechten dicht op de schedel. Geschikt voor dames, heren en kinderen." },
              { t: "Feed-in braids", d: "Geleidelijk hair-in voor een natuurlijke haargrens en comfortabele zit." },
              { t: "Twists & Senegalese twists", d: "Gedraaide vlechten met een zijdezachte textuur en lang onderhoud." },
              { t: "Knotless box braids", d: "Geen knoop aan de wortel — minder trek, meer comfort, cleaner uitstraling." },
              { t: "Fulani & bohemian braids", d: "Gevlochten kapsels met decoratieve details voor events en fotoshoots." },
            ].map(s => (
              <div key={s.t} className="bg-white border border-border p-5">
                <h3 className="font-display text-lg text-ink mb-1">{s.t}</h3>
                <p className="text-smoke text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-sand py-12 px-5">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl text-ink mb-4">Hoe lang duurt vlechten?</h2>
            <p className="text-smoke leading-relaxed">Afhankelijk van de stijl en lengte rekenen we 2 tot 6 uur. Box braids tot op schouderhoogte: 2–3u. Lange knotless braids: 4–6u. We geven altijd een schatting bij de boeking zodat u de dag goed kunt plannen.</p>
            <h2 className="font-display text-2xl text-ink mt-8 mb-4">Vlechten in Tongeren — ook voor kinderen</h2>
            <p className="text-smoke leading-relaxed">GiGi L verwelkomt ook de jongsten. Cornrows en eenvoudige box braids zijn populaire keuzes voor meisjes. We werken geduldig en zorgzaam, ook met kleine klanten.</p>
          </div>
        </section>


        <section className="bg-sand py-6 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="text-smoke text-xs mb-3 uppercase tracking-wider">Gerelateerde diensten</p>
            <div className="flex flex-wrap gap-4">
            <Link to="/box-braids-tongeren" className="text-gold hover:text-gold-deep text-sm underline underline-offset-2">Box braids Tongeren</Link>
            <Link to="/kapsalon-tongeren" className="text-gold hover:text-gold-deep text-sm underline underline-offset-2">Kapsalon Tongeren</Link>
            <Link to="/kapster-tongeren" className="text-gold hover:text-gold-deep text-sm underline underline-offset-2">Kapster Tongeren</Link>
            </div>
          </div>
        </section>
        <BookingSection />
      </main>
      <Footer />
    </LangProvider>
  ),
});
