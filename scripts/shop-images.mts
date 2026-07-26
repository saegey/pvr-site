/**
 * shop-images.mts — generate optimized shop images from source files.
 *
 * For every image listed in src/data/products.ts this generates the two
 * derivatives the storefront expects, from the source PNG/JPG in
 * static/images/shop/<id>/:
 *
 *   <name>.webp        1200px wide — used on the product cards (shop.tsx)
 *   <name>-thumb.webp   320px wide — used in the cart drawer (cart-drawer.tsx)
 *
 * Derivatives are skipped when they already exist and are newer than the
 * source. Pass --force to regenerate everything.
 *
 * Usage:
 *   node scripts/shop-images.mts            # generate missing/stale
 *   node scripts/shop-images.mts --force    # regenerate all
 */
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, extname, basename } from 'node:path'
import { existsSync, statSync } from 'node:fs'
import sharp from 'sharp'
import { PRODUCTS } from '../src/data/products.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const STATIC_DIR = join(REPO_ROOT, 'static')

const FULL_WIDTH = 1200
const THUMB_WIDTH = 320
const WEBP_QUALITY = 80

const force = process.argv.includes('--force')

// Map a site-root image path ("/images/shop/x/y.png") to a filesystem path.
const toFsPath = (sitePath: string) => join(STATIC_DIR, sitePath.replace(/^\//, ''))

// Find the source file for an image entry. products.ts references the .png,
// but the source could also be a .jpg/.jpeg — prefer the referenced path,
// then fall back to common extensions.
const findSource = (fsPath: string): string | null => {
  if (existsSync(fsPath)) return fsPath
  const withoutExt = fsPath.slice(0, -extname(fsPath).length)
  for (const ext of ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']) {
    if (existsSync(withoutExt + ext)) return withoutExt + ext
  }
  return null
}

const isStale = (source: string, output: string) => {
  if (force) return true
  if (!existsSync(output)) return true
  return statSync(source).mtimeMs > statSync(output).mtimeMs
}

type Result = { created: string[]; skipped: number; missing: string[] }
const result: Result = { created: [], skipped: 0, missing: [] }

// De-dupe image paths across products (some share source folders).
const imagePaths = [...new Set(PRODUCTS.flatMap(p => p.images))]

for (const sitePath of imagePaths) {
  const source = findSource(toFsPath(sitePath))
  if (!source) {
    result.missing.push(sitePath)
    continue
  }

  const dir = dirname(source)
  const stem = basename(source, extname(source))
  const full = join(dir, `${stem}.webp`)
  const thumb = join(dir, `${stem}-thumb.webp`)

  for (const [output, width] of [
    [full, FULL_WIDTH],
    [thumb, THUMB_WIDTH],
  ] as const) {
    if (!isStale(source, output)) {
      result.skipped++
      continue
    }
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(output)
    result.created.push(output.replace(REPO_ROOT + '/', ''))
  }
}

console.log(`\n✓ ${result.created.length} generated, ${result.skipped} up to date`)
for (const f of result.created) console.log(`  + ${f}`)
if (result.missing.length) {
  console.log(`\n⚠ ${result.missing.length} image(s) have no source file — add the PNG/JPG:`)
  for (const m of result.missing) console.log(`  ! ${m}`)
  process.exitCode = 1
}
