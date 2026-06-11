// /reservations — dedicated booking page
import { createFileRoute } from "@tanstack/react-router";
import { LangProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections";
import { BookingForm } from "@/components/BookingForm";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Prendre rendez-vous — GiGi L Coiffure Tongres" },
      { name: "description", content: "Réservez votre rendez-vous chez GiGi L Coiffure à Tongres. Tresses africaines, tissage, microshading, perruques et coupes européennes." },
      { property: "og:title", content: "Prendre rendez-vous — GiGi L Coiffure" },
      { property: "og:url", content: "https://gigilcoiffure.be/reservations" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/reservations" }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <BookingPage />
      <Footer />
    </LangProvider>
  ),
});

function BookingPage() {
  const { t } = useT();
  return (
    <main className="min-h-screen bg-ivory pt-16">
      {/* Hero strip */}
      <div className="bg-ink text-ivory py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="eyebrow">{t.bookingPage.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl text-ivory leading-[1.05]">
            {t.bookingPage.title}
          </h1>
          <div className="mt-5 gold-rule" />
          <p className="mt-5 text-ivory/65 max-w-xl text-base sm:text-lg leading-relaxed">
            {t.bookingPage.subtitle}
          </p>
        </div>
      </div>

      {/* Form + info grid */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <BookingForm />

        {/* Info sidebar */}
        <div className="space-y-10">
          <div>
            <p className="eyebrow">{t.bookingPage.infoTitle}</p>
            <ul className="mt-5 space-y-4">
              {t.bookingPage.infoItems.map((item, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="text-gold font-display text-lg leading-none mt-0.5">0{i + 1}</span>
                  <div>
                    <p className="text-ink font-medium text-sm">{item.t}</p>
                    <p className="text-smoke text-sm mt-0.5 leading-relaxed">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-border pt-8">
            <p className="eyebrow">{t.bookingPage.hoursTitle}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-smoke">
              {t.footer.hoursLines.map(l => <li key={l}>{l}</li>)}
            </ul>
          </div>

          <div className="border-t border-border pt-8">
            <p className="eyebrow">{t.bookingPage.contactTitle}</p>
            <div className="mt-4 space-y-2 text-sm text-smoke">
              <p><a href="tel:+32484164905" className="text-gold hover:underline">+32 484 16 49 05</a></p>
              <p>Koninksemsteenweg 144, 3700 Tongeren</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
