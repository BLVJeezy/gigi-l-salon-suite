import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/kapster-tongeren")({
  head: () => ({
    meta: [
      { title: "Kapster Tongeren — Kapper voor dames & heren | GiGi L Coiffure" },
      { name: "description", content: "Kapster in Tongeren voor dames en heren. Knipbeurt, brushing, haren kleuren, balayage en meer. GiGi L Coiffure — Koninksemsteenweg 144, Tongeren. Bereikbaar vanuit Bilzen en Hasselt." },
      { property: "og:title", content: "Kapster Tongeren — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/kapster-tongeren" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/kapster-tongeren" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "HairSalon",
      name: "GiGi L Coiffure", telephone: "+32484164905",
      address: { "@type": "PostalAddress", streetAddress: "Koninksemsteenweg 144", postalCode: "3700", addressLocality: "Tongeren", addressCountry: "BE" },
      url: "https://gigilcoiffure.be/kapster-tongeren",
    }) }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-20 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Tongeren · Kapper & kapster</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">Kapster in Tongeren</h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-6 text-ivory/70 text-lg leading-relaxed">GiGi L is uw kapster in Tongeren voor knipbeurten, brushing, haren kleuren, balayage en meer. Gespecialiseerd in afro- en getextureerd haar, maar ook voor Europese coupe en kleurbehandelingen. Bereikbaar vanuit Bilzen, Hasselt en Sint-Truiden.</p>
            <Link to="/reservations" className="mt-8 btn-gold btn-gold-hover inline-flex">Afspraak kapster</Link>
          </div>
        </section>
        <section className="py-16 px-5 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-ink mb-8">Diensten kapster Tongeren</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: "Knipbeurt dames", d: "Coupe op maat, afgestemd op uw gezichtsvormen en haartextuur." },
              { t: "Knipbeurt heren", d: "Strak of casual — wij knippen ook heren op afspraak." },
              { t: "Brushing", d: "Droogföhnen met een ronde borstel voor volume, glans en een verzorgde look." },
              { t: "Haren kleuren", d: "Eéndimensionele kleur, highlights of balayage — op maat geverfd." },
              { t: "Balayage", d: "Handgeschilderde kleurovergangen voor een naturel zonnekus-effect." },
              { t: "Kinderknipbeurt", d: "Geduldig en zorgzaam, ook voor de kleinsten." },
            ].map(s => (
              <div key={s.t} className="bg-white border border-border p-5">
                <h3 className="font-display text-lg text-ink mb-1">{s.t}</h3>
                <p className="text-smoke text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="py-12 px-5 max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl text-ink mb-4">Afspraak bij uw kapster in Tongeren</h2>
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
