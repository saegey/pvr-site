/**
 * shop-remove.mts — remove a product from the shop.
 *
 * Deletes the entry from src/data/products.ts and its image folder, and
 * (when run against a Stripe environment) archives the per-variant Stripe
 * products so they stop appearing on Checkout. The reverse of shop-new.
 *
 * Stripe products can't be hard-deleted once they have prices, so they're
 * archived (active: false) — the same as clicking "Archive" in the dashboard.
 *
 * Usage (via package.json):
 *   npm run shop:remove -- <product-id>              # local only (file + images)
 *   npm run shop:remove:sandbox -- <product-id>      # also archive in sandbox
 *   npm run shop:remove:live -- <product-id>         # also archive in live
 *
 * Flags: --yes (skip confirmation), --keep-images, --dry-run
 */
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import Stripe from 'stripe'
import { PRODUCTS, type Product } from '../src/data/products.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const PRODUCTS_FILE = join(REPO_ROOT, 'src/data/products.ts')
const SHOP_DIR = join(REPO_ROOT, 'static/images/shop')

const args = process.argv.slice(2)
const id = args.find(a => !a.startsWith('-'))
const envArg = args.find(a => a.startsWith('--env='))?.slice('--env='.length)
const yes = args.includes('--yes')
const keepImages = args.includes('--keep-images')
const dryRun = args.includes('--dry-run')

if (!id) {
  console.error('Usage: npm run shop:remove -- <product-id> [--env=sandbox|live] [--yes] [--keep-images] [--dry-run]')
  process.exit(1)
}

const product = PRODUCTS.find(p => p.id === id)
if (!product) {
  console.error(`✗ No product with id "${id}" in products.ts.`)
  process.exit(1)
}

const lookupKeys = product.variants?.length
  ? product.variants.map(v => v.priceLookupKey)
  : product.priceLookupKey
    ? [product.priceLookupKey]
    : []

// Resolve a Stripe client only when an environment is requested.
function stripeFor(env: string): Stripe {
  const secretVar = env === 'live' ? 'STRIPE_SECRET_KEY_LIVE' : 'STRIPE_SECRET_KEY_SANDBOX'
  const secret = process.env[secretVar]
  if (!secret) {
    console.error(
      `Missing ${secretVar}. Archive in Stripe by running through 1Password:\n` +
      `  npm run shop:remove:${env} -- ${id}`
    )
    process.exit(1)
  }
  if (env === 'live' && secret.startsWith('sk_test')) {
    console.error('--env=live but the key looks like a test key. Aborting.')
    process.exit(1)
  }
  if (env === 'sandbox' && secret.startsWith('sk_live')) {
    console.error('--env=sandbox but the key looks like a LIVE key. Aborting.')
    process.exit(1)
  }
  return new Stripe(secret)
}

// Archive every Stripe product backing this catalog entry, found via its price
// lookup keys. Deactivating the price is best-effort (Stripe blocks archiving a
// product's default price) — archiving the product is what hides it.
async function archiveInStripe(stripe: Stripe) {
  const archived = new Set<string>()
  for (const key of lookupKeys) {
    const prices = await stripe.prices.list({ lookup_keys: [key], limit: 1 })
    const price = prices.data[0]
    if (!price) {
      console.log(`  - no Stripe price for ${key}`)
      continue
    }
    const productId = typeof price.product === 'string' ? price.product : price.product.id
    if (!dryRun) {
      try {
        await stripe.prices.update(price.id, { active: false })
      } catch {
        /* default price can't be deactivated; archiving the product is enough */
      }
    }
    if (!archived.has(productId)) {
      archived.add(productId)
      if (!dryRun) await stripe.products.update(productId, { active: false })
      console.log(`  ✓ archived Stripe product ${productId} (${key})`)
    }
  }
}

// Remove the entry's object block from products.ts by brace-matching from its
// `id:` line (string-aware, so braces/quotes inside values don't confuse it).
function removeFromProductsFile() {
  const src = readFileSync(PRODUCTS_FILE, 'utf8')
  const idIdx = src.indexOf(`id: ${JSON.stringify(id)}`)
  if (idIdx === -1) throw new Error(`Could not locate id "${id}" in products.ts`)

  const openIdx = src.lastIndexOf('{', idIdx)
  const lineStart = src.lastIndexOf('\n', openIdx) + 1

  let depth = 0
  let inStr = false
  let esc = false
  let closeIdx = -1
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i]
    if (inStr) {
      if (esc) esc = false
      else if (c === '\\') esc = true
      else if (c === '"') inStr = false
      continue
    }
    if (c === '"') inStr = true
    else if (c === '{') depth++
    else if (c === '}' && --depth === 0) { closeIdx = i; break }
  }
  if (closeIdx === -1) throw new Error('Could not find the end of the product entry')

  let end = closeIdx + 1
  if (src[end] === ',') end++
  if (src[end] === '\n') end++

  if (!dryRun) writeFileSync(PRODUCTS_FILE, src.slice(0, lineStart) + src.slice(end))
}

async function main() {
  const stripe = envArg ? stripeFor(envArg) : null
  const imageDir = join(SHOP_DIR, id!)

  console.log(`\nRemove "${product!.name}" (${id})${dryRun ? ' — dry run' : ''}:`)
  console.log(`  • entry in src/data/products.ts`)
  if (!keepImages && existsSync(imageDir)) console.log(`  • image folder static/images/shop/${id}/`)
  if (stripe) console.log(`  • archive ${lookupKeys.length} Stripe product(s) in ${envArg}`)
  else console.log(`  • Stripe: not touched (pass --env / use shop:remove:sandbox to archive)`)

  if (!yes && !dryRun) {
    const rl = createInterface({ input, output })
    const answer = (await rl.question('\nProceed? (y/n) ')).trim().toLowerCase()
    rl.close()
    if (!answer.startsWith('y')) {
      console.log('Aborted — nothing changed.')
      return
    }
  }

  if (stripe) await archiveInStripe(stripe)
  removeFromProductsFile()
  console.log(`  ✓ removed entry from products.ts`)
  if (!keepImages && existsSync(imageDir)) {
    if (!dryRun) rmSync(imageDir, { recursive: true, force: true })
    console.log(`  ✓ removed static/images/shop/${id}/`)
  }

  console.log(`\n✓ Done${dryRun ? ' (dry run — nothing changed)' : ''}.`)
  if (!stripe) {
    console.log(`\nNote: the Stripe products still exist. Archive them with:`)
    console.log(`  npm run shop:remove:sandbox -- ${id}   # and/or :live`)
  }
}

main().catch(err => {
  console.error('\n✗', err.message)
  process.exit(1)
})
