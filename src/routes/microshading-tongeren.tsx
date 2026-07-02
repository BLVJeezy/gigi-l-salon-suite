import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/microshading-tongeren")({
  head: () => ({
    meta: [
      { title: "Microshading Tongeren — Permanente wenkbrauwen | GiGi L Coiffure" },
      { name: "description", content: "Microshading in Tongeren — permanente make-up voor wenkbrauwen met een natuurlijk poedereffect. GiGi L Coiffure, Koninksemsteenweg 144, Tongeren. Ook retouche mogelijk." },
      { property: "og:title", content: "Microshading Tongeren — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/microshading-tongeren" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/microshading-tongeren" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "BeautySalon",
      name: "GiGi L Coiffure — Microshading Tongeren", telephone: "+32484164905",
      address: { "@type": "PostalAddress", streetAddress: "Koninksemsteenweg 144", postalCode: "3700", addressLocality: "Tongeren", addressCountry: "BE" },
      url: "https://gigilcoiffure.be/microshading-tongeren",
      description: "Microshading en permanente wenkbrauwen in Tongeren met een natuurlijk poedereffect.",
    }) }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-20 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Tongeren · Permanente make-up</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">Microshading in Tongeren</h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-6 text-ivory/70 text-lg leading-relaxed">Wenkbrauwen die er elke dag perfect uitzien — zonder potlood of poeder. Microshading geeft een zacht, poederachtig effect dat maandenlang mooi blijft. GiGi L Coiffure biedt microshading aan in Tongeren, bereikbaar vanuit Bilzen, Hasselt en Sint-Truiden.</p>
            <Link to="/reservations" className="mt-8 btn-gold btn-gold-hover inline-flex">Afspraak microshading</Link>
          </div>
        </section>

        <section className="py-16 px-5 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-ink mb-6">Wat is microshading?</h2>
          <p className="text-smoke leading-relaxed mb-6">Microshading is een vorm van permanente make-up waarbij kleine stipjes pigment in de huid worden aangebracht. Het resultaat lijkt op gepoedered make-up — zacht, gevuld en symmetrisch. Ideaal voor dunne, asymmetrische of schaarse wenkbrauwen.</p>
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            {[
              { t: "Microshading (volledige behandeling)", d: "Meting, tekening op maat, pigmentering en nabehandeling. Resultaat zichtbaar tot 12–18 maanden." },
              { t: "Retouche", d: "Opfrissing van een eerder behandeld stel wenkbrauwen — kleurnuance aanpassen of contour bijwerken." },
              { t: "Consult", d: "Twijfelt u? We bespreken uw wensen en de verwachte resultaten vóór de behandeling." },
            ].map(s => (
              <div key={s.t} className="bg-white border border-border p-5">
                <h3 className="font-display text-lg text-ink mb-1">{s.t}</h3>
                <p className="text-smoke text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-sand p-6">
            <h3 className="font-display text-xl text-ink mb-3">Veelgestelde vragen over microshading</h3>
            {[
              { q: "Doet microshading pijn?", a: "Er wordt een verdovingscrème aangebracht vóór de behandeling. De meeste klanten ervaren slechts een licht gevoel van druk." },
              { q: "Hoe lang duurt het resultaat?", a: "Gemiddeld 12 tot 18 maanden, afhankelijk van huidtype en nazorg. Een retouche na 6–8 weken wordt aanbevolen." },
              { q: "Is microshading geschikt voor mij?", a: "Microshading werkt op nagenoeg alle huidtypes. Bij twijfel nemen we tijd voor een consult vóór de boeking." },
            ].map(f => (
              <div key={f.q} className="mb-4">
                <p className="font-medium text-ink">{f.q}</p>
                <p className="text-smoke text-sm mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 px-5 max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl text-ink mb-4">Microshading boeken in Tongeren</h2>
          <p className="text-smoke mb-6">Koninksemsteenweg 144, 3700 Tongeren · Ma, Do–Za: 09:00–20:00</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/reservations" className="btn-gold btn-gold-hover inline-flex justify-center">Online boeken</Link>
            <a href="tel:+32484164905" className="btn-gold-outline inline-flex justify-center">📞 +32 484 16 49 05</a>
          </div>
        </section>
      </main>
      <Footer />
    </LangProvider>
  ),
});
