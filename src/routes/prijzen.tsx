import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { BookingSection, Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";
import { listPublicServices } from "@/lib/services.functions";

export const Route = createFileRoute("/prijzen")({
  loader: async () => {
    try {
      return await listPublicServices();
    } catch {
      return { services: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Prijzen — GiGi L Coiffure Tongeren | Kapper, Nagels & Microshading" },
      { name: "description", content: "Prijzen van GiGi L Coiffure in Tongeren. Box braids, cornrows, vlechten, gelnagels, microshading wenkbrauwen, brushing, haren kleuren en extensions. Transparante tarieven, geen verrassingen." },
      { property: "og:title", content: "Prijzen — GiGi L Coiffure Tongeren" },
      { property: "og:url", content: "https://gigilcoiffure.be/prijzen" },
      { property: "og:image", content: "https://gigilcoiffure.be/gallery/cornrows-homme.jpeg" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/prijzen" }],
  }),
  component: PrijzenPage,
});

const CATEGORY_CONFIG: Record<string, {
  label: string;
  sub: string;
  img: string;
  alt: string;
  bg: boolean;
}> = {
  coiffure: {
    label: "Afro coiffure & vlechten",
    sub: "Box braids, cornrows, twists, locks en meer",
    img: "/gallery/cornrows-homme.jpeg",
    alt: "Vlechten en afro haar GiGi L Coiffure Tongeren",
    bg: false,
  },
  kapsalon: {
    label: "Kapsalon",
    sub: "Brushing, kleuren, knipbeurt dames & heren",
    img: "/gallery/tissage-lisse-brun.jpeg",
    alt: "Kapsalon Tongeren — brushing, kleuren, knipbeurt",
    bg: true,
  },
  nails: {
    label: "Nagels",
    sub: "Gelnagels, manicure, pedicure",
    img: "/gallery/cat-nails.jpeg",
    alt: "Gelnagels en manicure Tongeren — GiGi L Coiffure",
    bg: false,
  },
  microshading: {
    label: "Microshading",
    sub: "Permanente make-up wenkbrauwen",
    img: "/gallery/cat-microshading.png",
    alt: "Microshading wenkbrauwen Tongeren — GiGi L Coiffure",
    bg: true,
  },
};

function formatPrice(cents: number | null): string {
  if (cents === null) return "Prijs op aanvraag";
  return `€${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function PrijzenPage() {
  const { services } = Route.useLoaderData();

  // Group by category
  const byCategory = services.reduce<Record<string, typeof services>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const order = ["coiffure", "kapsalon", "nails", "microshading"];
  const categories = order.filter(cat => byCategory[cat]?.length);

  return (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-16 px-5">
          <div className="max-w-3xl mx-auto">
            <p className="eyebrow">Tongeren · Transparante tarieven</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ivory leading-tight">Prijzen</h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-5 text-ivory/60 text-base leading-relaxed">
              Alle prijzen worden besproken bij de boeking. Bij "prijs op aanvraag" neemt u best even contact op via telefoon of WhatsApp.
            </p>
          </div>
        </section>

        {services.length === 0 ? (
          <section className="py-16 px-5 max-w-3xl mx-auto text-center">
            <p className="text-smoke">Prijzen worden binnenkort toegevoegd. Neem contact op voor meer info.</p>
            <a href="tel:+32484164905" className="mt-4 inline-block text-gold">📞 +32 484 16 49 05</a>
          </section>
        ) : (
          categories.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            if (!config) return null;
            const items = byCategory[cat];
            return (
              <section key={cat} className={`py-14 px-5 ${config.bg ? "bg-sand" : ""}`}>
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-4 mb-8">
                    <img src={config.img} alt={config.alt}
                      className="w-20 h-20 object-cover object-top shrink-0" />
                    <div>
                      <h2 className="font-display text-2xl text-ink">{config.label}</h2>
                      <p className="text-smoke text-sm mt-1">{config.sub}</p>
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {items.map((item) => (
                      <div key={item.name} className="flex justify-between items-center py-3">
                        <span className="text-ink text-sm">{item.name}</span>
                        <span className={`text-sm font-medium shrink-0 ml-4 ${item.price_cents === null ? "text-smoke italic" : "text-gold"}`}>
                          {formatPrice(item.price_cents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })
        )}

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
  );
}
