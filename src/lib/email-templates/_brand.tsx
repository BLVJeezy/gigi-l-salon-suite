import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link, Button, Row, Column } from '@react-email/components'

export const BRAND = {
  name: 'Gigi L Coiffure',
  address: 'Koninksemsteenweg 144, 3700 Tongeren',
  phone: '+32 484 16 49 05',
  phoneHref: '+32484164905',
  gold: '#C9A961',
  ink: '#0F0F10',
  carbon: '#1a1a1c',
  ivory: '#F5F1E8',
  ivoryMuted: '#a8a39a',
}

export function formatDate(iso: string) {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

export interface BookingProps {
  id?: string
  name?: string
  phone?: string
  email?: string | null
  service?: string
  booking_date?: string
  booking_time?: string
  message?: string | null
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif', margin: 0, padding: '24px 12px' }
const card = { maxWidth: '560px', margin: '0 auto', background: BRAND.carbon, border: `1px solid ${BRAND.gold}40`, color: BRAND.ivory }
const header = { padding: '28px 32px', borderBottom: `1px solid ${BRAND.gold}30`, textAlign: 'center' as const }
const brandLabel = { fontSize: '11px', letterSpacing: '0.3em', color: BRAND.gold, textTransform: 'uppercase' as const, margin: 0 }
const inner = { padding: '32px' }
const h1 = { margin: '0 0 12px', fontSize: '24px', color: BRAND.ivory, fontWeight: 'normal' as const, fontFamily: 'Georgia, serif' }
const para = { margin: '0 0 12px', fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.6', color: BRAND.ivory }
const footer = { padding: '20px 32px', borderTop: `1px solid ${BRAND.gold}20`, textAlign: 'center' as const, fontSize: '12px', color: BRAND.ivoryMuted, fontFamily: 'Arial, sans-serif' }
const rowKey = { padding: '10px 14px', background: BRAND.ink, color: BRAND.ivoryMuted, width: '120px', borderBottom: `1px solid ${BRAND.gold}15`, textTransform: 'uppercase' as const, fontSize: '11px', letterSpacing: '0.1em', fontFamily: 'Arial, sans-serif' }
const rowVal = { padding: '10px 14px', color: BRAND.ivory, borderBottom: `1px solid ${BRAND.gold}15`, fontFamily: 'Arial, sans-serif', fontSize: '14px' }

export function Shell({ preview, title, children }: { preview: string; title: string; children: React.ReactNode }) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={card}>
          <Section style={header}>
            <Text style={brandLabel}>{BRAND.name}</Text>
          </Section>
          <Section style={inner}>
            <Heading style={h1}>{title}</Heading>
            {children}
          </Section>
          <Section style={footer}>
            <Text style={{ margin: '0 0 4px', color: BRAND.ivoryMuted }}>{BRAND.address}</Text>
            <Link href={`tel:${BRAND.phoneHref}`} style={{ color: BRAND.gold, textDecoration: 'none' }}>{BRAND.phone}</Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function P({ children }: { children: React.ReactNode }) {
  return <Text style={para}>{children}</Text>
}

export function Details({ b }: { b: BookingProps }) {
  const rows: Array<[string, string | null | undefined]> = [
    ['Service', b.service],
    ['Date', b.booking_date ? formatDate(b.booking_date) : ''],
    ['Heure', b.booking_time ? b.booking_time.slice(0, 5) : ''],
    ['Nom', b.name],
    ['Téléphone', b.phone],
    ['Email', b.email || ''],
    ['Message', b.message || ''],
  ].filter(([, v]) => !!v) as Array<[string, string]>
  return (
    <Section style={{ margin: '20px 0', border: `1px solid ${BRAND.gold}30` }}>
      {rows.map(([k, v]) => (
        <Row key={k}>
          <Column style={rowKey}>{k}</Column>
          <Column style={rowVal}>{v}</Column>
        </Row>
      ))}
    </Section>
  )
}

export function CancelBlock({ cancelUrl }: { cancelUrl: string }) {
  return (
    <Section style={{ marginTop: '28px', padding: '20px', background: BRAND.ink, border: `1px solid ${BRAND.gold}30` }}>
      <Text style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: BRAND.gold, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 8px' }}>
        Annuler la réservation
      </Text>
      <P>
        Empêché·e ? Envoyez-nous un SMS au{' '}
        <Link href={`tel:${BRAND.phoneHref}`} style={{ color: BRAND.gold }}>{BRAND.phone}</Link>{' '}
        ou cliquez ci-dessous.
      </P>
      <Button href={cancelUrl} style={{ border: `1px solid ${BRAND.gold}`, padding: '10px 20px', color: BRAND.gold, textDecoration: 'none', fontFamily: 'Arial, sans-serif', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Annuler ma réservation
      </Button>
    </Section>
  )
}

export const SAMPLE: BookingProps = {
  id: 'demo',
  name: 'Jason Balongo',
  phone: '+32 484 16 49 05',
  email: 'jasonbalongo@gmail.com',
  service: 'Coupe & brushing',
  booking_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  booking_time: '14:00',
  message: null,
}
