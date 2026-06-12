import React from 'react'
import type { TemplateEntry } from './registry'
import { Shell, P, Details, SAMPLE, formatDate, BRAND, type BookingProps } from './_brand'
import { Link } from '@react-email/components'

const Email = (b: BookingProps = SAMPLE) => (
  <Shell preview="Votre réservation a été annulée" title="Votre réservation a été annulée">
    <P>Bonjour {b.name}, votre réservation ci-dessous a été annulée.</P>
    <Details b={b} />
    <P>
      Pour reprendre rendez-vous, appelez-nous au{' '}
      <Link href={`tel:${BRAND.phoneHref}`} style={{ color: BRAND.gold }}>{BRAND.phone}</Link>{' '}
      ou rendez-vous sur notre site.
    </P>
  </Shell>
)

export const template = {
  component: Email,
  subject: (d) => `Votre réservation a été annulée — ${d?.booking_date ? formatDate(d.booking_date) : ''}`,
  displayName: 'Client — Réservation annulée',
  previewData: SAMPLE,
} satisfies TemplateEntry
