import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/nagels-tongeren")({
  head: () => ({
    meta: [
      { title: "Nagels Tongeren — Gel, gelnagels & manicure | GiGi L Coiffure" },
      { name: "description", content: "Gelnagels, gel nagels, manicure en pedicure in Tongeren. Volledige set, bijwerking, vernis semi-permanent. GiGi L Coiffure — Koninksemsteenweg 144, Tongeren." },
      { property: "og:title", content: "Nagels Tongeren — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/nagels-tongeren" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/nagels-tongeren" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "NailSalon",
      name: "GiGi L Coiffure — Nagels Tongeren", telephone: "+32484164905",
      address: { "@type": "PostalAddress", streetAddress: "Koninksemsteenweg 144", postalCode: "3700", addressLocality: "Tongeren", addressCountry: "BE" },
      url: "https://gigilcoiffure.be/nagels-tongeren",
    }) }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-20 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Tongeren · Limburg</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">Nagels in Tongeren</h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-6 text-ivory/70 text-lg leading-relaxed">Gelnagels, volledige set, bijwerking, pedicure en semi-permanent vernis — GiGi L Coiffure verzorgt uw nagels in Tongeren met oog voor detail. Van klassiek rood tot trendy cat-eye gel, alles is mogelijk.</p>
            <Link to="/reservations" className="mt-8 btn-gold btn-gold-hover inline-flex">Afspraak nagels</Link>
          </div>
        </section>

        <section className="py-16 px-5 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-ink mb-8">Nageldiensten in Tongeren</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: "Volledige set gelnagels", d: "Nieuwe set van 10 nagels — natuurlijk gelook of met kleur, lengte en vorm naar keuze." },
              { t: "Bijwerking (refill)", d: "Onderhoud van bestaande gelnagels elke 3–4 weken. Snel en netjes." },
              { t: "Gel verwijderen", d: "Veilig verwijderen zonder de natuurlijke nagel te beschadigen." },
              { t: "Semi-permanent vernis", d: "Kleur die 2–3 weken mooi blijft. Geen gel, geen schade." },
              { t: "Pedicure", d: "Verzorging van voeten en teennagels — ook gel of semi-permanent lak mogelijk." },
              { t: "Reparatie 1 nagel", d: "Eén gebroken nagel hersteld. Voor 2 of meer raden we bijwerking aan." },
            ].map(s => (
              <div key={s.t} className="bg-white border border-border p-5">
                <h3 className="font-display text-lg text-ink mb-1">{s.t}</h3>
                <p className="text-smoke text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 px-5 max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl text-ink mb-4">Afspraak maken voor nagels in Tongeren</h2>
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
