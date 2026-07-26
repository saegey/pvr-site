/**
 * Creates a PVR-branded order receipt / packing slip from a Stripe Checkout
 * Session or Payment Intent. The script is read-only: it never changes
 * anything in Stripe.
 *
 * Usage:
 *   npm run order:pdf:sandbox -- cs_test_...  # Checkout Session
 *   npm run order:pdf:live -- pi_... --output=./orders/my-order.pdf
 */
import { createWriteStream, existsSync, readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'
import Stripe from 'stripe'
import SVGtoPDF from 'svg-to-pdfkit'

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const environment = args.includes('--env=live') ? 'live' : 'sandbox'
const orderId = args.find(arg => arg.startsWith('--session='))?.slice('--session='.length)
  ?? args.find(arg => arg.startsWith('cs_') || arg.startsWith('pi_'))
const outputArg = args.find(arg => arg.startsWith('--output='))?.slice('--output='.length)
const overwrite = args.includes('--force')

if (!orderId) {
  console.error(
    'Missing Checkout Session or Payment Intent ID.\n' +
    'Usage: npm run order:pdf:sandbox -- cs_test_...|pi_... [--output=./custom-order.pdf]'
  )
  process.exit(1)
}

const secretVar = environment === 'live' ? 'STRIPE_SECRET_KEY_LIVE' : 'STRIPE_SECRET_KEY_SANDBOX'
const secret = process.env[secretVar] ?? process.env.STRIPE_SECRET_KEY
if (!secret) {
  console.error(`Missing ${secretVar}. Run through the matching npm command so 1Password can provide it.`)
  process.exit(1)
}
if (environment === 'live' && secret.startsWith('sk_test')) {
  console.error('--env=live was given a test key. Aborting.')
  process.exit(1)
}
if (environment === 'sandbox' && secret.startsWith('sk_live')) {
  console.error('--env=sandbox was given a live key. Aborting.')
  process.exit(1)
}

const outputPath = resolve(outputArg ?? `.generated/orders/order-${orderId}.pdf`)
if (existsSync(outputPath) && !overwrite) {
  console.error(`Refusing to overwrite ${outputPath}. Choose another --output path or add --force.`)
  process.exit(1)
}
const stripe = new Stripe(secret)
const brandFont = resolve(__dirname, '../static/fonts/ITC-Lubalin-Graph-Std-Demi.otf')
const monoFont = resolve(__dirname, '../static/fonts/JetBrainsMono-Regular.ttf')
const monoBoldFont = resolve(__dirname, '../static/fonts/JetBrainsMono-Bold.ttf')
const blackLogo = resolve(__dirname, '../src/images/press/PVR LOGO_BLK.svg')
const PAGE = { width: 612, height: 792, margin: 48 }
const INK = '#101010'
const MONO = 'mono'
const MONO_BOLD = 'mono-bold'

const money = (amount: number | null | undefined, currency = 'usd') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() })
    .format((amount ?? 0) / 100)

const text = (value: string | null | undefined) => value?.trim() || '—'

const orderReference = (session: Stripe.Checkout.Session) =>
  session.client_reference_id
  ?? session.metadata?.order_reference
  ?? `PVR-${new Date(session.created * 1000).toISOString().slice(0, 10).replaceAll('-', '')}-${session.id.slice(-6).toUpperCase()}`

const addressLines = (address: Stripe.Address | null | undefined) => {
  if (!address) return ['No shipping address collected']
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
    address.country,
  ].filter((line): line is string => Boolean(line))
}

const drawRule = (doc: PDFKit.PDFDocument, y: number) =>
  doc.moveTo(PAGE.margin, y).lineTo(PAGE.width - PAGE.margin, y).lineWidth(0.75).strokeColor(INK).stroke()

const label = (doc: PDFKit.PDFDocument, value: string, x: number, y: number, width?: number) =>
  doc.font(MONO).fontSize(7).fillColor(INK).text(value.toUpperCase(), x, y, { width, characterSpacing: 0.8 })

const body = (doc: PDFKit.PDFDocument, value: string, x: number, y: number, width?: number, size = 9) =>
  doc.font(MONO).fontSize(size).fillColor(INK).text(value, x, y, { width, lineGap: 3 })

