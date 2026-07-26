/**
 * shop-remove.mts — remove a product from the shop.
 *
 * Deletes the entry from src/data/products.ts and its image folder, and
 * (when run against a Stripe environment) archives the per-variant Stripe
 * products so they stop appearing on Checkout. The reverse of shop-new.
 *
 * Stripe products can't be hard-deleted once they have prices, so they're
 * archived (active: false) — the same as clicking "Archive" in the dashboard.
 * They're found by the `pvr_id` metadata the sync stamps on them, so archiving
 * works even if the products.ts entry was already removed.
 *
 * Usage (via package.json):
 *   npm run shop:remove -- <product-id>              # local only (file + images)
 *   npm run shop:remove:sandbox -- <product-id>      # also archive in sandbox
 *   npm run shop:remove:live -- <product-id>         # also archive in live
 *   npm run shop:remove:all -- <product-id>          # archive in both, then remove
 *
 * Flags: --yes (skip confirmation), --keep-images, --dry-run
 */
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import Stripe from 'stripe'
import { PRODUCTS } from '../src/data/products.ts'

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
  console.error('Usage: npm run shop:remove -- <product-id> [--env=sandbox|live|all] [--yes] [--keep-images] [--dry-run]')
  process.exit(1)
}
if (envArg && !['sandbox', 'live', 'all'].includes(envArg)) {
  console.error(`Invalid --env=${envArg} (expected sandbox, live, or all).`)
  process.exit(1)
}

const envs: ('sandbox' | 'live')[] = envArg === 'all' ? ['sandbox', 'live'] : envArg ? [envArg as 'sandbox' | 'live'] : []

const product = PRODUCTS.find(p => p.id === id)
const imageDir = join(SHOP_DIR, id)
const removeImages = !keepImages && existsSync(imageDir)
if (!product && envs.length === 0 && !removeImages) {
  console.error(`✗ Nothing to do for "${id}": no products.ts entry, no --env to archive, no image folder.`)
  process.exit(1)
}

// Lookup keys from the catalog entry, when it's still present. Used to catch any
// Stripe product not yet indexed by the metadata search.
const lookupKeys = product?.variants?.length
  ? product.variants.map(v => v.priceLookupKey)
  : product?.priceLookupKey
    ? [product.priceLookupKey]
    : []

function stripeFor(env: 'sandbox' | 'live'): Stripe {
  const secretVar = env === 'live' ? 'STRIPE_SECRET_KEY_LIVE' : 'STRIPE_SECRET_KEY_SANDBOX'
  const secret = process.env[secretVar]
  if (!secret) {
    console.error(
      `Missing ${secretVar}. Archive in Stripe by running through 1Password:\n` +
      `  npm run shop:remove:${env === 'live' ? 'live' : 'sandbox'} -- ${id}`
    )
    process.exit(1)
  }
  if (env === 'live' && secret.startsWith('sk_test')) {
    console.error('--env includes live but the key looks like a test key. Aborting.')
    process.exit(1)
  }
  if (env === 'sandbox' && secret.startsWith('sk_live')) {
    console.error('--env includes sandbox but the key looks like a LIVE key. Aborting.')
    process.exit(1)
  }
  return new Stripe(secret)
}

// Archive every Stripe product for this catalog id — found by the pvr_id
// metadata stamp, plus any still-active price lookup keys as a backstop.
async function archiveInStripe(stripe: Stripe, env: string) {
  const productIds = new Map<string, string>() // id -> how it was found

  const byMeta = await stripe.products.search({ query: `metadata['pvr_id']:'${id}'`, limit: 100 })
  for (const p of byMeta.data) productIds.set(p.id, 'pvr_id')

  for (const key of lookupKeys) {
    const prices = await stripe.prices.list({ lookup_keys: [key], limit: 1 })
    const price = prices.data[0]
    if (!price) continue
    const pid = typeof price.product === 'string' ? price.product : price.product.id
    if (!productIds.has(pid)) productIds.set(pid, key)
    // Free the lookup key too (best-effort — a default price can't be deactivated).
    if (!dryRun) {
      try { await stripe.prices.update(price.id, { active: false }) } catch { /* default price */ }
    }
  }

  if (productIds.size === 0) {
    console.log(`  - ${env}: no matching Stripe products`)
    return
  }
  for (const [pid, via] of productIds) {
    if (!dryRun) await stripe.products.update(pid, { active: false })
    console.log(`  ✓ ${env}: archived ${pid} (${via})`)
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
  // Build clients up front so a missing key aborts before anything changes.
  const clients = envs.map(env => ({ env, stripe: stripeFor(env) }))

  console.log(`\nRemove "${product?.name ?? id}" (${id})${dryRun ? ' — dry run' : ''}:`)
  if (product) console.log(`  • entry in src/data/products.ts`)
  else console.log(`  • entry already gone from products.ts`)
  if (removeImages) console.log(`  • image folder static/images/shop/${id}/`)
  if (clients.length) console.log(`  • archive Stripe products in: ${envs.join(', ')}`)
  else console.log(`  • Stripe: not touched (use shop:remove:sandbox / :live / :all)`)

  if (!yes && !dryRun) {
    const rl = createInterface({ input, output })
    const answer = (await rl.question('\nProceed? (y/n) ')).trim().toLowerCase()
    rl.close()
    if (!answer.startsWith('y')) {
      console.log('Aborted — nothing changed.')
      return
    }
  }

  for (const { env, stripe } of clients) await archiveInStripe(stripe, env)

  if (product) {
    removeFromProductsFile()
    console.log(`  ✓ removed entry from products.ts`)
  }
  if (removeImages) {
    if (!dryRun) rmSync(imageDir, { recursive: true, force: true })
    console.log(`  ✓ removed static/images/shop/${id}/`)
  }

  console.log(`\n✓ Done${dryRun ? ' (dry run — nothing changed)' : ''}.`)
  if (!clients.length) {
    console.log(`\nNote: any Stripe products still exist. Archive them with:`)
    console.log(`  npm run shop:remove:all -- ${id}    # sandbox + live`)
  }
}

main().catch(err => {
  console.error('\n✗', err.message)
  process.exit(1)
})
