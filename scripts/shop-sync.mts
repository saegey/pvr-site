/**
 * shop-sync.mts — sync the catalog in src/data/products.ts to Stripe.
 *
 * products.ts is the source of truth. For each product this ensures a matching
 * Stripe Product (name, description, images shown on the Checkout page) and a
 * Price with the right lookup key for each variant (or one price if there are
 * no variants). It is idempotent — re-running only changes what drifted.
 *
 * Stripe Prices are immutable, so when an amount changes this creates a new
 * Price, transfers the lookup key to it, and archives the old one. The
 * storefront resolves lookup keys at checkout, so nothing else needs to change.
 *
 * Products are matched to Stripe by the metadata field `pvr_id` (= product.id),
 * so the same catalog maps cleanly onto both sandbox and live accounts.
 *
 * Auth: secrets come from 1Password via `op run --env-file=.env.op`, which
 * injects STRIPE_SECRET_KEY_SANDBOX and STRIPE_SECRET_KEY_LIVE. `--env` picks
 * which one to use.
 *
 * Usage (via package.json):
 *   npm run shop:sync:sandbox            # write to the sandbox account
 *   npm run shop:sync:live              # promote the same catalog to live
 *   npm run shop:sync:sandbox -- --dry-run
 */
import Stripe from 'stripe'
import { PRODUCTS, type Product } from '../src/data/products.ts'

const args = process.argv.slice(2)
const env = args.includes('--env=live') ? 'live' : 'sandbox'
const dryRun = args.includes('--dry-run')

const SITE_URL = (process.env.SITE_URL || 'https://publicvinylradio.com').replace(/\/$/, '')
const MAX_STRIPE_IMAGES = 8

const secretVar = env === 'live' ? 'STRIPE_SECRET_KEY_LIVE' : 'STRIPE_SECRET_KEY_SANDBOX'
const secret = process.env[secretVar]
if (!secret) {
  console.error(
    `Missing ${secretVar}. Run through 1Password, e.g.\n` +
    `  op run --env-file=.env.op -- node scripts/shop-sync.mts --env=${env}`
  )
  process.exit(1)
}
if (env === 'live' && secret.startsWith('sk_test')) {
  console.error('--env=live but the key looks like a test key. Aborting to avoid writing test data to live.')
  process.exit(1)
}
if (env === 'sandbox' && secret.startsWith('sk_live')) {
  console.error('--env=sandbox but the key looks like a LIVE key. Aborting to avoid touching live.')
  process.exit(1)
}

const stripe = new Stripe(secret)
const cents = (usd: number) => Math.round(usd * 100)

// Public URLs for the .webp derivatives; these render on the Checkout page.
const imageUrls = (product: Product) =>
  product.images
    .slice(0, MAX_STRIPE_IMAGES)
    .map(p => SITE_URL + p.replace(/\.(png|jpe?g)$/i, '.webp'))

// { lookupKey, amount } pairs for a product — one per variant, or a single one.
const priceEntries = (product: Product): { lookupKey: string; amount: number }[] => {
  if (product.variants?.length) {
    return product.variants.map(v => ({ lookupKey: v.priceLookupKey, amount: cents(product.price) }))
  }
  if (product.priceLookupKey) {
    return [{ lookupKey: product.priceLookupKey, amount: cents(product.price) }]
  }
  return []
}

// Resolve the Stripe product this catalog entry maps to. Prefer the pvr_id
// metadata stamp; otherwise adopt a product that already owns one of our lookup
// keys (e.g. one created by hand before this script existed) so we update it in
// place instead of creating a duplicate. prices.list is strongly consistent, so
// this also finds a product created moments ago whose metadata search index
// hasn't caught up yet.
async function findProduct(product: Product): Promise<Stripe.Product | null> {
  const byMeta = await stripe.products.search({
    query: `metadata['pvr_id']:'${product.id}'`,
    limit: 1,
  })
  if (byMeta.data[0]) return byMeta.data[0]

  for (const { lookupKey } of priceEntries(product)) {
    const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 })
    const owningProductId = prices.data[0]?.product
    if (typeof owningProductId === 'string') {
      return stripe.products.retrieve(owningProductId)
    }
  }
  return null
}

