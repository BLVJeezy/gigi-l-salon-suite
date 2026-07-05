import { createFileRoute } from "@tanstack/react-router";
import { LangProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Hero, Services, Why, Gallery, Reviews, Faq, Footer } from "@/components/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GiGi L Coiffure Tongeren — Kapper, Nagels & Microshading" },
      { name: "description", content: "Kapsalon in Tongeren voor Afrikaans & Europees haar, gelnagels en microshading wenkbrauwen. Box braids, cornrows, vlechten, brushing, haren kleuren. GiGi L Coiffure — Koninksemsteenweg 144, Tongeren. ★ 4,6/5 Google." },
      { property: "og:title", content: "GiGi L Coiffure — Kapper, Nagels & Microshading in Tongeren" },
      { property: "og:description", content: "Kapsalon in Tongeren voor Afrikaans & Europees haar, gelnagels en microshading. Box braids, cornrows, brushing, haren kleuren. Koninksemsteenweg 144 — ook bereikbaar vanuit Bilzen, Hasselt en Sint-Truiden." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://gigilcoiffure.be/" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "canonical", href: "https://gigilcoiffure.be/" },
      { rel: "alternate", hrefLang: "fr", href: "https://gigilcoiffure.be/" },
      { rel: "alternate", hrefLang: "nl", href: "https://gigilcoiffure.be/" },
      { rel: "alternate", hrefLang: "en", href: "https://gigilcoiffure.be/" },
      { rel: "alternate", hrefLang: "x-default", href: "https://gigilcoiffure.be/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HairSalon",
          "@id": "https://gigilcoiffure.be/#salon",
          name: "GiGi L Coiffure",
          description: "Salon de coiffure africaine et européenne à Tongres, spécialisé dans les cheveux bouclés, frisés et crépus.",
          telephone: "+32484164905",
          url: "https://gigilcoiffure.be",
          image: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e55038d5-a1dd-4305-9820-c71f204eec96/id-preview-1d785840--f94e0263-b10f-4e07-8a89-3fb872bc24d0.lovable.app-1781178979248.png",
          priceRange: "€€",
          currenciesAccepted: "EUR",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Koninksemsteenweg 144",
            postalCode: "3700",
            addressLocality: "Tongeren",
            addressRegion: "Limburg",
            addressCountry: "BE",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 50.7757,
            longitude: 5.4515,
          },
          areaServed: [
            { "@type": "City", name: "Tongeren" },
            { "@type": "City", name: "Hasselt" },
            { "@type": "City", name: "Bilzen" },
            { "@type": "City", name: "Borgloon" },
          ],
          aggregateRating: { "@type": "AggregateRating", ratingValue: "4.6", reviewCount: "28" },
          openingHoursSpecification: [
            { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "19:00" },
          ],
          makesOffer: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tresses africaines" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tissage" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Microshading" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Coupes européennes" } },
          ],
        }),
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <LangProvider>
      <Header />
      <main>
        <Hero />
        <Services />
        <Why />
        <Gallery />
        <Reviews />
        <Faq />
      </main>
      <Footer />
    </LangProvider>
  );
}
