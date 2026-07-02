import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { BookingSection, Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/kapsalon-tongeren")({
  head: () => ({
    meta: [
      { title: "Kapsalon Tongeren — GiGi L Coiffure | Afro & Europees haar" },
      { name: "description", content: "Kapsalon in Tongeren voor afro en Europees haar. Vlechten, knipbeurten, brushing, haren kleuren en nagels. GiGi L Coiffure, Koninksemsteenweg 144, 3700 Tongeren." },
      { property: "og:title", content: "Kapsalon Tongeren — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/kapsalon-tongeren" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/kapsalon-tongeren" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "HairSalon",
      name: "GiGi L Coiffure", telephone: "+32484164905",
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.6", reviewCount: "28" },
      address: { "@type": "PostalAddress", streetAddress: "Koninksemsteenweg 144", postalCode: "3700", addressLocality: "Tongeren", addressCountry: "BE" },
      url: "https://gigilcoiffure.be/kapsalon-tongeren",
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Thursday","Friday","Saturday"], opens: "09:00", closes: "20:00" },
      ],
    }) }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-20 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Tongeren · Limburg · 4,6/5 Google</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">Kapsalon in Tongeren</h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-6 text-ivory/70 text-lg leading-relaxed">GiGi L Coiffure is het kapsalon in Tongeren voor afro én Europees haar. Vlechten, knipbeurten, brushing, haren kleuren, nagels en microshading — alles op Koninksemsteenweg 144. Beoordeeld 4,6/5 op Google door 28 klanten.</p>
            <Link to="/reservations" className="mt-8 btn-gold btn-gold-hover inline-flex">Afspraak in het kapsalon</Link>
          </div>
        </section>
        <section className="py-16 px-5 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-ink mb-4">Uw kapsalon in Tongeren voor elk haartype</h2>
          <p className="text-smoke leading-relaxed mb-8">Of u nu kroes, krullend, steil of getextureerd haar heeft — ons kapsalon in Tongeren heeft de expertise. We werken met de juiste technieken voor afro haar, maar ook voor klassieke Europese kapsels.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: "Afrikaanse vlechten", d: "Box braids, cornrows, knotless braids — het specialisme van ons kapsalon." },
              { t: "Brushing & föhnen", d: "Volume, glans en structuur dankzij een professionele brushing." },
              { t: "Haren kleuren & balayage", d: "Handgeschilderde kleur of eéndimensionele kleurbehandeling." },
              { t: "Weaves & pruiken", d: "Plaatsing van kwaliteitsweaves en pruiken op maat." },
              { t: "Nagels & pedicure", d: "Gelnagels, manicure en pedicure naast het kappersvak." },
              { t: "Microshading wenkbrauwen", d: "Permanente make-up voor wenkbrauwen die altijd verzorgd ogen." },
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
            <h2 className="font-display text-2xl text-ink mb-4">Openingsuren kapsalon Tongeren</h2>
            <p className="text-smoke">Ma, Do – Za: 09:00 – 20:00 · Di – Wo, Zo: op afspraak</p>
            <p className="text-smoke mt-2">Koninksemsteenweg 144, 3700 Tongeren — parking in de buurt beschikbaar.</p>
          </div>
        </section>
        <BookingSection />
      </main>
      <Footer />
    </LangProvider>
  ),
});