async function ensureProduct(product: Product): Promise<Stripe.Product> {
  const desired: Stripe.ProductUpdateParams = {
    name: product.name,
    description: product.description,
    images: imageUrls(product),
    active: true,
    metadata: { pvr_id: product.id },
  }
  const existing = await findProduct(product)

  if (!existing) {
    console.log(`  + create product "${product.name}"`)
    if (dryRun) return { id: `dry_${product.id}` } as Stripe.Product
    return stripe.products.create({ ...desired } as Stripe.ProductCreateParams)
  }

  const drifted =
    existing.name !== desired.name ||
    existing.description !== desired.description ||
    JSON.stringify(existing.images) !== JSON.stringify(desired.images) ||
    existing.metadata?.pvr_id !== product.id ||
    !existing.active
  if (drifted) {
    console.log(`  ~ update product "${product.name}"`)
    if (!dryRun) await stripe.products.update(existing.id, desired)
  } else {
    console.log(`  = product "${product.name}" up to date`)
  }
  return existing
}

async function ensurePrice(productId: string, lookupKey: string, amount: number) {
  const found = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 })
  const existing = found.data[0]

  if (!existing) {
    console.log(`    + price ${lookupKey} = $${(amount / 100).toFixed(2)}`)
    if (!dryRun) {
      await stripe.prices.create({
        product: productId,
        currency: 'usd',
        unit_amount: amount,
        lookup_key: lookupKey,
        transfer_lookup_key: true,
      })
    }
    return
  }

  const sameAmount = existing.unit_amount === amount
  const sameProduct = existing.product === productId
  if (sameAmount && sameProduct) {
    console.log(`    = price ${lookupKey} up to date`)
    return
  }

  // Prices are immutable — create a new one, move the lookup key, archive old.
  console.log(`    ~ reprice ${lookupKey} → $${(amount / 100).toFixed(2)} (new price, archive old)`)
  if (!dryRun) {
    const newPrice = await stripe.prices.create({
      product: productId,
      currency: 'usd',
      unit_amount: amount,
      lookup_key: lookupKey,
      transfer_lookup_key: true,
    })
    await archivePrice(existing, newPrice)
  }
}

// Archive a superseded price. Stripe refuses to archive a product's default
// price, so if this one is the default, first repoint the product at the
// replacement (only possible when both belong to the same product). Archiving
// is cleanup — the lookup key has already moved — so a failure warns rather
// than aborting the whole sync.
async function archivePrice(oldPrice: Stripe.Price, newPrice: Stripe.Price) {
  try {
    await stripe.prices.update(oldPrice.id, { active: false })
  } catch (err: any) {
    const oldProductId = typeof oldPrice.product === 'string' ? oldPrice.product : oldPrice.product?.id
    if (oldProductId && oldProductId === newPrice.product) {
      await stripe.products.update(oldProductId, { default_price: newPrice.id })
      await stripe.prices.update(oldPrice.id, { active: false })
    } else {
      console.log(`      ⚠ left old price ${oldPrice.id} active (could not archive: ${err.message})`)
    }
  }
}

async function main() {
  console.log(`\nSyncing ${PRODUCTS.length} products → Stripe ${env}${dryRun ? ' (dry run)' : ''}\n`)
  for (const product of PRODUCTS) {
    console.log(`• ${product.id}`)
    const entries = priceEntries(product)
    if (entries.length === 0) {
      console.log(`  ! no priceLookupKey or variants — skipping`)
      process.exitCode = 1
      continue
    }
    const stripeProduct = await ensureProduct(product)
    for (const { lookupKey, amount } of entries) {
      await ensurePrice(stripeProduct.id, lookupKey, amount)
    }
  }
  console.log(`\n✓ Done${dryRun ? ' (dry run — nothing written)' : ''}.`)
}

main().catch(err => {
  console.error('\n✗ Sync failed:', err.message)
  process.exit(1)
})
