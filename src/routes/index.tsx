import { createFileRoute } from "@tanstack/react-router";
import { LangProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Hero, Services, Why, Gallery, Faq, Footer } from "@/components/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GiGi L Coiffure — Salon de coiffure africaine & européenne à Tongres" },
      { name: "description", content: "Salon de coiffure à Tongres spécialisé cheveux bouclés, frisés et crépus : tresses africaines, tissage, rastas, microshading, perruques & mèches." },
      { property: "og:title", content: "GiGi L Coiffure — Salon de coiffure à Tongres" },
      { property: "og:description", content: "Spécialiste des cheveux bouclés, frisés et crépus. Tresses, tissage, microshading, perruques & mèches à Tongeren." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "alternate", hreflang: "fr", href: "/" },
      { rel: "alternate", hreflang: "nl", href: "/" },
      { rel: "alternate", hreflang: "en", href: "/" },
      { rel: "alternate", hreflang: "x-default", href: "/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HairSalon",
          name: "GiGi L Coiffure",
          telephone: "+32484164905",
          url: "https://gigilcoiffure.be",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Koninksemsteenweg 144",
            postalCode: "3700",
            addressLocality: "Tongeren",
            addressCountry: "BE",
          },
          aggregateRating: { "@type": "AggregateRating", ratingValue: "4.6", reviewCount: "28" },
          openingHours: ["Th 09:00-18:00", "Fr 09:00-18:00", "Sa 09:00-18:00"],
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
        <Faq />
      </main>
      <Footer />
    </LangProvider>
  );
}
