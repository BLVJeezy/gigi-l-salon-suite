import React from 'react'
import { Section, Button, Link } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { Shell, P, SAMPLE, BRAND, type BookingProps } from './_brand'

const REVIEW_URL = 'https://g.page/r/CSNf-T3q3BckEBM/review'

const Email = (d: BookingProps = SAMPLE) => (
  <Shell preview="Merci de votre visite — laissez-nous un avis" title="Merci de votre visite !">
    <P>Bonjour {d.name},</P>
    <P>
      Nous espérons que vous êtes ravie de votre {d.service ? <>prestation « {d.service} »</> : 'visite'} chez {BRAND.name}.
      Votre avis compte énormément pour nous et aide d'autres clientes à nous découvrir.
    </P>
    <P>Cela ne prend qu'une minute :</P>
    <Section style={{ textAlign: 'center', margin: '24px 0' }}>
      <Button
        href={REVIEW_URL}
        style={{
          background: BRAND.gold,
          color: BRAND.ink,
          padding: '14px 28px',
          textDecoration: 'none',
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 'bold',
        }}
      >
        ⭐ Laisser un avis Google
      </Button>
    </Section>
    <P>
      Ou copiez ce lien : <Link href={REVIEW_URL} style={{ color: BRAND.gold }}>{REVIEW_URL}</Link>
    </P>
    <P>Merci du fond du cœur — à très bientôt !</P>
  </Shell>
)

export const template = {
  component: Email,
  subject: 'Merci pour votre visite — un petit avis ?',
  displayName: 'Client — Demande d\'avis',
  previewData: SAMPLE,
} satisfies TemplateEntry
