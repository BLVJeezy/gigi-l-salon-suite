// HTML email templates — Gigi L Coiffure (FR).
// Brand: gold #C9A961 on dark ink #0F0F10, ivory text.

const BRAND = {
  name: "Gigi L Coiffure",
  address: "Koninksemsteenweg 144, 3700 Tongeren",
  phone: "+32 484 16 49 05",
  phoneHref: "+32484164905",
  gold: "#C9A961",
  ink: "#0F0F10",
  carbon: "#1a1a1c",
  ivory: "#F5F1E8",
  ivoryMuted: "#a8a39a",
};

function layout(title: string, body: string, footer = "") {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:${BRAND.ink};font-family:Georgia,'Times New Roman',serif;color:${BRAND.ivory};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.ink};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${BRAND.carbon};border:1px solid ${BRAND.gold}40;">
        <tr><td style="padding:28px 32px;border-bottom:1px solid ${BRAND.gold}30;text-align:center;">
          <div style="font-size:11px;letter-spacing:0.3em;color:${BRAND.gold};text-transform:uppercase;">${BRAND.name}</div>
        </td></tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid ${BRAND.gold}20;text-align:center;font-size:12px;color:${BRAND.ivoryMuted};font-family:Arial,sans-serif;">
          ${footer ? `<div style="margin-bottom:12px;">${footer}</div>` : ""}
          <div>${BRAND.address}</div>
          <div><a href="tel:${BRAND.phoneHref}" style="color:${BRAND.gold};text-decoration:none;">${BRAND.phone}</a></div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function detailsBlock(b: BookingInfo) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid ${BRAND.gold}30;font-family:Arial,sans-serif;font-size:14px;">
    ${row("Service", b.service)}
    ${row("Date", formatDate(b.booking_date))}
    ${row("Heure", b.booking_time.slice(0,5))}
    ${row("Nom", b.name)}
    ${row("Téléphone", b.phone)}
    ${b.email ? row("Email", b.email) : ""}
    ${b.message ? row("Message", b.message) : ""}
  </table>`;
}
function row(k: string, v: string) {
  return `<tr>
    <td style="padding:10px 14px;background:${BRAND.ink};color:${BRAND.ivoryMuted};width:120px;border-bottom:1px solid ${BRAND.gold}15;text-transform:uppercase;font-size:11px;letter-spacing:0.1em;">${k}</td>
    <td style="padding:10px 14px;color:${BRAND.ivory};border-bottom:1px solid ${BRAND.gold}15;">${escapeHtml(v)}</td>
  </tr>`;
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
function formatDate(iso: string) {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
}
function heading(t: string) {
  return `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:24px;color:${BRAND.ivory};font-weight:normal;">${t}</h1>`;
}
function p(t: string) {
  return `<p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:${BRAND.ivory};">${t}</p>`;
}
function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:${BRAND.gold};">
    <a href="${href}" style="display:inline-block;padding:14px 28px;color:${BRAND.ink};text-decoration:none;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;">${label}</a>
  </td></tr></table>`;
}
function cancelBlock(cancelUrl: string) {
  return `
  <div style="margin-top:28px;padding:20px;background:${BRAND.ink};border:1px solid ${BRAND.gold}30;">
    <div style="font-family:Arial,sans-serif;font-size:12px;color:${BRAND.gold};text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">Annuler la réservation</div>
    ${p(`Empêché·e ? Envoyez-nous un SMS au <a href="tel:${BRAND.phoneHref}" style="color:${BRAND.gold};">${BRAND.phone}</a> ou cliquez ci-dessous.`)}
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border:1px solid ${BRAND.gold};">
      <a href="${cancelUrl}" style="display:inline-block;padding:10px 20px;color:${BRAND.gold};text-decoration:none;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Annuler ma réservation</a>
    </td></tr></table>
  </div>`;
}

export type BookingInfo = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  booking_date: string;
  booking_time: string;
  message: string | null;
};

// 1. Owner — nouvelle réservation reçue
export function ownerNewBookingEmail(b: BookingInfo) {
  return {
    subject: `Nouvelle réservation — ${b.name} · ${formatDate(b.booking_date)} ${b.booking_time.slice(0,5)}`,
    html: layout("Nouvelle réservation", `
      ${heading("Nouvelle réservation")}
      ${p(`Une nouvelle demande de réservation vient d'être enregistrée.`)}
      ${detailsBlock(b)}
      ${p(`Connectez-vous à l'admin pour confirmer ou annuler.`)}
    `),
  };
}

// 2. Client — votre réservation a bien été envoyée
export function clientBookingReceivedEmail(b: BookingInfo) {
  return {
    subject: `Votre demande de réservation a bien été reçue — ${BRAND.name}`,
    html: layout("Réservation reçue", `
      ${heading(`Merci, ${escapeHtml(b.name)}`)}
      ${p(`Nous avons bien reçu votre demande de réservation. Vous recevrez une confirmation dès que celle-ci sera validée par le salon.`)}
      ${detailsBlock(b)}
      ${p(`Pour toute question, contactez-nous au <a href="tel:${BRAND.phoneHref}" style="color:${BRAND.gold};">${BRAND.phone}</a>.`)}
    `),
  };
}

// 3. Client — réservation confirmée (avec lien d'annulation)
export function clientBookingConfirmedEmail(b: BookingInfo, cancelUrl: string) {
  return {
    subject: `✓ Votre réservation est confirmée — ${formatDate(b.booking_date)}`,
    html: layout("Réservation confirmée", `
      ${heading("Votre réservation est confirmée")}
      ${p(`Bonjour ${escapeHtml(b.name)}, nous avons le plaisir de vous confirmer votre rendez-vous.`)}
      ${detailsBlock(b)}
      ${p(`Nous vous attendons au salon. À très bientôt !`)}
      ${cancelBlock(cancelUrl)}
    `),
  };
}

// 4. Client — réservation annulée (par le salon)
export function clientBookingCancelledEmail(b: BookingInfo) {
  return {
    subject: `Votre réservation a été annulée — ${formatDate(b.booking_date)}`,
    html: layout("Réservation annulée", `
      ${heading("Votre réservation a été annulée")}
      ${p(`Bonjour ${escapeHtml(b.name)}, votre réservation ci-dessous a été annulée.`)}
      ${detailsBlock(b)}
      ${p(`Pour reprendre rendez-vous, appelez-nous au <a href="tel:${BRAND.phoneHref}" style="color:${BRAND.gold};">${BRAND.phone}</a> ou rendez-vous sur notre site.`)}
    `),
  };
}
