// ============================================================
// i18n — FR (default), NL, EN
// Pure translations dictionary + tiny React context.
// ============================================================
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "nl" | "en";

export const LANGS: Lang[] = ["fr", "nl", "en"];

type Dict = typeof translations.fr;

export const translations = {
  fr: {
    nav: { services: "Services", why: "Pourquoi nous", gallery: "Galerie", faq: "FAQ", contact: "Contact", book: "Prendre RDV", servicesPage: "Nos services", galleryPage: "Galerie", bookingPage: "Réserver" },
    hero: {
      eyebrow: "Salon de coiffure & microshading — Tongres",
      title: "Des années de passion au service de votre beauté",
      subtitle:
        "Coiffure africaine et européenne pour tous les types de cheveux. Spécialistes des cheveux bouclés, frisés et crépus au Koninksemsteenweg 144, Tongres.",
      ctaBook: "Prendre rendez-vous",
    },
    form: {
      title: "Demande de rendez-vous",
      name: "Nom complet",
      phone: "Téléphone",
      email: "Email (optionnel)",
      service: "Service",
      servicePlaceholder: "Choisissez un service",
      date: "Date souhaitée",
      time: "Heure souhaitée",
      message: "Message (optionnel)",
      submit: "Envoyer la demande",
      sending: "Envoi…",
      success: "Demande envoyée ! Nous vous rappellerons rapidement.",
      error: "Une erreur est survenue. Veuillez réessayer ou appeler le salon.",
      onlineLink: "Ou réservez via notre agenda en ligne",
      next: "Suivant →",
      edit: "Modifier",
    },
    services: {
      eyebrow: "Nos services",
      title: "Un savoir-faire complet, pour chaque type de cheveu",
      items: [
        { t: "Tresses africaines", d: "Box braids, cornrows, twists — un tressage soigné qui protège et sublime vos cheveux." },
        { t: "Coupes européennes", d: "Coupes femmes, hommes et enfants, adaptées à votre style et à votre nature de cheveu." },
        { t: "Locks & crochet", d: "Création et entretien de locks, crochet braids et coiffures protectrices durables." },
        { t: "Tissages", d: "Pose de tissages de qualité pour un volume et une longueur naturels." },
        { t: "Chignons & événements", d: "Mariages, cérémonies et grandes occasions : une coiffure à la hauteur du moment." },
        { t: "Colorations", d: "Couleur et soin adaptés aux cheveux texturés comme aux cheveux fins." },
        { t: "Microshading", d: "Sourcils redessinés avec un effet poudré naturel, posés avec précision." },
        { t: "Ongles & maquillage", d: "Stylisme d'ongles professionnel et maquillage semi-permanent pour un look complet." },
        { t: "Perruques & mèches", d: "Vente et pose de perruques, mèches et extensions soigneusement sélectionnées." },
      ],
    },
    why: {
      eyebrow: "Pourquoi GiGi L",
      title: "Le salon de référence à Tongres pour les cheveux texturés",
      items: [
        { t: "Expertise sur tous les types de cheveux", d: "Bouclés, frisés, crépus ou raides : des techniques maîtrisées qui respectent la nature de vos cheveux." },
        { t: "Un salon qui vous comprend", d: "Écoute, conseils honnêtes et résultats qui vous ressemblent — pas de coiffure standardisée." },
        { t: "Beauté complète sous un même toit", d: "Cheveux, microshading, ongles, maquillage, perruques : tout au même endroit à Tongres." },
        { t: "Note 4,6/5 sur Google", d: "La confiance de nos clientes, construite rendez-vous après rendez-vous." },
      ],
    },
    gallery: { eyebrow: "Galerie", title: "Nos réalisations" },
    faq: {
      eyebrow: "FAQ",
      title: "Questions fréquentes",
      items: [
        { q: "Faut-il prendre rendez-vous ?", a: "Oui, nous travaillons sur rendez-vous pour offrir à chaque cliente tout le temps qu'elle mérite. Utilisez le formulaire ci-dessus ou appelez le +32 484 16 49 05." },
        { q: "Coiffez-vous tous les types de cheveux ?", a: "Absolument. Le salon est spécialisé dans les cheveux bouclés, frisés et crépus, et propose également toutes les coupes européennes classiques." },
        { q: "Combien de temps dure un tressage ?", a: "Selon le style (box braids, cornrows, twists), comptez entre 2 et 6 heures. Une estimation précise vous sera donnée à la prise de rendez-vous." },
        { q: "Vendez-vous des mèches et perruques ?", a: "Oui, nous vendons des mèches et perruques de qualité, avec pose professionnelle au salon." },
        { q: "Où se trouve le salon ?", a: "Koninksemsteenweg 144, 3700 Tongres — facilement accessible en voiture, avec parking à proximité." },
      ],
    },
    footer: {
      ctaTitle: "Prête à briller ?",
      ctaSub: "Réservez votre rendez-vous et vivez l'expérience GiGi L.",
      ctaBtn: "Prendre rendez-vous",
      hoursTitle: "Horaires d'ouverture",
      hoursLines: ["Jeu – Sam : 09h00 – 18h00", "Dim – Mer : sur rendez-vous"],
      linksTitle: "Liens",
      rights: "Tous droits réservés.",
    },
    bookingPage: {
      eyebrow: "Réservation",
      title: "Prenez rendez-vous",
      subtitle: "Choisissez votre service, votre créneau, et laissez vos coordonnées. Nous confirmons rapidement.",
      infoTitle: "Comment ça marche",
      infoItems: [
        { t: "Choisissez un service et un créneau", d: "Sélectionnez la prestation souhaitée, une date et l'heure qui vous convient." },
        { t: "Laissez vos coordonnées", d: "Nom, téléphone — c'est tout. L'email est optionnel." },
        { t: "On vous rappelle", d: "Nous confirmons votre rendez-vous par téléphone dans les plus brefs délais." },
      ],
      hoursTitle: "Horaires",
      contactTitle: "Contact direct",
    },
    servicesPage: {
      heroSub: "Tresses africaines, tissage, locks, microshading, ongles et maquillage — tout sous un même toit à Tongres.",
      bookCta: "Réserver ce service",
      ctaTitle: "Un service vous intéresse ?",
      ctaSub: "Prenez rendez-vous en ligne ou appelez-nous directement au salon.",
      infoLabel: "Infos pratiques",
      byAppt: "Sur rendez-vous",
    },
    galleryPage: {
      title: "Nos réalisations",
      subtitle: "Chaque coiffure est unique. Voici quelques exemples de notre travail au salon à Tongres.",
      photoCount: "réalisations",
      filterAll: "Tout voir",
      filterTresses: "Tresses",
      filterTissage: "Tissage",
      filterLocks: "Locks & crochet",
      filterMicroshading: "Microshading",
      filterCoupes: "Coupes",
      filterChignons: "Chignons",
      empty: "Aucune réalisation dans cette catégorie pour le moment.",
      ctaTitle: "Vous aimez ce que vous voyez ?",
      ctaSub: "Prenez rendez-vous et laissez-nous sublimer vos cheveux.",
    },
    admin: {
      title: "GiGi L — Tableau de bord",
      newBadge: "nouveau",
      tabs: { leads: "Demandes", day: "Jour", week: "Semaine" },
      logout: "Déconnexion",
      refresh: "Actualiser",
      today: "Aujourd'hui",
      status: { new: "Nouveau", confirmed: "Confirmé", cancelled: "Annulé" },
      actions: { confirm: "Confirmer", cancel: "Annuler" },
      login: { title: "Espace administrateur", password: "Mot de passe", submit: "Se connecter", error: "Mot de passe incorrect" },
      empty: "Aucune demande pour le moment.",
    },
  },
  nl: {
    nav: { services: "Diensten", why: "Waarom wij", gallery: "Galerij", faq: "FAQ", contact: "Contact", book: "Reserveer", servicesPage: "Onze diensten", galleryPage: "Galerij", bookingPage: "Reserveren" },
    hero: {
      eyebrow: "Kapsalon & microshading — Tongeren",
      title: "Jaren van passie ten dienste van uw schoonheid",
      subtitle:
        "Afrikaans en Europees kappen voor alle haartypes. Specialisten in krullend, kroes- en afrohaar in de Koninksemsteenweg 144, Tongeren.",
      ctaBook: "Maak een afspraak",
    },
    form: {
      title: "Afspraakaanvraag",
      name: "Volledige naam",
      phone: "Telefoon",
      email: "E-mail (optioneel)",
      service: "Dienst",
      servicePlaceholder: "Kies een dienst",
      date: "Gewenste datum",
      time: "Gewenste tijd",
      message: "Bericht (optioneel)",
      submit: "Aanvraag versturen",
      sending: "Versturen…",
      success: "Aanvraag verzonden! We bellen u snel terug.",
      error: "Er is iets misgegaan. Probeer opnieuw of bel het salon.",
      onlineLink: "Of boek via onze online agenda",
      next: "Volgende →",
      edit: "Wijzigen",
    },
    services: {
      eyebrow: "Onze diensten",
      title: "Compleet vakmanschap, voor elk haartype",
      items: [
        { t: "Afrikaanse vlechten", d: "Box braids, cornrows, twists — zorgvuldig vlechtwerk dat uw haar beschermt en mooier maakt." },
        { t: "Europese knipbeurten", d: "Knipbeurten voor dames, heren en kinderen, afgestemd op uw stijl en haartype." },
        { t: "Locks & crochet", d: "Aanleg en onderhoud van locks, crochet braids en duurzame beschermkapsels." },
        { t: "Weaves", d: "Plaatsing van kwaliteitsweaves voor natuurlijk volume en lengte." },
        { t: "Opsteekkapsels & events", d: "Bruiloften, ceremonies en grote gelegenheden: een kapsel het moment waardig." },
        { t: "Kleuringen", d: "Kleur en verzorging aangepast aan zowel getextureerd als fijn haar." },
        { t: "Microshading", d: "Wenkbrauwen opnieuw getekend met een natuurlijk poedereffect, precies aangebracht." },
        { t: "Nagels & make-up", d: "Professionele nagelstyling en semi-permanente make-up voor een complete look." },
        { t: "Pruiken & extensions", d: "Verkoop en plaatsing van pruiken, plus zorgvuldig geselecteerde kwaliteitsextensions." },
      ],
    },
    why: {
      eyebrow: "Waarom GiGi L",
      title: "Het referentiesalon in Tongeren voor getextureerd haar",
      items: [
        { t: "Expertise in elk haartype", d: "Krullend, kroes, afro of steil: beheerste technieken die de natuur van uw haar respecteren." },
        { t: "Een salon dat u begrijpt", d: "Luisteren, eerlijk advies en resultaten die bij u passen — geen standaardkapsels." },
        { t: "Complete schoonheid onder één dak", d: "Haar, microshading, nagels, make-up, pruiken: alles op één plek in Tongeren." },
        { t: "Beoordeeld 4,6/5 op Google", d: "Het vertrouwen van onze klanten, afspraak na afspraak opgebouwd." },
      ],
    },
    gallery: { eyebrow: "Galerij", title: "Ons werk" },
    faq: {
      eyebrow: "FAQ",
      title: "Veelgestelde vragen",
      items: [
        { q: "Moet ik een afspraak maken?", a: "Ja, we werken op afspraak zodat elke klant de tijd krijgt die hij verdient. Gebruik het formulier hierboven of bel +32 484 16 49 05." },
        { q: "Werkt u met elk haartype?", a: "Absoluut. Het salon is gespecialiseerd in krullend, kroes- en afrohaar, en biedt ook alle klassieke Europese knipbeurten." },
        { q: "Hoe lang duurt vlechten?", a: "Afhankelijk van de stijl (box braids, cornrows, twists), reken op 2 tot 6 uur. U krijgt een exacte schatting bij de boeking." },
        { q: "Verkoopt u extensions en pruiken?", a: "Ja, we verkopen kwaliteitsextensions en pruiken, met professionele plaatsing in het salon." },
        { q: "Waar bevindt het salon zich?", a: "Koninksemsteenweg 144, 3700 Tongeren — vlot bereikbaar met de wagen, parking in de buurt." },
      ],
    },
    footer: {
      ctaTitle: "Klaar om te stralen?",
      ctaSub: "Boek uw afspraak en beleef de GiGi L-ervaring.",
      ctaBtn: "Maak een afspraak",
      hoursTitle: "Openingsuren",
      hoursLines: ["Don – Zat: 09u00 – 18u00", "Zon – Woe: op afspraak"],
      linksTitle: "Links",
      rights: "Alle rechten voorbehouden.",
    },
    bookingPage: {
      eyebrow: "Reservering",
      title: "Maak een afspraak",
      subtitle: "Kies uw dienst, tijdslot en vul uw gegevens in. Wij bevestigen zo snel mogelijk.",
      infoTitle: "Hoe werkt het",
      infoItems: [
        { t: "Kies een dienst en tijdslot", d: "Selecteer de gewenste behandeling, een datum en een uur dat u past." },
        { t: "Geef uw gegevens op", d: "Naam en telefoonnummer — dat is alles. E-mail is optioneel." },
        { t: "Wij bellen u terug", d: "We bevestigen uw afspraak zo snel mogelijk telefonisch." },
      ],
      hoursTitle: "Openingsuren",
      contactTitle: "Direct contact",
    },
    servicesPage: {
      heroSub: "Afrikaanse vlechten, weaves, locks, microshading, nagels en make-up — alles onder één dak in Tongeren.",
      bookCta: "Reserveer deze dienst",
      ctaTitle: "Interesse in een dienst?",
      ctaSub: "Maak online een afspraak of bel ons direct in het salon.",
      infoLabel: "Praktische info",
      byAppt: "Op afspraak",
    },
    galleryPage: {
      title: "Ons werk",
      subtitle: "Elke coiffure is uniek. Hier zijn een paar voorbeelden van ons werk in het salon in Tongeren.",
      photoCount: "realisaties",
      filterAll: "Alles",
      filterTresses: "Vlechten",
      filterTissage: "Weaves",
      filterLocks: "Locks & crochet",
      filterMicroshading: "Microshading",
      filterCoupes: "Knipbeurten",
      filterChignons: "Opsteekkapsels",
      empty: "Nog geen realisaties in deze categorie.",
      ctaTitle: "Ziet u iets wat u aanspreekt?",
      ctaSub: "Maak een afspraak en laat ons uw haar sublimeren.",
    },
    admin: {
      title: "GiGi L — Dashboard",
      newBadge: "nieuw",
      tabs: { leads: "Aanvragen", day: "Dag", week: "Week" },
      logout: "Afmelden",
      refresh: "Vernieuwen",
      today: "Vandaag",
      status: { new: "Nieuw", confirmed: "Bevestigd", cancelled: "Geannuleerd" },
      actions: { confirm: "Bevestigen", cancel: "Annuleren" },
      login: { title: "Beheerderszone", password: "Wachtwoord", submit: "Aanmelden", error: "Wachtwoord onjuist" },
      empty: "Nog geen aanvragen.",
    },
  },
  en: {
    nav: { services: "Services", why: "Why us", gallery: "Gallery", faq: "FAQ", contact: "Contact", book: "Book now", servicesPage: "Our services", galleryPage: "Gallery", bookingPage: "Book" },
    hero: {
      eyebrow: "Hair salon & microshading — Tongeren",
      title: "Years of passion, devoted to your beauty",
      subtitle:
        "African and European hair styling for every hair type. Specialists in curly, coily and afro hair at Koninksemsteenweg 144, Tongeren.",
      ctaBook: "Book an appointment",
    },
    form: {
      title: "Appointment request",
      name: "Full name",
      phone: "Phone",
      email: "Email (optional)",
      service: "Service",
      servicePlaceholder: "Choose a service",
      date: "Preferred date",
      time: "Preferred time",
      message: "Message (optional)",
      submit: "Send request",
      sending: "Sending…",
      success: "Request sent! We'll call you back shortly.",
      error: "Something went wrong. Please try again or call the salon.",
      onlineLink: "Or book through our online agenda",
      next: "Next →",
      edit: "Change",
    },
    services: {
      eyebrow: "Our services",
      title: "Complete craftsmanship, for every hair type",
      items: [
        { t: "African braids", d: "Box braids, cornrows, twists — meticulous braiding that protects and elevates your hair." },
        { t: "European cuts", d: "Cuts for women, men and children, tailored to your style and hair type." },
        { t: "Locks & crochet", d: "Creation and maintenance of locks, crochet braids and lasting protective styles." },
        { t: "Weaves", d: "Quality weave installation for natural volume and length." },
        { t: "Updos & event styling", d: "Weddings, ceremonies and big occasions: a hairstyle worthy of the moment." },
        { t: "Colouring", d: "Colour and care adapted to textured as well as fine hair." },
        { t: "Microshading", d: "Brows redefined with a natural powdered effect, applied with precision." },
        { t: "Nails & make-up", d: "Professional nail styling and semi-permanent make-up for a complete look." },
        { t: "Wigs & extensions", d: "Sale and fitting of wigs, plus carefully selected quality extensions." },
      ],
    },
    why: {
      eyebrow: "Why GiGi L",
      title: "Tongeren's reference salon for textured hair",
      items: [
        { t: "Expertise in every hair type", d: "Curly, coily, afro or straight: mastered techniques that respect your hair's nature." },
        { t: "A salon that understands you", d: "Listening, honest advice and results that look like you — no one-size-fits-all styling." },
        { t: "Complete beauty under one roof", d: "Hair, microshading, nails, make-up, wigs: everything in one place in Tongeren." },
        { t: "Rated 4.6/5 on Google", d: "The trust of our clients, built one appointment at a time." },
      ],
    },
    gallery: { eyebrow: "Gallery", title: "Our work" },
    faq: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      items: [
        { q: "Do I need an appointment?", a: "Yes, we work by appointment so every client gets the time they deserve. Use the form above or call +32 484 16 49 05." },
        { q: "Do you style every hair type?", a: "Absolutely. The salon specialises in curly, coily and afro hair, and also offers all classic European cuts." },
        { q: "How long does braiding take?", a: "Depending on the style (box braids, cornrows, twists), allow 2 to 6 hours. You'll get a precise estimate when booking." },
        { q: "Do you sell extensions and wigs?", a: "Yes, we sell quality extensions and wigs, with professional fitting at the salon." },
        { q: "Where is the salon?", a: "Koninksemsteenweg 144, 3700 Tongeren — easy to reach by car, with parking nearby." },
      ],
    },
    footer: {
      ctaTitle: "Ready to shine?",
      ctaSub: "Book your appointment and live the GiGi L experience.",
      ctaBtn: "Book an appointment",
      hoursTitle: "Opening hours",
      hoursLines: ["Thu – Sat: 09:00 – 18:00", "Sun – Wed: by appointment"],
      linksTitle: "Links",
      rights: "All rights reserved.",
    },
    admin: {
      title: "GiGi L — Dashboard",
      newBadge: "new",
      tabs: { leads: "Requests", day: "Day", week: "Week" },
      logout: "Log out",
      refresh: "Refresh",
      today: "Today",
      status: { new: "New", confirmed: "Confirmed", cancelled: "Cancelled" },
      actions: { confirm: "Confirm", cancel: "Cancel" },
      login: { title: "Admin area", password: "Password", submit: "Sign in", error: "Wrong password" },
      empty: "No requests yet.",
    },
    bookingPage: {
      eyebrow: "Book now",
      title: "Make an appointment",
      subtitle: "Pick your service, choose a slot and leave your details. We'll confirm shortly.",
      infoTitle: "How it works",
      infoItems: [
        { t: "Choose a service and time slot", d: "Select the treatment you want, a date and a time that works for you." },
        { t: "Leave your details", d: "Name and phone number — that's it. Email is optional." },
        { t: "We'll call you back", d: "We confirm your appointment by phone as soon as possible." },
      ],
      hoursTitle: "Opening hours",
      contactTitle: "Direct contact",
    },
    servicesPage: {
      heroSub: "African braids, weaves, locks, microshading, nails and make-up — all under one roof in Tongeren.",
      bookCta: "Book this service",
      ctaTitle: "Interested in a service?",
      ctaSub: "Book online or call us directly at the salon.",
      infoLabel: "Practical info",
      byAppt: "By appointment",
    },
    galleryPage: {
      title: "Our work",
      subtitle: "Every hairstyle is unique. Here are some examples of what we do at the salon in Tongeren.",
      photoCount: "photos",
      filterAll: "All",
      filterTresses: "Braids",
      filterTissage: "Weaves",
      filterLocks: "Locks & crochet",
      filterMicroshading: "Microshading",
      filterCoupes: "Cuts",
      filterChignons: "Updos",
      empty: "No photos in this category yet.",
      ctaTitle: "Like what you see?",
      ctaSub: "Book an appointment and let us elevate your look.",
    },
  },
} satisfies Record<Lang, unknown>;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "fr",
  setLang: () => {},
  t: translations.fr,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("gigil_lang")) as Lang | null;
    if (stored && LANGS.includes(stored)) setLangState(stored);
    else {
      const nav = typeof navigator !== "undefined" ? navigator.language.slice(0, 2).toLowerCase() : "fr";
      if (nav === "nl" || nav === "en") setLangState(nav);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("gigil_lang", l);
    document.documentElement.lang = l;
  };

  return <Ctx.Provider value={{ lang, setLang, t: translations[lang] }}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx);
