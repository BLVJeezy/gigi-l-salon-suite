import React from 'react'
import type { TemplateEntry } from './registry'
import { Shell, P, Details, CancelBlock, SAMPLE, formatDate, type BookingProps } from './_brand'

interface Props extends BookingProps {
  cancelUrl?: string
}

const Email = (d: Props = { ...SAMPLE, cancelUrl: 'https://example.com/annuler/demo' }) => (
  <Shell preview="Votre réservation est confirmée" title="Votre réservation est confirmée">
    <P>Bonjour {d.name}, nous avons le plaisir de vous confirmer votre rendez-vous.</P>
    <Details b={d} />
    <P>Nous vous attendons au salon. À très bientôt !</P>
    <CancelBlock cancelUrl={d.cancelUrl ?? '#'} />
  </Shell>
)

export const template = {
  component: Email,
  subject: (d) => `✓ Votre réservation est confirmée — ${d?.booking_date ? formatDate(d.booking_date) : ''}`,
  displayName: 'Client — Réservation confirmée',
  previewData: { ...SAMPLE, cancelUrl: 'https://example.com/annuler/demo' },
} satisfies TemplateEntry
