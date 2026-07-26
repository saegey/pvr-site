/**
 * shop-new.mts — interactive scaffolder for a new shop product.
 *
 * Prompts for the details, appends a formatted entry to src/data/products.ts,
 * and creates static/images/shop/<id>/ for the source images. After running,
 * drop the images in, then `npm run shop:images` and `npm run shop:sync:sandbox`.
 *
 * Usage:
 *   npm run shop:new
 */
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { PRODUCTS } from '../src/data/products.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const PRODUCTS_FILE = join(REPO_ROOT, 'src/data/products.ts')
const SHOP_DIR = join(REPO_ROOT, 'static/images/shop')

const rl = createInterface({ input, output })
const q = (s: string) => `\x1b[36m${s}\x1b[0m` // cyan prompt

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

async function ask(question: string, opts: { default?: string; required?: boolean } = {}): Promise<string> {
  const suffix = opts.default ? ` [${opts.default}]` : ''
  while (true) {
    const answer = (await rl.question(q(`${question}${suffix}: `))).trim()
    if (answer) return answer
    if (opts.default !== undefined) return opts.default
    if (!opts.required) return ''
    console.log('  (required)')
  }
}

async function askYesNo(question: string, def = false): Promise<boolean> {
  const answer = (await ask(`${question} (y/n)`, { default: def ? 'y' : 'n' })).toLowerCase()
  return answer.startsWith('y')
}

// Render one PRODUCTS entry as source text matching the file's style.
function renderEntry(p: {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  tags: string[]
  variants: { label: string; priceLookupKey: string }[]
  priceLookupKey?: string
}): string {
  const lines: string[] = ['  {']
  lines.push(`    id: ${JSON.stringify(p.id)},`)
  lines.push(`    name: ${JSON.stringify(p.name)},`)
  lines.push(`    description:`)
  lines.push(`      ${JSON.stringify(p.description)},`)
  lines.push(`    price: ${p.price},`)
  if (p.images.length) {
    lines.push(`    images: [`)
    for (const img of p.images) lines.push(`      ${JSON.stringify(img)},`)
    lines.push(`    ],`)
  } else {
    lines.push(`    images: [],`)
  }
  if (p.tags.length) lines.push(`    tags: [${p.tags.map(t => JSON.stringify(t)).join(', ')}],`)
  if (p.variants.length) {
    lines.push(`    variants: [`)
    for (const v of p.variants) {
      lines.push(`      { label: ${JSON.stringify(v.label)}, priceLookupKey: ${JSON.stringify(v.priceLookupKey)} },`)
    }
    lines.push(`    ],`)
  } else if (p.priceLookupKey) {
    lines.push(`    priceLookupKey: ${JSON.stringify(p.priceLookupKey)},`)
  }
  lines.push('  },')
  return lines.join('\n')
}

async function main() {
  console.log('\nScaffold a new shop product. Ctrl-C to bail.\n')

  const name = await ask('Product name', { required: true })
  const id = await ask('Product id (slug)', { default: slugify(name), required: true })
  if (PRODUCTS.some(p => p.id === id)) {
    console.error(`\n✗ A product with id "${id}" already exists in products.ts.`)
    rl.close()
    process.exit(1)
  }

  const description = await ask('Description', { required: true })
  const priceStr = await ask('Price in USD (e.g. 20)', { required: true })
  const price = Number(priceStr)
  if (!Number.isFinite(price) || price <= 0) {
    console.error(`\n✗ "${priceStr}" is not a valid price.`)
    rl.close()
    process.exit(1)
  }

  const tagsStr = await ask('Tags (comma-separated, optional)')
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []

  const imagesStr = await ask(
    'Image filenames you will add (comma-separated, e.g. print-1.png, print-2.png)',
  )
  const images = imagesStr
    ? imagesStr.split(',').map(f => f.trim()).filter(Boolean).map(f => `/images/shop/${id}/${f}`)
    : []

  const hasVariants = await askYesNo('Does it have variants (e.g. sizes)?', false)
  const variants: { label: string; priceLookupKey: string }[] = []
  let priceLookupKey: string | undefined
  if (hasVariants) {
    console.log('  Enter each variant label; blank line when done.')
    while (true) {
      const label = await ask('  Variant label')
      if (!label) break
      const key = `${id}--${slugify(label)}`
      variants.push({ label, priceLookupKey: key })
      console.log(`    → lookup key: ${key}`)
    }
    if (variants.length === 0) {
      console.error('\n✗ No variants entered.')
      rl.close()
      process.exit(1)
    }
  } else {
    priceLookupKey = await ask('Price lookup key', { default: id, required: true })
  }

  const entry = renderEntry({ id, name, description, price, images, tags, variants, priceLookupKey })

  // Insert before the closing `];` of the PRODUCTS array.
  const source = readFileSync(PRODUCTS_FILE, 'utf8')
  const closeIndex = source.lastIndexOf('];')
  if (closeIndex === -1) {
    console.error('\n✗ Could not find the end of the PRODUCTS array in products.ts.')
    rl.close()
    process.exit(1)
  }
  const updated = source.slice(0, closeIndex) + entry + '\n' + source.slice(closeIndex)

  console.log('\n──────── entry to add ────────')
  console.log(entry)
  console.log('──────────────────────────────\n')
  const confirm = await askYesNo('Write this to products.ts and create the image folder?', true)
  if (!confirm) {
    console.log('Aborted — nothing written.')
    rl.close()
    return
  }

  writeFileSync(PRODUCTS_FILE, updated)
  const imageDir = join(SHOP_DIR, id)
  if (!existsSync(imageDir)) mkdirSync(imageDir, { recursive: true })

  console.log(`\n✓ Added "${name}" to src/data/products.ts`)
  console.log(`✓ Created ${imageDir.replace(REPO_ROOT + '/', '')}/`)
  console.log('\nNext steps:')
  console.log(`  1. Add your source images to static/images/shop/${id}/`)
  if (images.length) {
    console.log(`     (${images.map(i => i.split('/').pop()).join(', ')})`)
  }
  console.log('  2. npm run shop:images')
  console.log('  3. npm run develop           # preview locally')
  console.log('  4. npm run shop:sync:sandbox # then shop:sync:live to promote')
  rl.close()
}

main().catch(err => {
  console.error('\n✗', err.message)
  rl.close()
  process.exit(1)
})
