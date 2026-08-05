import publicEventsData from './public-events.data.json'

export type PublicEvent = {
  slug: string
  date: string
  title: string
  venue: string
  location: string
  time: string
  description: string
  djs: string[]
  maxPlusOnes: number
  /** When false, the public page remains available but no new RSVPs are accepted. */
  rsvpEnabled: boolean
  rsvpUrl?: string
  partnerLogo?: string
  partnerLogoAlt?: string
  /** Primary flyer/poster image shown on the event page. */
  poster?: string
  posterAlt?: string
  /** Optional gallery of flyer variants shown in a carousel. */
  flyers?: { original: string; thumbnail?: string; description?: string }[]
}

export const PUBLIC_EVENTS: PublicEvent[] = publicEventsData as PublicEvent[]
