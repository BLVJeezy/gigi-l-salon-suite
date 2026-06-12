import type { ComponentType } from 'react'
import { template as ownerNewBooking } from './owner-new-booking'
import { template as clientBookingReceived } from './client-booking-received'
import { template as clientBookingConfirmed } from './client-booking-confirmed'
import { template as clientBookingCancelled } from './client-booking-cancelled'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'owner-new-booking': ownerNewBooking,
  'client-booking-received': clientBookingReceived,
  'client-booking-confirmed': clientBookingConfirmed,
  'client-booking-cancelled': clientBookingCancelled,
}
