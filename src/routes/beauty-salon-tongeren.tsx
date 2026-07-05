import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { BookingSection, Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/beauty-salon-tongeren")({
  head: () => ({
    meta: [
      { title: "Beauty Salon Tongeren — Haar, nagels & microshading | GiGi L" },
      { name: "description", content: "Beauty salon in Tongeren voor haar, nagels en microshading. Vlechten, gelnagels, wenkbrauwen, brushing en meer. GiGi L Coiffure, Koninksemsteenweg 144, Tongeren." },
      { property: "og:title", content: "Beauty Salon Tongeren — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/beauty-salon-tongeren" },
      { property: "og:image", content: "https://gigilcoiffure.be/gallery/cornrows-homme.jpeg" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/beauty-salon-tongeren" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "BeautySalon",
      name: "GiGi L Coiffure", telephone: "+32484164905",
      address: { "@type": "PostalAddress", streetAddress: "Koninksemsteenweg 144", postalCode: "3700", addressLocality: "Tongeren", addressCountry: "BE" },
      url: "https://gigilcoiffure.be/beauty-salon-tongeren",
    }) }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-20 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Tongeren · Haar & schoonheid</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">Beauty salon in Tongeren</h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-6 text-ivory/70 text-lg leading-relaxed">GiGi L Coiffure is het enige beauty salon in Tongeren waar u voor haar én schoonheid terecht kunt. Vlechten, nagels, microshading, brushing, haren kleuren — alles onder één dak op Koninksemsteenweg 144.</p>
            <Link to="/reservations" className="mt-8 btn-gold btn-gold-hover inline-flex">Afspraak maken</Link>
          </div>
        </section>
        <section className="py-16 px-5 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-ink mb-8">Alles onder één dak in Tongeren</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: "Haar & vlechten", d: "Box braids, cornrows, weaves, locks, brushing en kleuringen voor elk haartype." },
              { t: "Gelnagels & manicure", d: "Volledige set, bijwerking, gel verwijderen, pedicure en semi-permanent lak." },
              { t: "Microshading wenkbrauwen", d: "Permanente make-up met een zacht poedereffect — tot 18 maanden mooi." },
              { t: "Pruiken & extensions", d: "Kwaliteitspruiken en extensions, verkoop en plaatsing op maat." },
            ].map(s => (
              <div key={s.t} className="bg-white border border-border p-5">
                <h3 className="font-display text-lg text-ink mb-1">{s.t}</h3>
                <p className="text-smoke text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-sand py-6 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="text-smoke text-xs mb-3 uppercase tracking-wider">Gerelateerde diensten</p>
            <div className="flex flex-wrap gap-4">
            <Link to="/vlechten-tongeren" className="text-gold hover:text-gold-deep text-sm underline underline-offset-2">Vlechten Tongeren</Link>
            <Link to="/nagels-tongeren" className="text-gold hover:text-gold-deep text-sm underline underline-offset-2">Nagels Tongeren</Link>
            <Link to="/microshading-tongeren" className="text-gold hover:text-gold-deep text-sm underline underline-offset-2">Microshading Tongeren</Link>
            </div>
          </div>
        </section>
        <BookingSection />
      </main>
      <Footer />
    </LangProvider>
  ),
});
