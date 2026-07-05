import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections";
import { LangProvider } from "@/lib/i18n";

export const Route = createFileRoute("/algemene-voorwaarden")({
  head: () => ({
    meta: [
      { title: "Algemene voorwaarden — GiGi L Coiffure Tongeren" },
      { name: "description", content: "Algemene voorwaarden van GiGi L Coiffure, Koninksemsteenweg 144, 3700 Tongeren." },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://gigilcoiffure.be/algemene-voorwaarden" }],
  }),
  component: () => (
    <LangProvider>
      <Header />
      <main className="bg-ivory min-h-screen">
        <section className="bg-ink text-ivory pt-32 pb-12 px-5">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl text-ivory">Algemene voorwaarden</h1>
            <div className="mt-4 gold-rule" />
            <p className="mt-4 text-ivory/60 text-sm">GiGi L Coiffure · Koninksemsteenweg 144, 3700 Tongeren · +32 484 16 49 05</p>
          </div>
        </section>

        <section className="py-12 px-5 max-w-3xl mx-auto prose prose-stone">
          <div className="space-y-8 text-smoke leading-relaxed">

            <div>
              <h2 className="font-display text-2xl text-ink mb-3">1. Afspraken & annulering</h2>
              <p>Afspraken worden gemaakt via het online formulier, telefonisch of via WhatsApp. Een afspraak is pas definitief na bevestiging door het salon.</p>
              <p className="mt-2">Bij annulering vragen wij dit minstens <strong>24 uur op voorhand</strong> te melden. Bij laattijdige annulering of no-show kan een administratieve kost van €15 aangerekend worden.</p>
              <p className="mt-2">Bij herhaaldelijk niet-komen opdagen behoudt GiGi L Coiffure het recht om geen nieuwe afspraken te aanvaarden.</p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-ink mb-3">2. Betalingen</h2>
              <p>Betaling gebeurt ter plaatse, bij het einde van de behandeling. Wij aanvaarden cash en bankoverschrijving. Prijzen worden medegedeeld bij de boeking en kunnen variëren op basis van haarlengtes, hoeveelheid materiaal en behandelingsduur.</p>
              <p className="mt-2">Prijzen vermeld op de website zijn indicatief. De definitieve prijs wordt besproken bij de afspraak.</p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-ink mb-3">3. Aansprakelijkheid</h2>
              <p>GiGi L Coiffure doet er alles aan om de best mogelijke service te leveren. Bij klachten over een behandeling dient de klant dit <strong>binnen 48 uur</strong> te melden zodat wij dit samen kunnen oplossen.</p>
              <p className="mt-2">Het salon is niet aansprakelijk voor allergische reacties op producten wanneer de klant geen melding heeft gemaakt van bekende allergieën of gevoeligheden vóór de behandeling.</p>
              <p className="mt-2">Wij zijn niet verantwoordelijk voor verlies of diefstal van persoonlijke bezittingen in het salon.</p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-ink mb-3">4. Gezondheid & veiligheid</h2>
              <p>Klanten met een besmettelijke huid- of haaraandoening worden vriendelijk verzocht hun afspraak te verzetten. Dit is in het belang van alle klanten en het personeel.</p>
              <p className="mt-2">GiGi L Coiffure werkt uitsluitend met professionele, gecertificeerde producten.</p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-ink mb-3">5. Persoonsgegevens</h2>
              <p>De persoonsgegevens die u verstrekt bij de boeking (naam, telefoonnummer, e-mailadres) worden uitsluitend gebruikt voor het beheer van uw afspraken. Uw gegevens worden nooit doorgegeven aan derden.</p>
              <p className="mt-2">U heeft te allen tijde het recht uw gegevens op te vragen, te corrigeren of te laten verwijderen. Contacteer ons via <a href="mailto:info@gigilcoiffure.be" className="text-gold hover:underline">info@gigilcoiffure.be</a> of +32 484 16 49 05.</p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-ink mb-3">6. Foto's & sociale media</h2>
              <p>GiGi L Coiffure kan foto's van behandelingen gebruiken voor promotiemateriaal en sociale media. Indien u hier bezwaar tegen heeft, gelieve dit vooraf te melden.</p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-ink mb-3">7. Wijzigingen</h2>
              <p>GiGi L Coiffure behoudt het recht deze voorwaarden te wijzigen. De meest recente versie is steeds beschikbaar op onze website.</p>
              <p className="mt-2 text-xs text-smoke/60">Laatste update: juli 2026</p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </LangProvider>
  ),
});
