/** Shared helpers for reading/writing public events from the event scripts. */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PublicEvent } from '../../src/data/public-events.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const publicEventsPath = resolve(__dirname, '../../src/data/public-events.data.json')

export const readEvents = (): PublicEvent[] =>
  JSON.parse(readFileSync(publicEventsPath, 'utf8')) as PublicEvent[]

export const writeEvents = (events: PublicEvent[]): void =>
  writeFileSync(publicEventsPath, `${JSON.stringify(events, null, 2)}\n`)

/** All events are Seattle-based; an event is "past" the morning after its end (Pacific). */
const TZ = 'America/Los_Angeles'
export const isPastEvent = (event: PublicEvent, now = new Date()): boolean =>
  new Date(event.endDateTime).toLocaleDateString('en-CA', { timeZone: TZ }) <
  now.toLocaleDateString('en-CA', { timeZone: TZ })
