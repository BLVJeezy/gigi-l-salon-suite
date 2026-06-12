import React from 'react'
import type { TemplateEntry } from './registry'
import { Shell, P, Details, SAMPLE, BRAND, type BookingProps } from './_brand'
import { Link } from '@react-email/components'

const Email = (b: BookingProps = SAMPLE) => (
  <Shell preview="Votre demande de réservation a bien été reçue" title={`Merci, ${b.name ?? ''}`}>
    <P>Nous avons bien reçu votre demande de réservation. Vous recevrez une confirmation dès que celle-ci sera validée par le salon.</P>
    <Details b={b} />
    <P>
      Pour toute question, contactez-nous au{' '}
      <Link href={`tel:${BRAND.phoneHref}`} style={{ color: BRAND.gold }}>{BRAND.phone}</Link>.
    </P>
  </Shell>
)

export const template = {
  component: Email,
  subject: `Votre demande de réservation a bien été reçue — ${BRAND.name}`,
  displayName: 'Client — Réservation reçue',
  previewData: SAMPLE,
} satisfies TemplateEntry
