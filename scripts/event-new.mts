/** Interactively add a public event or private listening session. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

type PublicEvent = {
  slug: string
  date: string
  title: string
  venue: string
  location: string
  time: string
  description: string
  djs: string[]
  maxPlusOnes: number
  rsvpEnabled: boolean
  rsvpUrl?: string
  partnerLogo?: string
  partnerLogoAlt?: string
}

type PrivateEvent = {
  slug: string
  accessCode: string
  title: string
  date: string
  dateLabel: string
  time: string
  description: string
  capacity: number
  maxPlusOnes: number
  location: string
  address?: string
  djs: string[]
  isPrivate: true
  isActive: true
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const publicEventsPath = resolve(root, 'src/data/public-events.data.json')
const privateEventsPath = resolve(root, 'src/data/events.data.json')
const dryRun = process.argv.includes('--dry-run')

const readJson = <T,>(path: string): T[] => JSON.parse(readFileSync(path, 'utf8')) as T[]
const writeJson = <T,>(path: string, value: T[]) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const formatDate = (date: string, month: 'short' | 'long') => new Intl.DateTimeFormat('en-US', {
  month, day: 'numeric', year: 'numeric',
}).format(new Date(`${date}T12:00:00`))

const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00`))
const ACCESS_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
const accessCode = () => Array.from(randomBytes(5), byte => ACCESS_ALPHABET[byte % ACCESS_ALPHABET.length]).join('')

async function main() {
  const rl = createInterface({ input, output })
  const ask = async (label: string, fallback?: string) => {
    const answer = (await rl.question(`${label}${fallback ? ` [${fallback}]` : ''}: `)).trim()
    return answer || fallback || ''
  }
  const required = async (label: string, fallback?: string) => {
    let value = await ask(label, fallback)
    while (!value) {
      console.log('This field is required.')
      value = await ask(label, fallback)
    }
    return value
  }
  const integer = async (label: string, fallback: number, minimum = 0) => {
    let value = await ask(label, String(fallback))
    while (!Number.isInteger(Number(value)) || Number(value) < minimum) {
      console.log(`Enter a whole number of at least ${minimum}.`)
      value = await ask(label, String(fallback))
    }
    return Number(value)
  }
  const yesNo = async (label: string, fallback = true) => ['y', 'yes'].includes((await ask(`${label} (y/n)`, fallback ? 'y' : 'n')).toLowerCase())

  try {
    const kind = (await ask('Event type: public or private', 'public')).toLowerCase()
    if (!['public', 'private'].includes(kind)) throw new Error('Event type must be public or private.')
    const isPublic = kind === 'public'
    const title = await required('Title')
    const slug = await required('Slug', slugify(title))
    if (slug !== slugify(slug)) throw new Error('Slug may contain lowercase letters, numbers, and hyphens only.')

    const publicEvents = readJson<PublicEvent>(publicEventsPath)
    const privateEvents = readJson<PrivateEvent>(privateEventsPath)
    if ([...publicEvents, ...privateEvents].some(event => event.slug === slug)) throw new Error(`An event already uses the slug "${slug}".`)

    let date = await required('Date (YYYY-MM-DD)')
    while (!isDate(date)) {
      console.log('Use a real date in YYYY-MM-DD format.')
      date = await required('Date (YYYY-MM-DD)')
    }
    const time = await required('Time (for example, 7:00 PM)')
    const description = await required('Description')
    const djs = (await required('DJs / hosts (comma-separated)')).split(',').map(value => value.trim()).filter(Boolean)
    const maxPlusOnes = await integer('Maximum plus-ones per RSVP', 1)

    let event: PublicEvent | PrivateEvent
    if (isPublic) {
      const venue = await required('Venue')
      const location = await required('Public location')
      const rsvpEnabled = await yesNo('Enable RSVPs', true)
      const partnerLogo = await ask('Partner logo path (optional, e.g. /images/partner.png)')
      const partnerLogoAlt = partnerLogo ? await required('Partner logo alt text') : ''
      event = {
        slug, date: formatDate(date, 'short'), title, venue, location, time, description, djs, maxPlusOnes, rsvpEnabled,
        ...(partnerLogo ? { partnerLogo, partnerLogoAlt } : {}),
      }
    } else {
      const capacity = await integer('Capacity', 8, 1)
      const location = await required('Public location', 'Seattle · address shared once you RSVP')
      const address = await ask('Private address/instructions (optional)')
      let shareCode = accessCode()
      while (privateEvents.some(existing => existing.accessCode === shareCode)) shareCode = accessCode()
      event = {
        slug, accessCode: shareCode, title, date, dateLabel: formatDate(date, 'long'), time, description, capacity, maxPlusOnes, location,
        ...(address ? { address } : {}), djs, isPrivate: true, isActive: true,
      }
    }

    console.log(`\n${dryRun ? 'Would add' : 'Adding'} ${isPublic ? 'public event' : 'private session'}:`)
    console.log(JSON.stringify(event, null, 2))
    if (!isPublic) console.log(`Private link: /e/${(event as PrivateEvent).accessCode}`)
    if (!await yesNo(`${dryRun ? 'Preview' : 'Write'} this event`, true)) {
      console.log('Cancelled. No files were changed.')
      return
    }

    const imageDirectory = resolve(root, 'static/images/events', slug)
    if (!dryRun) {
      if (isPublic) {
        publicEvents.push(event as PublicEvent)
        writeJson(publicEventsPath, publicEvents)
      } else {
        privateEvents.push(event as PrivateEvent)
        writeJson(privateEventsPath, privateEvents)
      }
      if (!existsSync(imageDirectory)) mkdirSync(imageDirectory, { recursive: true })
    }
    console.log(`${dryRun ? 'Preview complete' : 'Created event'}${dryRun ? '' : ` and image folder ${imageDirectory.replace(`${root}/`, '')}`}.`)
  } finally {
    rl.close()
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
