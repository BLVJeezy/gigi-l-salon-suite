import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { BookingSection, Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/extensions-tongeren")({
  head: () => ({
    meta: [
      { title: "Extensions & pruiken Tongeren — GiGi L Coiffure" },
      { name: "description", content: "Hair extensions en pruiken in Tongeren. Clip-in, tape-in, weave extensions en pruiken — professionele plaatsing bij GiGi L Coiffure, Koninksemsteenweg 144, Tongeren." },
      { property: "og:title", content: "Extensions Tongeren — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/extensions-tongeren" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/extensions-tongeren" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "HairSalon",
      name: "GiGi L Coiffure", telephone: "+32484164905",
      address: { "@type": "PostalAddress", streetAddress: "Koninksemsteenweg 144", postalCode: "3700", addressLocality: "Tongeren", addressCountry: "BE" },
      url: "https://gigilcoiffure.be/extensions-tongeren",
      description: "Hair extensions en pruiken in Tongeren — professionele plaatsing van weave, clip-in en tape-in extensions.",
    }) }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-20 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Tongeren · Hair extensions</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">
              Extensions & pruiken in Tongeren
            </h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-6 text-ivory/70 text-lg leading-relaxed">
              Meer volume, meer lengte of een compleet nieuwe look — GiGi L Coiffure plaatst hair extensions en pruiken in Tongeren. Van weave extensions tot clip-in en tape-in, steeds met kwaliteitshaar en een professionele techniek.
            </p>
            <Link to="/reservations" className="mt-8 btn-gold btn-gold-hover inline-flex">
              Afspraak extensions
            </Link>
          </div>
        </section>

        <div className="w-full max-h-80 overflow-hidden">
          <img src="/gallery/tissage-lisse-brun.jpeg" alt="Hair extensions Tongeren — GiGi L Coiffure"
            className="w-full h-full object-cover object-top" loading="lazy" />
        </div>

        <section className="py-16 px-5 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-ink mb-8">Soorten extensions in Tongeren</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: "Weave extensions", d: "Ingevlochten extensions op cornrows — de meest duurzame methode voor lang haar met maximaal volume." },
              { t: "Clip-in extensions", d: "Direct te bevestigen en te verwijderen. Ideaal voor speciale gelegenheden of om uit te proberen." },
              { t: "Tape-in extensions", d: "Plakstrip-methode voor een natuurlijk resultaat dat 4–6 weken mooi blijft." },
              { t: "Pruiken — volledige set", d: "Natuurlijk of synthetisch haar in alle kleuren en lengtes. Verkoop en professionele plaatsing." },
              { t: "Pruiken — cap fitting", d: "De juiste pruik voor uw hoofdvorm — we helpen bij de keuze en zetten de pruik op maat af." },
              { t: "Extensions onderhoud", d: "Bijwerking, verplaatsing en verzorging van bestaande weave of tape-in extensions." },
            ].map(s => (
              <div key={s.t} className="bg-white border border-border p-5">
                <h3 className="font-display text-lg text-ink mb-1">{s.t}</h3>
                <p className="text-smoke text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-sand p-6">
            <h3 className="font-display text-xl text-ink mb-4">Veelgestelde vragen over extensions</h3>
            {[
              { q: "Welke extensions passen bij mijn haar?", a: "Dat hangt af van uw haartype, levensstijl en gewenst resultaat. We bespreken de opties bij de boeking en adviseren eerlijk." },
              { q: "Hoe lang duren weave extensions?", a: "De plaatsing duurt 2 tot 4 uur afhankelijk van de hoeveelheid haar. Ze blijven 6 tot 8 weken mooi bij correcte verzorging." },
              { q: "Verkopen jullie ook haar?", a: "Ja, we werken met zorgvuldig geselecteerde kwaliteitshaar. U kunt ook uw eigen haar meebrengen." },
            ].map(f => (
              <div key={f.q} className="mb-4">
                <p className="font-medium text-ink">{f.q}</p>
                <p className="text-smoke text-sm mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-sand py-6 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="text-smoke text-xs mb-3 uppercase tracking-wider">Gerelateerde diensten</p>
            <div className="flex flex-wrap gap-4">
              {[
                ["/vlechten-tongeren", "Vlechten"],
                ["/kapsalon-tongeren", "Kapsalon Tongeren"],
                ["/kapster-tongeren", "Kapster Tongeren"],
                ["/beauty-salon-tongeren", "Beauty salon"],
              ].map(([to, label]) => (
                <Link key={to} to={to as any} className="text-gold hover:text-gold-deep text-sm underline underline-offset-2">{label}</Link>
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
