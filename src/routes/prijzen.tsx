import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { BookingSection, Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/prijzen")({
  head: () => ({
    meta: [
      { title: "Prijzen — GiGi L Coiffure Tongeren | Kapper, Nagels & Microshading" },
      { name: "description", content: "Prijzen van GiGi L Coiffure in Tongeren. Box braids, cornrows, vlechten, gelnagels, microshading wenkbrauwen, brushing, haren kleuren en extensions. Transparante tarieven, geen verrassingen." },
      { property: "og:title", content: "Prijzen — GiGi L Coiffure Tongeren" },
      { property: "og:url", content: "https://gigilcoiffure.be/prijzen" },
      { property: "og:image", content: "https://gigilcoiffure.be/gallery/cornrows-homme.jpeg" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/prijzen" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HairSalon",
      name: "GiGi L Coiffure",
      telephone: "+32484164905",
      address: { "@type": "PostalAddress", streetAddress: "Koninksemsteenweg 144", postalCode: "3700", addressLocality: "Tongeren", addressCountry: "BE" },
      url: "https://gigilcoiffure.be/prijzen",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Diensten & prijzen GiGi L Coiffure Tongeren",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Box braids" }, priceSpecification: { "@type": "PriceSpecification", price: "80", priceCurrency: "EUR", minPrice: "80", description: "Vanaf €80 — afhankelijk van lengte en stijl" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cornrows" }, priceSpecification: { "@type": "PriceSpecification", price: "40", priceCurrency: "EUR", minPrice: "40" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Gelnagels volledige set" }, priceSpecification: { "@type": "PriceSpecification", price: "45", priceCurrency: "EUR", minPrice: "45" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Microshading wenkbrauwen" }, priceSpecification: { "@type": "PriceSpecification", price: "180", priceCurrency: "EUR", minPrice: "180" } },
        ],
      },
    }) }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-16 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Tongeren · Transparante tarieven</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">Prijzen</h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-5 text-ivory/60 text-base leading-relaxed">
              Onderstaande prijzen zijn richtprijzen. De definitieve prijs wordt besproken bij de boeking — afhankelijk van haarlengte, hoeveelheid materiaal en behandelingsduur. Geen verrassingen achteraf.
            </p>
          </div>
        </section>

        {/* ── VLECHTEN & HAAR ── */}
        <section className="py-14 px-5 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <img src="/gallery/cornrows-homme.jpeg" alt="Vlechten en afro haar GiGi L Coiffure Tongeren"
              className="w-20 h-20 object-cover object-top shrink-0" />
            <div>
              <h2 className="font-display text-2xl text-ink">Afro coiffure & vlechten</h2>
              <p className="text-smoke text-sm mt-1">Box braids, cornrows, twists, locks en meer</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {[
              { s: "Box braids — kort (tot schouders)", p: "vanaf €80" },
              { s: "Box braids — middenlang", p: "vanaf €110" },
              { s: "Box braids — lang (taille of langer)", p: "vanaf €140" },
              { s: "Knotless box braids", p: "vanaf €90" },
              { s: "Cornrows — eenvoudig", p: "vanaf €40" },
              { s: "Cornrows — complex (geometrisch)", p: "vanaf €60" },
              { s: "Feed-in braids", p: "vanaf €50" },
              { s: "Senegalese twists", p: "vanaf €100" },
              { s: "Crochet braids", p: "vanaf €70" },
              { s: "Locks aanmaken", p: "op aanvraag" },
              { s: "Locks onderhoud", p: "vanaf €40" },
              { s: "Chignon / gelegenheidskapsel", p: "vanaf €50" },
            ].map(r => (
              <div key={r.s} className="flex justify-between py-3 text-sm">
                <span className="text-ink">{r.s}</span>
                <span className="text-gold font-medium shrink-0 ml-4">{r.p}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── KAPSALON ── */}
        <section className="bg-sand py-14 px-5">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <img src="/gallery/tissage-lisse-brun.jpeg" alt="Kapsalon Tongeren — brushing, kleuren, knipbeurt"
                className="w-20 h-20 object-cover object-top shrink-0" />
              <div>
                <h2 className="font-display text-2xl text-ink">Kapsalon</h2>
                <p className="text-smoke text-sm mt-1">Brushing, kleuren, knipbeurt dames & heren</p>
              </div>
            </div>
            <div className="divide-y divide-border">
              {[
                { s: "Knipbeurt dames", p: "vanaf €25" },
                { s: "Knipbeurt heren", p: "vanaf €20" },
                { s: "Kinderknipbeurt", p: "vanaf €15" },
                { s: "Brushing (kort haar)", p: "vanaf €25" },
                { s: "Brushing (lang haar)", p: "vanaf €35" },
                { s: "Haren kleuren (1 kleur)", p: "vanaf €45" },
                { s: "Highlights / balayage", p: "vanaf €70" },
                { s: "Tissage / weave plaatsing", p: "vanaf €80" },
                { s: "Tissage verwijderen", p: "vanaf €20" },
              ].map(r => (
                <div key={r.s} className="flex justify-between py-3 text-sm">
                  <span className="text-ink">{r.s}</span>
                  <span className="text-gold font-medium shrink-0 ml-4">{r.p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── NAGELS ── */}
        <section className="py-14 px-5 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <img src="/gallery/cat-nails.jpeg" alt="Gelnagels en manicure Tongeren — GiGi L Coiffure"
              className="w-20 h-20 object-cover object-center shrink-0" />
            <div>
              <h2 className="font-display text-2xl text-ink">Nagels</h2>
              <p className="text-smoke text-sm mt-1">Gelnagels, manicure, pedicure</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {[
              { s: "Volledige set gelnagels", p: "vanaf €45" },
              { s: "Bijwerking (refill)", p: "vanaf €35" },
              { s: "Gel verwijderen", p: "vanaf €15" },
              { s: "Semi-permanente lak", p: "vanaf €25" },
              { s: "Pedicure zonder tips", p: "vanaf €30" },
              { s: "Pedicure met gel", p: "vanaf €45" },
              { s: "Reparatie 1 nagel", p: "€5" },
            ].map(r => (
              <div key={r.s} className="flex justify-between py-3 text-sm">
                <span className="text-ink">{r.s}</span>
                <span className="text-gold font-medium shrink-0 ml-4">{r.p}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── MICROSHADING ── */}
        <section className="bg-sand py-14 px-5">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <img src="/gallery/cat-microshading.png" alt="Microshading wenkbrauwen Tongeren — GiGi L Coiffure"
                className="w-20 h-20 object-cover object-center shrink-0" />
              <div>
                <h2 className="font-display text-2xl text-ink">Microshading</h2>
                <p className="text-smoke text-sm mt-1">Permanente make-up wenkbrauwen</p>
              </div>
            </div>
            <div className="divide-y divide-border">
              {[
                { s: "Microshading — volledige behandeling", p: "vanaf €180" },
                { s: "Retouche (binnen 8 weken)", p: "vanaf €60" },
                { s: "Retouche (na 8 weken)", p: "vanaf €100" },
                { s: "Consult", p: "gratis" },
              ].map(r => (
                <div key={r.s} className="flex justify-between py-3 text-sm">
                  <span className="text-ink">{r.s}</span>
                  <span className="text-gold font-medium shrink-0 ml-4">{r.p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXTENSIONS ── */}
        <section className="py-14 px-5 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <img src="/gallery/tissage-lisse-brun.jpeg" alt="Extensions en pruiken Tongeren — GiGi L Coiffure"
              className="w-20 h-20 object-cover object-top shrink-0" />
            <div>
              <h2 className="font-display text-2xl text-ink">Extensions & pruiken</h2>
              <p className="text-smoke text-sm mt-1">Weave, clip-in, tape-in en pruiken</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {[
              { s: "Weave extensions — plaatsing", p: "vanaf €80" },
              { s: "Tape-in extensions — plaatsing", p: "vanaf €70" },
              { s: "Pruik — plaatsing & styling", p: "vanaf €40" },
              { s: "Extensions onderhoud", p: "vanaf €30" },
            ].map(r => (
              <div key={r.s} className="flex justify-between py-3 text-sm">
                <span className="text-ink">{r.s}</span>
                <span className="text-gold font-medium shrink-0 ml-4">{r.p}</span>
              </div>
            ))}
          </div>
          <p className="text-smoke text-xs mt-6 leading-relaxed border-t border-border pt-4">
            * Haar/materiaal is niet inbegrepen tenzij vermeld. Prijzen kunnen variëren op basis van haarlengte en -dikte.
            Definitieve prijs wordt altijd besproken vóór de behandeling start.
          </p>
        </section>

        {/* Internal links */}
        <section className="bg-ink py-8 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="text-ivory/30 text-xs uppercase tracking-wider mb-4">Meer weten</p>
            <div className="flex flex-wrap gap-4">
              {[
                ["/vlechten-tongeren", "Vlechten"],
                ["/nagels-tongeren", "Nagels"],
                ["/microshading-tongeren", "Microshading"],
                ["/kapsalon-tongeren", "Kapsalon"],
                ["/extensions-tongeren", "Extensions"],
                ["/box-braids-tongeren", "Box braids"],
              ].map(([to, label]) => (
                <Link key={to} to={to as any} className="text-gold hover:text-ivory text-sm underline underline-offset-2 transition-colors">{label} →</Link>
              ))}
            </div>
          </div>
        </section>

        <BookingSection title="Afspraak maken" />
      </main>
      <Footer />
    </LangProvider>
  ),
});
