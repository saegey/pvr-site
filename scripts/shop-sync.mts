/**
 * shop-sync.mts — sync the catalog in src/data/products.ts to Stripe.
 *
 * products.ts is the source of truth. Each product becomes one or more "sync
 * units" — a plain product is one unit, a product with variants is one unit per
 * variant. Each unit is its own Stripe Product named "<product> — <variant>"
 * (so the variant, e.g. a shirt size, shows on the Checkout page) with a single
 * Price carrying that variant's lookup key. Product name/description and the
 * .webp images are synced too. Stripe requires publicly reachable image URLs, so
 * images point at the deployed site (override the host with --image-base=<url>,
 * e.g. a Netlify deploy preview); if an image can't be fetched the product still
 * syncs without it. It is idempotent — re-running only changes what drifted, and
 * images are only re-sent when their bytes or the base URL change (tracked via
 * an image_hash).
 *
 * Stripe Prices are immutable, so when an amount changes this creates a new
 * Price, transfers the lookup key to it, and archives the old one. The
 * storefront resolves lookup keys at checkout, so the cart never changes.
 *
 * Units are matched to Stripe by the metadata field `pvr_key` (= the price
 * lookup key), so the same catalog maps cleanly onto both sandbox and live.
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
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import Stripe from 'stripe'
import { PRODUCTS, type Product } from '../src/data/products.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STATIC_DIR = resolve(__dirname, '..', 'static')

const args = process.argv.slice(2)
const env = args.includes('--env=live') ? 'live' : 'sandbox'
const dryRun = args.includes('--dry-run')

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

// Where Stripe fetches product images from. Stripe requires publicly reachable
// URLs (you can't host arbitrary product images through the Files API), so this
// points at the deployed site. Override with --image-base=<url> to use e.g. a
// Netlify deploy-preview URL when testing a product before it's merged/deployed.
const imageBase = (
  args.find(a => a.startsWith('--image-base='))?.slice('--image-base='.length) ||
  process.env.SITE_URL ||
  'https://publicvinylradio.com'
).replace(/\/$/, '')

// Local .webp path + its public URL for a catalog image ("/images/shop/x/y.png").
const webpFor = (imagePath: string) => {
  const rel = imagePath.replace(/\.(png|jpe?g)$/i, '.webp')
  return { file: join(STATIC_DIR, rel.replace(/^\//, '')), url: imageBase + rel }
}

// Images to show on Checkout: only those whose .webp exists locally — a proxy
// for "generated, and therefore present at that URL once the site is deployed".
const productImages = (product: Product) =>
  product.images.slice(0, MAX_STRIPE_IMAGES).map(webpFor).filter(i => existsSync(i.file))

// Fingerprint of the image bytes + base URL, stamped on the product so re-syncs
// only touch images when something actually changed.
const imageHash = (images: { file: string }[]) => {
  const h = createHash('sha256')
  h.update(imageBase)
  for (const i of images) h.update(readFileSync(i.file))
  return h.digest('hex').slice(0, 16)
}

// A "sync unit" is one Stripe Product + one Price. A plain product is a single
// unit; a product with variants becomes one unit per variant, each its own
// Stripe Product named "<product> — <variant>" so the variant (e.g. size) shows
// on the Checkout page. `key` (the price lookup key) is the stable identity.
type SyncUnit = {
  key: string
  amount: number
  name: string
  variant?: string
}

const syncUnits = (product: Product): SyncUnit[] => {
  const amount = cents(product.price)
  if (product.variants?.length) {
    return product.variants.map(v => ({
      key: v.priceLookupKey,
      amount,
      name: `${product.name} — ${v.label}`,
      variant: v.label,
    }))
  }
  if (product.priceLookupKey) {
    return [{ key: product.priceLookupKey, amount, name: product.name }]
  }
  return []
}

// Resolve the Stripe product a unit maps to. Prefer our pvr_key metadata stamp;
// otherwise adopt a product that already owns this lookup key — but only if that
// product isn't already claimed by a *different* unit (as happens when an older
// single product held several variant prices). In that case return null so a
// fresh per-variant product gets created and the price moved onto it.
async function findUnitProduct(unit: SyncUnit): Promise<Stripe.Product | null> {
  const byMeta = await stripe.products.search({
    query: `metadata['pvr_key']:'${unit.key}'`,
    limit: 1,
  })
  if (byMeta.data[0]) return byMeta.data[0]

  const prices = await stripe.prices.list({ lookup_keys: [unit.key], active: true, limit: 1 })
  const owningProductId = prices.data[0]?.product
  if (typeof owningProductId === 'string') {
    const owner = await stripe.products.retrieve(owningProductId)
    const claimedBy = owner.metadata?.pvr_key
    if (!claimedBy || claimedBy === unit.key) return owner
  }
  return null
}

type ProductContext = {
  pvrId: string
  description: string
  hash: string
  imageUrls: string[]
}

// Create or update, tolerating an unreachable image (e.g. a product not yet
// deployed to the image host). On an image error we retry without images and
// leave image_hash unstamped, so a later sync (once deployed) re-attaches them.
async function commitProduct(
  existing: Stripe.Product | null,
  desired: Stripe.ProductUpdateParams
): Promise<Stripe.Product> {
  const run = () =>
    existing
      ? stripe.products.update(existing.id, desired)
      : stripe.products.create({ ...desired } as Stripe.ProductCreateParams)
  try {
    return await run()
  } catch (err: any) {
    if (desired.images && /image|url|reach|download|2\s?mb|file size/i.test(err.message)) {
      console.log(`    ⚠ could not attach images (${err.message}) — syncing without them for now`)
      delete desired.images
      ;(desired.metadata as Record<string, string>).image_hash = 'pending'
      return await run()
    }
    throw err
  }
}

async function ensureUnitProduct(unit: SyncUnit, ctx: ProductContext): Promise<Stripe.Product> {
  const existing = await findUnitProduct(unit)

  const desired: Stripe.ProductUpdateParams = {
    name: unit.name,
    description: ctx.description,
    active: true,
    metadata: {
      pvr_id: ctx.pvrId,
      pvr_key: unit.key,
      image_hash: ctx.hash,
      ...(unit.variant ? { pvr_variant: unit.variant } : {}),
    },
  }

  const imagesChanged = !existing || existing.metadata?.image_hash !== ctx.hash
  if (imagesChanged && ctx.imageUrls.length) desired.images = ctx.imageUrls

  if (!existing) {
    console.log(`  + create product "${unit.name}"`)
    if (dryRun) return { id: `dry_${unit.key}` } as Stripe.Product
    return commitProduct(null, desired)
  }

  const drifted =
    existing.name !== desired.name ||
    existing.description !== desired.description ||
    existing.metadata?.pvr_id !== ctx.pvrId ||
    existing.metadata?.pvr_key !== unit.key ||
    existing.metadata?.image_hash !== ctx.hash ||
    !existing.active
  if (drifted) {
    console.log(`  ~ update product "${unit.name}"`)
    if (!dryRun) await commitProduct(existing, desired)
  } else {
    console.log(`  = product "${unit.name}" up to date`)
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
    const units = syncUnits(product)
    if (units.length === 0) {
      console.log(`  ! no priceLookupKey or variants — skipping`)
      process.exitCode = 1
      continue
    }

    const images = productImages(product)
    const missing = product.images.length - images.length
    if (missing > 0) {
      console.log(`  ⚠ ${missing} image(s) have no local .webp — run "npm run shop:images" first`)
    }
    const ctx: ProductContext = {
      pvrId: product.id,
      description: product.description,
      hash: imageHash(images),
      imageUrls: images.map(i => i.url),
    }

    for (const unit of units) {
      const stripeProduct = await ensureUnitProduct(unit, ctx)
      await ensurePrice(stripeProduct.id, unit.key, unit.amount)
    }
  }
  console.log(`\n✓ Done${dryRun ? ' (dry run — nothing written)' : ''}.`)
}

main().catch(err => {
  console.error('\n✗ Sync failed:', err.message)
  process.exit(1)
})
