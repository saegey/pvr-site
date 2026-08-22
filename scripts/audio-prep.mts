/**
 * audio-prep.mts — join set recordings and crop dead air off the ends.
 *
 * A fast alternative to Audacity/Logic for the common case: stitch a recorder's
 * split files together and trim the silence before/after the set. All ffmpeg.
 *
 *   1. Collect input file(s) — a folder of parts (sorted) or a single file
 *   2. Join them losslessly (concat demuxer) when params match; else re-encode
 *   3. Auto-detect leading/trailing silence and suggest in/out points
 *   4. Let you accept, or override with exact timestamps (musical cuts)
 *   5. Optionally fade the volume out over the last N seconds (ends at the out point)
 *   6. Export a trimmed WAV (feeds event-recap) or MP3
 *
 * Interactive, checkpoint-driven, supports --dry-run (no final export).
 *
 * Usage:
 *   npm run audio:prep
 *   npm run audio:prep:dry
 *
 * Requirements: ffmpeg + ffprobe on PATH.
 */
import { existsSync, readdirSync, statSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, isAbsolute, join, resolve } from 'node:path'
import { homedir, tmpdir } from 'node:os'
import { execFileSync, spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const dryRun = process.argv.includes('--dry-run')

const AUDIO_EXTS = new Set(['.wav', '.aif', '.aiff', '.flac', '.mp3', '.m4a'])
const SILENCE_NOISE = '-50dB' // below this level counts as silence
const SILENCE_MIN = 1.5 // seconds of silence required to register
const MP3_BITRATE = '192k'

const expandPath = (p: string) => {
  const out = p.trim().replace(/^~(?=$|\/)/, homedir())
  return isAbsolute(out) ? out : resolve(process.cwd(), out)
}

const fmtTime = (s: number) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = (s % 60).toFixed(1).padStart(4, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

// Parse SS, MM:SS, or HH:MM:SS (each part may have decimals) → seconds.
const parseTime = (v: string): number | null => {
  const parts = v.trim().split(':').map(Number)
  if (parts.some((n) => Number.isNaN(n))) return null
  return parts.reduce((acc, n) => acc * 60 + n, 0)
}

const ffprobe = (args: string[]) =>
  spawnSync('ffprobe', args, { encoding: 'utf8' }).stdout?.trim() ?? ''

const probeDuration = (file: string): number =>
  Number(ffprobe(['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file])) || 0

const probeParams = (file: string): string =>
  ffprobe(['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=sample_rate,channels', '-of', 'csv=p=0', file])

/** Detect leading/trailing silence; return suggested [in, out] and the raw events. */
function detectTrim(file: string): { inPoint: number; outPoint: number; duration: number } {
  const duration = probeDuration(file)
  const res = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-i', file, '-af', `silencedetect=noise=${SILENCE_NOISE}:d=${SILENCE_MIN}`, '-f', 'null', '-'],
    { encoding: 'utf8' }
  )
  const log = res.stderr ?? ''
  const events: { type: 'start' | 'end'; t: number }[] = []
  for (const m of log.matchAll(/silence_(start|end):\s*(-?[0-9.]+)/g)) {
    events.push({ type: m[1] as 'start' | 'end', t: Math.max(0, parseFloat(m[2])) })
  }
  let inPoint = 0
  if (events[0]?.type === 'start' && events[0].t <= 0.5) {
    const firstEnd = events.find((e) => e.type === 'end')
    if (firstEnd) inPoint = firstEnd.t
  }
  let outPoint = duration
  const last = events[events.length - 1]
  if (last?.type === 'start' && last.t < duration - 0.1) outPoint = last.t
  return { inPoint, outPoint, duration }
}

async function main() {
  const rl = createInterface({ input, output })
  const ask = async (label: string, fallback?: string) => {
    const answer = (await rl.question(`${label}${fallback ? ` [${fallback}]` : ''}: `)).trim()
    return answer || fallback || ''
  }
  const yesNo = async (label: string, fallback = true) =>
    ['y', 'yes'].includes((await ask(`${label} (y/n)`, fallback ? 'y' : 'n')).toLowerCase())

  let tmpDir: string | undefined
  try {
    if (dryRun) console.log('— DRY RUN: detect + preview only, no export —\n')

    // 1) Collect inputs
    const src = expandPath(await ask('Folder of parts, or a single audio file'))
    if (!existsSync(src)) throw new Error(`Not found: ${src}`)
    let files: string[]
    if (statSync(src).isDirectory()) {
      files = readdirSync(src)
        .filter((f) => AUDIO_EXTS.has(extname(f).toLowerCase()) && !f.startsWith('.'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((f) => join(src, f))
      if (files.length === 0) throw new Error(`No audio files in ${src}.`)
    } else {
      files = [src]
    }
    console.log(`\nInput${files.length > 1 ? 's (joined in this order)' : ''}:`)
    files.forEach((f, i) => console.log(`  ${i + 1}. ${basename(f)}  (${fmtTime(probeDuration(f))})`))

    tmpDir = mkdtempSync(join(tmpdir(), 'pvr-audio-'))

    // 2) Join (lossless when params match; otherwise re-encode to PCM)
    let working = files[0]
    if (files.length > 1) {
      const params = files.map(probeParams)
      const uniform = params.every((p) => p === params[0])
      const listPath = join(tmpDir, 'concat.txt')
      writeFileSync(listPath, files.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'))
      working = join(tmpDir, 'joined.wav')
      console.log(`\nJoining ${files.length} files ${uniform ? '(lossless copy)' : '(re-encoding — mismatched formats)'}…`)
      const joinArgs = uniform
        ? ['-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', working]
        : ['-f', 'concat', '-safe', '0', '-i', listPath, '-c:a', 'pcm_s16le', working]
      execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...joinArgs], { stdio: 'inherit' })
    }

    // 3) Detect silence → suggested trim
    console.log('\nDetecting silence…')
    let { inPoint, outPoint, duration } = detectTrim(working)
    console.log(`  Total:      ${fmtTime(duration)}`)
    console.log(`  Suggested in:  ${fmtTime(inPoint)}${inPoint === 0 ? '  (no leading silence)' : ''}`)
    console.log(`  Suggested out: ${fmtTime(outPoint)}${outPoint >= duration - 0.1 ? '  (no trailing silence)' : ''}`)
    console.log(`  Kept length:   ${fmtTime(Math.max(0, outPoint - inPoint))}`)

    // 4) Accept or override
    if (!(await yesNo('\nUse these crop points'))) {
      const inStr = await ask('Start (blank = keep suggested)', fmtTime(inPoint))
      const outStr = await ask('End (blank = keep suggested)', fmtTime(outPoint))
      const parsedIn = parseTime(inStr)
      const parsedOut = parseTime(outStr)
      if (parsedIn == null || parsedOut == null) throw new Error('Could not parse a timestamp.')
      if (parsedOut <= parsedIn) throw new Error('End must be after start.')
      inPoint = Math.max(0, parsedIn)
      outPoint = Math.min(duration, parsedOut)
      console.log(`  → in ${fmtTime(inPoint)}, out ${fmtTime(outPoint)}, kept ${fmtTime(outPoint - inPoint)}`)
    }

    // 5) Optional fade-out ending at the out point
    const kept = outPoint - inPoint
    let fadeDur = 0
    const fadeStr = await ask('\nFade-out length in seconds before the end (blank = hard cut)', '')
    if (fadeStr.trim()) {
      const parsed = Number(fadeStr)
      if (Number.isNaN(parsed) || parsed <= 0) throw new Error('Fade must be a positive number of seconds.')
      fadeDur = Math.min(parsed, kept)
      console.log(`  → fading out over the last ${fmtTime(fadeDur)}, silent at ${fmtTime(outPoint)}.`)
    }

    // 6) Export
    const fmt = (await ask('Output format: wav or mp3', 'wav')).toLowerCase()
    if (!['wav', 'mp3'].includes(fmt)) throw new Error('Format must be wav or mp3.')
    const baseName = `${basename(files[0], extname(files[0]))}-prepped.${fmt}`
    const outPath = expandPath(await ask('Output path', join(dirname(files[0]), baseName)))

    // Input seek + fixed output length (unambiguous with the fade timeline, which
    // starts at 0). A fade requires a re-encode, so WAV drops `-c copy` for PCM.
    const trimArgs = ['-ss', String(inPoint), '-i', working, '-t', String(kept)]
    const filterArgs = fadeDur > 0 ? ['-af', `afade=t=out:st=${(kept - fadeDur).toFixed(3)}:d=${fadeDur}`] : []
    const codecArgs =
      fmt === 'mp3'
        ? ['-codec:a', 'libmp3lame', '-b:a', MP3_BITRATE]
        : fadeDur > 0
          ? ['-c:a', 'pcm_s16le']
          : ['-c', 'copy']
    const ffmpegArgs = [...trimArgs, ...filterArgs, ...codecArgs]

    if (dryRun) {
      console.log(`\nWould export → ${outPath}`)
      console.log(`  ffmpeg ${ffmpegArgs.join(' ')} ${outPath}`)
      console.log('Dry run complete. No file written.')
      return
    }
    if (!(await yesNo(`\nExport trimmed ${fmt.toUpperCase()} to ${outPath}`, true))) {
      console.log('Cancelled. No file written.')
      return
    }
    console.log('Exporting…')
    execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...ffmpegArgs, outPath], {
      stdio: 'inherit',
    })
    console.log(`✓ Wrote ${outPath} (${fmtTime(kept)}${fadeDur > 0 ? `, ${fmtTime(fadeDur)} fade-out` : ''})`)
    console.log('  → feed this into `npm run event:recap` as the WAV/audio for the set.')
  } finally {
    rl.close()
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
