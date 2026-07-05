import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { BookingSection, Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/box-braids-tongeren")({
  head: () => ({
    meta: [
      { title: "Box Braids Tongeren — Knotless & klassiek | GiGi L Coiffure" },
      { name: "description", content: "Box braids in Tongeren — knotless box braids, klassieke box braids, kleur en lengte naar keuze. GiGi L Coiffure, Koninksemsteenweg 144, Tongeren. Bereikbaar vanuit Vreren, Lauw en Koninksem." },
      { property: "og:title", content: "Box Braids Tongeren — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/box-braids-tongeren" },
      { property: "og:image", content: "https://gigilcoiffure.be/gallery/knotless-blond.jpeg" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/box-braids-tongeren" }],
    scripts: [ { type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: 'Hoe lang duren box braids?', acceptedAnswer: { "@type": "Answer", text: 'Kort (tot schouders): 2-3 uur. Middenlang: 3-4 uur. Lang (taille of langer): 4-6 uur.' } }, { "@type": "Question", name: 'Hoe lang blijven box braids mooi?', acceptedAnswer: { "@type": "Answer", text: 'Gemiddeld 6 tot 8 weken bij goede verzorging. Slaap met een satijnen mutsje en bevochtig de haargrens regelmatig.' } }, { "@type": "Question", name: 'Wat kost een set box braids in Tongeren?', acceptedAnswer: { "@type": "Answer", text: 'De prijs varieert per lengte en stijl. Neem contact op voor een offerte op maat.' } }],
    }) }, { type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "HairSalon",
      name: "GiGi L Coiffure", telephone: "+32484164905",
      address: { "@type": "PostalAddress", streetAddress: "Koninksemsteenweg 144", postalCode: "3700", addressLocality: "Tongeren", addressCountry: "BE" },
      url: "https://gigilcoiffure.be/box-braids-tongeren",
      description: "Specialist in box braids in Tongeren — knotless en klassiek, in alle kleuren en lengtes.",
    }) }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-20 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Tongeren · Box braids specialist</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">Box braids in Tongeren</h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-6 text-ivory/70 text-lg leading-relaxed">Knotless box braids, klassieke box braids, jumbo of micro — GiGi L Coiffure is de specialist voor box braids in Tongeren. Kleur, lengte en dikte volledig naar uw wens. Beschermend kapsel dat 6 tot 8 weken mooi blijft.</p>
            <Link to="/reservations" className="mt-8 btn-gold btn-gold-hover inline-flex">Afspraak box braids</Link>
          </div>
        </section>
        <section className="py-16 px-5 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-ink mb-8">Box braids stijlen in Tongeren</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: "Knotless box braids", d: "Geen knoop aan de wortel — minder trek op de haargrens, comfortabeler en cleaner qua uitstraling." },
              { t: "Klassieke box braids", d: "Met knoop aan de basis voor extra stevigheid. Ideaal voor langere lengtes." },
              { t: "Jumbo box braids", d: "Dikke, opvallende braids die snel gezet zijn en een statement maken." },
              { t: "Micro box braids", d: "Fijne, subtiele braids die maandenlang netjes blijven." },
              { t: "Box braids met kleur", d: "Voeg kleur toe via ombre, highlights of een full colour — zonder chemische behandeling." },
              { t: "Box braids met curly ends", d: "Krul aan de uiteinden voor een romantisch, vrouwelijk effect." },
            ].map(s => (
              <div key={s.t} className="bg-white border border-border p-5">
                <h3 className="font-display text-lg text-ink mb-1">{s.t}</h3>
                <p className="text-smoke text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-sand p-6">
            <h3 className="font-display text-xl text-ink mb-4">Veelgestelde vragen over box braids</h3>
            {[
              { q: "Hoe lang duren box braids?", a: "Kort (tot schouders): 2–3 uur. Middenlang: 3–4 uur. Lang (taille of langer): 4–6 uur." },
              { q: "Hoe lang blijven box braids mooi?", a: "Gemiddeld 6 tot 8 weken bij goede verzorging. Slaap met een satijnen mutsje en bevochtig de haargrens regelmatig." },
              { q: "Wat kost een set box braids in Tongeren?", a: "De prijs varieert per lengte en stijl. Neem contact op voor een offerte op maat." },
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
            <Link to="/vlechten-tongeren" className="text-gold hover:text-gold-deep text-sm underline underline-offset-2">Vlechten Tongeren</Link>
            <Link to="/kapsalon-tongeren" className="text-gold hover:text-gold-deep text-sm underline underline-offset-2">Kapsalon Tongeren</Link>
            <Link to="/beauty-salon-tongeren" className="text-gold hover:text-gold-deep text-sm underline underline-offset-2">Beauty salon Tongeren</Link>
            </div>
          </div>
        </section>
        <BookingSection />
      </main>
      <Footer />
    </LangProvider>
  ),
});
