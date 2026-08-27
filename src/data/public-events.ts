import publicEventsData from './public-events.data.json'
import type { TrackItem } from '../types/content'

export type PublicEvent = {
  slug: string
  /** ISO datetime with offset, e.g. 2026-08-15T17:00:00-07:00 (Pacific). */
  startDateTime: string
  /** ISO datetime with offset, e.g. 2026-08-15T20:00:00-07:00 (Pacific). */
  endDateTime: string
  title: string
  venue: string
  location: string
  description: string
  djs: string[]
  maxPlusOnes: number
  /** When false, the public page remains available but no new RSVPs are accepted. */
  rsvpEnabled: boolean
  rsvpUrl?: string
  partnerLogo?: string
  partnerLogoAlt?: string
  /**
   * Partner logos are usually white (for the dark theme) and get inverted in
   * light mode so they stay visible. Set false for an already-dark/colored
   * logo that shouldn't be inverted.
   */
  partnerLogoInvert?: boolean
  /** Primary flyer/poster image shown on the event page. */
  poster?: string
  posterAlt?: string
  /** Optional gallery of flyer variants shown in a carousel. */
  flyers?: { original: string; thumbnail?: string; description?: string }[]
  /** YouTube video id for a recap video, shown in the Recap section when set. */
  youtubeId?: string
  /** Public URL of the recorded set (MP3 on R2), shown as a player after the event. */
  audioUrl?: string
  /** Groovenet playlist id this recap was pulled from. Stored for provenance; not rendered as a public link (groovenet is Tailscale-only). */
  playlistId?: string
  /** Ordered tracklist pulled from the groovenet playlist. Shares the show tracklist shape. */
  tracklist?: TrackItem[]
  /**
   * Post-event photos (hosted on R2), shown as a collage that opens a carousel.
   * Mark one photo `cover: true` to use it as the event's representative image
   * (row thumbnails, homepage recap card, events hero collage). Falls back to
   * the first photo when none is marked.
   */
  photos?: { original: string; thumbnail?: string; description?: string; cover?: boolean }[]
}

export const PUBLIC_EVENTS: PublicEvent[] = publicEventsData as PublicEvent[]

/** The event's representative photo: the one flagged `cover`, else the first. */
export const eventCoverPhoto = (e: PublicEvent) =>
  e.photos?.find((p) => p.cover) ?? e.photos?.[0]

/** URL for the event's representative image (cover photo, else poster). */
export const eventCoverSrc = (e: PublicEvent): string | undefined => {
  const c = eventCoverPhoto(e)
  return c?.thumbnail || c?.original || e.poster || undefined
}

/** All events are Seattle-based; render/compute in Pacific regardless of viewer TZ. */
const TZ = 'America/Los_Angeles'

/** e.g. "Aug 15, 2026" */
export const formatEventDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: TZ,
  })

/** Matches the show-archive format, e.g. "08.15.2026" (Pacific). */
export const formatEventDateShort = (iso: string): string =>
  new Date(iso)
    .toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      timeZone: TZ,
    })
    .replace(/\//g, '.')

/** e.g. "5–8 PM" (collapses a shared meridiem and on-the-hour minutes). */
export const formatTimeRange = (startIso: string, endIso: string): string => {
  const fmt = (iso: string) =>
    new Date(iso)
      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ })
      .replace(':00', '')
  let start = fmt(startIso)
  const end = fmt(endIso)
  if (start.slice(-2) === end.slice(-2)) start = start.slice(0, -2).trim()
  return `${start}–${end}`
}

/** YYYY-MM-DD for an ISO datetime, in Pacific. */
const pacificDay = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ })

/**
 * True once an event has passed. Matches the archive rule: an event stays current
 * through the end of its calendar day (Pacific) and is "past" the next morning.
 */
export const isPastEvent = (event: PublicEvent, now: Date = new Date()): boolean =>
  pacificDay(event.endDateTime) < now.toLocaleDateString('en-CA', { timeZone: TZ })

/**
 * Split events into upcoming vs. past. An event stays "upcoming" through the end
 * of its calendar day (Pacific) and moves to past the next morning.
 */
export const partitionEvents = (
  events: PublicEvent[] = PUBLIC_EVENTS,
  now: Date = new Date()
) => {
  const today = now.toLocaleDateString('en-CA', { timeZone: TZ })
  const upcoming = events
    .filter((e) => pacificDay(e.endDateTime) >= today)
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime))
  const past = events
    .filter((e) => pacificDay(e.endDateTime) < today)
    .sort((a, b) => b.startDateTime.localeCompare(a.startDateTime))
  return { upcoming, past }
}

/** Compact UTC stamp for calendar links/files, e.g. 20260815T000000Z. */
const stamp = (iso: string): string =>
  new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '')

/** "Add to Google Calendar" link. */
export const googleCalendarUrl = (event: PublicEvent): string => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.title} · Public Vinyl Radio`,
    dates: `${stamp(event.startDateTime)}/${stamp(event.endDateTime)}`,
    details: event.description,
    location: `${event.venue}, ${event.location}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** iCalendar (.ics) contents, with a 1-hour-before reminder. */
export const buildIcs = (event: PublicEvent): string => {
  const escape = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Public Vinyl Radio//Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.slug}@publicvinylradio.com`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(event.startDateTime)}`,
    `DTEND:${stamp(event.endDateTime)}`,
    `SUMMARY:${escape(`${event.title} · Public Vinyl Radio`)}`,
    `DESCRIPTION:${escape(event.description)}`,
    `LOCATION:${escape(`${event.venue}, ${event.location}`)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'TRIGGER:-PT1H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

/** Data-URL for downloading the .ics file. */
export const icsDataUrl = (event: PublicEvent): string =>
  `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(event))}`
