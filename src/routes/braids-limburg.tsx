import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { BookingSection, Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/braids-limburg")({
  head: () => ({
    meta: [
      { title: "Braids Limburg — Box braids, cornrows & vlechten | GiGi L Coiffure Tongeren" },
      { name: "description", content: "Braids in Limburg — box braids, cornrows, knotless braids en feed-in braids. GiGi L Coiffure in Tongeren, het enige gespecialiseerde salon voor afro vlechten in Limburg. Bereikbaar vanuit Hasselt, Genk, Bilzen en heel Limburg." },
      { property: "og:title", content: "Braids Limburg — GiGi L Coiffure Tongeren" },
      { property: "og:url", content: "https://gigilcoiffure.be/braids-limburg" },
      { property: "og:image", content: "https://gigilcoiffure.be/gallery/burgundy-feedin-braids.jpeg" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/braids-limburg" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HairSalon",
      name: "GiGi L Coiffure",
      description: "Specialist in braids in Limburg — box braids, cornrows, knotless en feed-in braids in Tongeren.",
      telephone: "+32484164905",
      url: "https://gigilcoiffure.be/braids-limburg",
      address: { "@type": "PostalAddress", streetAddress: "Koninksemsteenweg 144", postalCode: "3700", addressLocality: "Tongeren", addressCountry: "BE" },
      areaServed: [
        { "@type": "City", name: "Tongeren" },
        { "@type": "City", name: "Hasselt" },
        { "@type": "City", name: "Genk" },
        { "@type": "City", name: "Bilzen" },
        { "@type": "AdministrativeArea", name: "Limburg" },
      ],
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.6", reviewCount: "29" },
    }) }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-20 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Limburg · Tongeren · Afro specialist</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">
              Braids in Limburg
            </h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-6 text-ivory/70 text-lg leading-relaxed">
              Op zoek naar braids in Limburg? GiGi L Coiffure in Tongeren is het enige salon in Limburg volledig gespecialiseerd in Afrikaanse vlechten. Box braids, cornrows, knotless braids, feed-in braids en twists — bereikbaar vanuit Hasselt, Genk, Bilzen en heel Limburg.
            </p>
            <Link to="/reservations" className="mt-8 btn-gold btn-gold-hover inline-flex">
              Afspraak braids Limburg
            </Link>
          </div>
        </section>

        <div className="w-full max-h-80 overflow-hidden">
          <img src="/gallery/burgundy-feedin-braids.jpeg" alt="Braids Limburg — GiGi L Coiffure Tongeren"
            className="w-full h-full object-cover object-center" loading="lazy" />
        </div>

        <section className="py-14 px-5 max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-ink mb-6">De braids specialist van Limburg</h2>
          <p className="text-smoke leading-relaxed mb-8">
            Klanten komen voor braids uit heel Limburg naar GiGi L Coiffure in Tongeren — vanuit Hasselt (25 min), Genk (35 min), Bilzen (10 min) en Sint-Truiden (20 min). Want echte specialisten in afro vlechten zijn zeldzaam in Limburg.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: "Box braids Limburg", d: "Knotless of klassiek, kort of lang — de populairste braids stijl in Limburg." },
              { t: "Cornrows Limburg", d: "Platte vlechten op de schedel — voor dames, heren en kinderen." },
              { t: "Feed-in braids Limburg", d: "Geleidelijk haar toegevoegd voor een natuurlijke haargrens." },
              { t: "Knotless braids Limburg", d: "Geen knoop aan de wortel — minder trek, meer comfort." },
              { t: "Twists & Senegalese twists", d: "Gedraaide vlechten voor een elegante, langdurige look." },
              { t: "Rasta / Dreadlocks", d: "Aanleg en onderhoud van naturelle locks in Limburg." },
            ].map(s => (
              <div key={s.t} className="bg-white border border-border p-5">
                <h3 className="font-display text-lg text-ink mb-1">{s.t}</h3>
                <p className="text-smoke text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-sand p-6">
            <h2 className="font-display text-xl text-ink mb-4">Bereikbaar vanuit heel Limburg</h2>
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-smoke">
              {[
                ["Hasselt", "~25 min"],
                ["Genk", "~35 min"],
                ["Bilzen", "~10 min"],
                ["Sint-Truiden", "~20 min"],
                ["Maaseik", "~45 min"],
                ["Tongeren", "0 min — we zijn hier!"],
              ].map(([city, time]) => (
                <div key={city} className="flex justify-between border-b border-border py-2">
                  <span className="font-medium text-ink">{city}</span>
                  <span>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-sand py-6 px-5">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-4">
            {[
              ["/vlechten-tongeren", "Vlechten Tongeren"],
              ["/box-braids-tongeren", "Box braids Tongeren"],
              ["/salon-coiffure-tongres", "Salon de coiffure Tongres"],
              ["/kapsalon-tongeren", "Kapsalon Tongeren"],
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