async function main() {
  const checkoutSessionId = orderId!.startsWith('pi_')
    ? (await stripe.checkout.sessions.list({ payment_intent: orderId!, limit: 1 })).data[0]?.id
    : orderId!
  if (!checkoutSessionId) {
    throw new Error(`No Checkout Session was found for Payment Intent ${orderId}.`)
  }
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId)
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ['data.price.product'],
  })
  const outputDirectory = dirname(outputPath)
  await mkdir(outputDirectory, { recursive: true })

  const doc = new PDFDocument({ size: [PAGE.width, PAGE.height], margin: 0, info: {
    Title: `Public Vinyl Radio order ${session.id}`,
    Author: 'Public Vinyl Radio',
    Subject: 'Order receipt',
  } })
  doc.registerFont('brand', existsSync(brandFont) ? brandFont : 'Times-Bold')
  doc.registerFont(MONO, monoFont)
  doc.registerFont(MONO_BOLD, monoBoldFont)
  const output = createWriteStream(outputPath)
  doc.pipe(output)

  doc.fillColor(INK)
  SVGtoPDF(doc, readFileSync(blackLogo, 'utf8'), PAGE.margin, 42, {
    width: 64,
    height: 84,
    preserveAspectRatio: 'xMinYMin meet',
  })
  doc.font('brand').fontSize(19).fillColor(INK).text('RECEIPT', 360, 53, { width: 204, align: 'right' })
  label(doc, `Order ${orderReference(session)}`, 360, 83, 204)
  label(doc, `Placed ${new Date(session.created * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 360, 98, 204)
  drawRule(doc, 145)

  const shipping = session.collected_information?.shipping_details ?? session.customer_details
  label(doc, 'Ship to', PAGE.margin, 164)
  body(doc, text(shipping?.name), PAGE.margin, 178, 220, 10)
  let addressY = 194
  for (const line of addressLines(shipping?.address)) {
    body(doc, line, PAGE.margin, addressY, 220)
    addressY += 14
  }
  label(doc, 'Contact', 312, 164)
  body(doc, text(session.customer_details?.email), 312, 178, 252)
  body(doc, text(session.customer_details?.phone), 312, 194, 252)
  label(doc, 'Payment status', 312, 221)
  body(doc, session.payment_status.replace(/_/g, ' ').toUpperCase(), 312, 235, 252)

  const tableTop = 284
  drawRule(doc, tableTop)
  label(doc, 'Item', PAGE.margin, tableTop + 12)
  label(doc, 'Qty', 410, tableTop + 12, 40)
  label(doc, 'Amount', 456, tableTop + 12, 108)
  drawRule(doc, tableTop + 28)

  let y = tableTop + 40
  for (const item of lineItems.data) {
    const name = item.description || 'Item'
    doc.font(MONO).fontSize(9).fillColor(INK)
    const itemHeight = Math.max(doc.heightOfString(name, { width: 344, lineGap: 3 }), 14)
    if (y + itemHeight + 16 > 610) {
      doc.addPage({ size: [PAGE.width, PAGE.height], margin: 0 })
      doc.font('brand').fontSize(17).fillColor(INK).text('PUBLIC VINYL RADIO', PAGE.margin, 40)
      drawRule(doc, 72)
      y = 91
    }
    body(doc, name, PAGE.margin, y, 344)
    body(doc, String(item.quantity ?? 0), 410, y, 40)
    body(doc, money(item.amount_total, session.currency ?? 'usd'), 456, y, 108)
    y += itemHeight + 12
  }
  drawRule(doc, y + 2)

  const totalX = 386
  let totalY = y + 16
  const amount = (title: string, value: number | null | undefined, emphasized = false) => {
    if (emphasized) {
      doc.font(MONO_BOLD).fontSize(9).fillColor(INK).text(title, totalX, totalY, { width: 88 })
    } else {
      label(doc, title, totalX, totalY, 88)
    }
    doc.font(emphasized ? MONO_BOLD : MONO).fontSize(9).fillColor(INK)
      .text(money(value, session.currency ?? 'usd'), 456, totalY, { width: 108 })
    totalY += 17
  }
  amount('Subtotal', session.amount_subtotal)
  if (session.total_details?.amount_discount) amount('Discount', -session.total_details.amount_discount)
  if (session.shipping_cost?.amount_total) amount('Shipping', session.shipping_cost.amount_total)
  if (session.total_details?.amount_tax) amount('Tax', session.total_details.amount_tax)
  drawRule(doc, totalY + 6)
  totalY += 18
  amount('Total', session.amount_total, true)

  const footerY = Math.max(totalY + 22, 684)
  drawRule(doc, footerY)
  doc.font('brand').fontSize(14).fillColor(INK).text('THANK YOU FOR SUPPORTING PUBLIC VINYL RADIO.', PAGE.margin, footerY + 17, { width: 516, align: 'center' })
  doc.font(MONO).fontSize(7).fillColor(INK).text('PUBLICVINYLRADIO.COM', PAGE.margin, footerY + 45, { width: 516, align: 'center', characterSpacing: 0.8 })
  const finished = new Promise<void>((resolveWrite, rejectWrite) => {
    output.on('finish', resolveWrite)
    output.on('error', rejectWrite)
  })
  doc.end()
  await finished
  console.log(`Created ${outputPath}`)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
