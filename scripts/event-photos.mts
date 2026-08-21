/**
 * event-photos.mts — attach post-event photos to a public event.
 *
 * Interactive, checkpoint-driven flow that:
 *   1. Picks a past public event from src/data/public-events.data.json
 *   2. Reads a folder of source photos (jpg/jpeg/png/webp)
 *   3. Generates web-friendly .webp derivatives with sharp:
 *        <name>.webp        — full image, max 1600px wide (carousel)
 *        <name>-thumb.webp  — 600×600 square crop (collage tile)
 *   4. Uploads both to Cloudflare R2 under events/<slug>/photos/
 *   5. Writes a photos[] array back into the event's JSON
 *
 * The photos render as a grayscale collage (PhotoCollage) that opens a
 * fullscreen carousel, on the event page via public-event-template.tsx.
 *
 * Usage:
 *   op run --env-file=.env.op -- node scripts/event-photos.mts
 *   op run --env-file=.env.op -- node scripts/event-photos.mts --dry-run
 *   npm run event:photos
 *
 * Requirements:
 *   - R2 credentials in the environment (see .env.example)
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, extname, isAbsolute, join, resolve } from 'node:path'
import { homedir } from 'node:os'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import sharp from 'sharp'
import { uploadBuffer, r2PublicUrl } from './lib/r2.mts'
import { readEvents, writeEvents, isPastEvent } from './lib/events.mts'
import type { PublicEvent } from '../src/data/public-events.ts'

const dryRun = process.argv.includes('--dry-run')

const FULL_WIDTH = 1600
const THUMB_SIZE = 600
const FULL_QUALITY = 80
const THUMB_QUALITY = 70
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const expandPath = (p: string) => {
  let out = p.trim().replace(/^~(?=$|\/)/, homedir())
  return isAbsolute(out) ? out : resolve(process.cwd(), out)
}

const fmtBytes = (n: number) =>
  n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${(n / 1024).toFixed(0)} KB`

// Filesystem-safe stem from a source filename (keeps ordering-friendly names).
const stemOf = (file: string) =>
  basename(file, extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

async function main() {
  const rl = createInterface({ input, output })
  const ask = async (label: string, fallback?: string) => {
    const answer = (await rl.question(`${label}${fallback ? ` [${fallback}]` : ''}: `)).trim()
    return answer || fallback || ''
  }
  const yesNo = async (label: string, fallback = true) =>
    ['y', 'yes'].includes((await ask(`${label} (y/n)`, fallback ? 'y' : 'n')).toLowerCase())

  try {
    if (dryRun) console.log('— DRY RUN: no upload, no file writes —\n')

    // 1) Pick a past event
    const events = readEvents()
    const past = events.filter((e) => isPastEvent(e))
    if (past.length === 0) throw new Error('No past events found in public-events.data.json.')
    console.log('Past events:')
    past.forEach((e, i) => console.log(`  ${i + 1}. ${e.title}  (${e.slug})`))
    const event = past[Number(await ask('Pick an event by number')) - 1]
    if (!event) throw new Error('Invalid selection.')

    // 2) Read the source folder
    const dir = expandPath(await ask('Path to the folder of photos'))
    if (!existsSync(dir) || !statSync(dir).isDirectory()) {
      throw new Error(`Not a folder: ${dir}`)
    }
    const files = readdirSync(dir)
      .filter((f) => IMAGE_EXTS.has(extname(f).toLowerCase()) && !f.startsWith('.'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    if (files.length === 0) throw new Error(`No jpg/png/webp images found in ${dir}.`)
    console.log(`\nFound ${files.length} photo(s):`)
    files.forEach((f) => console.log(`  • ${f}`))

    // How to combine with any existing photos on the event.
    let mode: 'replace' | 'append' = 'replace'
    if (event.photos && event.photos.length > 0) {
      console.log(`\n"${event.slug}" already has ${event.photos.length} photo(s).`)
      mode = (await yesNo('Append to them (n = replace)', false)) ? 'append' : 'replace'
    }
    if (!(await yesNo(`\nProcess ${files.length} photo(s) at ${FULL_WIDTH}px + ${THUMB_SIZE}px thumbs`, true))) {
      console.log('Cancelled.')
      return
    }

    // 3 + 4) Resize → upload
    const photos: NonNullable<PublicEvent['photos']> = []
    for (const [i, file] of files.entries()) {
      const src = readFileSync(join(dir, file))
      const stem = stemOf(file) || `photo-${i + 1}`
      const fullBuf = await sharp(src)
        .rotate()
        .resize({ width: FULL_WIDTH, withoutEnlargement: true })
        .webp({ quality: FULL_QUALITY })
        .toBuffer()
      const thumbBuf = await sharp(src)
        .rotate()
        .resize({ width: THUMB_SIZE, height: THUMB_SIZE, fit: 'cover' })
        .webp({ quality: THUMB_QUALITY })
        .toBuffer()

      const fullKey = `events/${event.slug}/photos/${stem}.webp`
      const thumbKey = `events/${event.slug}/photos/${stem}-thumb.webp`
      const label = `[${i + 1}/${files.length}] ${file} → ${fmtBytes(fullBuf.length)} + ${fmtBytes(thumbBuf.length)} thumb`

      if (dryRun) {
        console.log(`  ${label}  (would upload → r2://${fullKey})`)
        photos.push({ original: r2PublicUrl(fullKey), thumbnail: r2PublicUrl(thumbKey) })
      } else {
        process.stdout.write(`  ${label} … `)
        const [original, thumbnail] = await Promise.all([
          uploadBuffer(fullKey, fullBuf, 'image/webp'),
          uploadBuffer(thumbKey, thumbBuf, 'image/webp'),
        ])
        photos.push({ original, thumbnail })
        console.log('✓')
      }
    }

    // 5) Write back into the event JSON
    const nextPhotos = mode === 'append' ? [...(event.photos ?? []), ...photos] : photos
    const updated: PublicEvent = { ...event, photos: nextPhotos }
    console.log(
      `\n${dryRun ? 'Would write' : 'Writing'} ${nextPhotos.length} photo(s) to "${event.slug}" (${mode}).`
    )
    if (!(await yesNo(`${dryRun ? 'Preview' : 'Save'} this`, true))) {
      console.log('Cancelled. No files were changed.')
      return
    }

    if (!dryRun) {
      writeEvents(events.map((e) => (e.slug === event.slug ? updated : e)))
      console.log(`✓ Saved ${nextPhotos.length} photo(s) for "${event.slug}".`)
    } else {
      console.log('Preview complete. No files were changed.')
    }
  } finally {
    rl.close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
