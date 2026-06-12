import React from 'react'
import type { TemplateEntry } from './registry'
import { Shell, P, Details, SAMPLE, formatDate, type BookingProps } from './_brand'

const Email = (b: BookingProps = SAMPLE) => (
  <Shell preview="Nouvelle réservation reçue" title="Nouvelle réservation">
    <P>Une nouvelle demande de réservation vient d'être enregistrée.</P>
    <Details b={b} />
    <P>Connectez-vous à l'admin pour confirmer ou annuler.</P>
  </Shell>
)

export const template = {
  component: Email,
  subject: (d) => `Nouvelle réservation — ${d?.name ?? ''} · ${d?.booking_date ? formatDate(d.booking_date) : ''} ${d?.booking_time?.slice(0, 5) ?? ''}`,
  displayName: 'Owner — Nouvelle réservation',
  previewData: SAMPLE,
} satisfies TemplateEntry
