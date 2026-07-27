/** Mark an order as shipped in Stripe metadata. */
import { Resend } from 'resend'
import { environmentFromArgs, findOrder, orderReference, stripeForEnvironment } from './order-fulfillment.mts'

const args = process.argv.slice(2)
const identifier = args.find(arg => !arg.startsWith('--'))
const carrier = args.find(arg => arg.startsWith('--carrier='))?.slice('--carrier='.length)
const tracking = args.find(arg => arg.startsWith('--tracking='))?.slice('--tracking='.length)
const resendEmail = args.includes('--resend-email')
const sendEmail = !args.includes('--no-email')

if (!identifier || !carrier || !tracking) {
  console.error('Usage: npm run order:ship:sandbox -- PVR-… --carrier=USPS --tracking=9400…')
  process.exit(1)
}

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[character] as string))

const trackingUrl = (carrierName: string, trackingNumber: string) => {
  const carrierKey = carrierName.trim().toLowerCase()
  const encoded = encodeURIComponent(trackingNumber)
  if (carrierKey.includes('usps')) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`
  if (carrierKey.includes('ups')) return `https://www.ups.com/track?tracknum=${encoded}`
  if (carrierKey.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${encoded}`
  if (carrierKey.includes('dhl')) return `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${encoded}`
  return null
}

const shipmentEmailHtml = ({
  customerName,
  reference,
  carrier,
  tracking,
  trackUrl,
}: {
  customerName: string
  reference: string
  carrier: string
  tracking: string
  trackUrl: string | null
}) => {
  const siteUrl = (process.env.SITE_URL || 'https://publicvinylradio.com').replace(/\/$/, '')
  const trackingContent = trackUrl
    ? `<a href="${trackUrl}" style="display:inline-block;background:#111111;border-radius:2px;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.02em;padding:14px 22px;text-decoration:none;">TRACK YOUR PACKAGE</a>`
    : `<p style="color:#111111;font-family:Arial,sans-serif;font-size:16px;line-height:24px;margin:0;">Tracking number: <strong>${escapeHtml(tracking)}</strong></p>`

  return `<!doctype html>
<html lang="en">
  <body style="background:#ffffff;color:#111111;margin:0;padding:0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;">
      <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
          <tr><td style="background:#111111;padding:24px 28px;">
            <img src="${siteUrl}/images/pvr-logo-white.svg" width="190" alt="Public Vinyl Radio" style="display:block;height:auto;max-width:100%;" />
          </td></tr>
          <tr><td style="border:1px solid #111111;border-top:0;padding:40px 28px 32px;">
            <p style="color:#111111;font-family:Arial,sans-serif;font-size:14px;letter-spacing:0.12em;margin:0 0 12px;text-transform:uppercase;">Order update</p>
            <h1 style="color:#111111;font-family:Arial,sans-serif;font-size:30px;line-height:36px;margin:0 0 20px;">Your order has shipped.</h1>
            <p style="color:#111111;font-family:Arial,sans-serif;font-size:16px;line-height:24px;margin:0 0 28px;">Hi ${escapeHtml(customerName)},<br />Your Public Vinyl Radio order is on its way.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #d8d8d8;margin:0 0 28px;">
              <tr><td style="padding:18px 20px;">
                <p style="color:#555555;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.12em;margin:0 0 6px;text-transform:uppercase;">Order</p>
                <p style="color:#111111;font-family:Arial,sans-serif;font-size:16px;font-weight:700;margin:0 0 16px;">${escapeHtml(reference)}</p>
                <p style="color:#555555;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.12em;margin:0 0 6px;text-transform:uppercase;">Shipping with</p>
                <p style="color:#111111;font-family:Arial,sans-serif;font-size:16px;margin:0;">${escapeHtml(carrier)}</p>
              </td></tr>
            </table>
            ${trackingContent}
          </td></tr>
          <tr><td style="padding:22px 4px 0;">
            <p style="color:#555555;font-family:Arial,sans-serif;font-size:13px;line-height:20px;margin:0;text-align:center;">Questions about your order? Reply to this email.<br /><a href="${siteUrl}" style="color:#111111;">publicvinylradio.com</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

async function main() {
  if (resendEmail && !sendEmail) throw new Error('--resend-email and --no-email cannot be used together.')
  const stripe = stripeForEnvironment(environmentFromArgs(args))
  const session = await findOrder(stripe, identifier!)
  if (session.payment_status !== 'paid') {
    throw new Error(`${orderReference(session)} has payment status ${session.payment_status}; it cannot be marked shipped.`)
  }
  const recipient = session.customer_details?.email
  const resendApiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.ORDER_EMAIL_FROM
  const emailReplyTo = process.env.ORDER_EMAIL_REPLY_TO
  if (sendEmail) {
    if (!recipient) throw new Error(`${orderReference(session)} has no customer email address; shipment email was not sent.`)
    if (!resendApiKey || !emailFrom || !emailReplyTo) {
      throw new Error('Missing RESEND_API_KEY, ORDER_EMAIL_FROM, or ORDER_EMAIL_REPLY_TO. Shipment status was not changed.')
    }
    if (session.metadata?.shipment_email_sent_at && !resendEmail) {
      throw new Error(`A shipment email was already sent for ${orderReference(session)}. Add --resend-email to deliberately send another.`)
    }
  }

  const shippedAt = new Date().toISOString()
  await stripe.checkout.sessions.update(session.id, {
    metadata: {
      ...session.metadata,
      fulfillment_status: 'shipped',
      shipped_at: shippedAt,
      carrier: carrier!,
      tracking_number: tracking!,
    },
  })
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
  if (paymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        ...paymentIntent.metadata,
        order_reference: orderReference(session),
        fulfillment_status: 'shipped',
        shipped_at: shippedAt,
        carrier: carrier!,
        tracking_number: tracking!,
      },
    })
  }

  if (!sendEmail) {
    console.log(`Marked ${orderReference(session)} as shipped without sending an email.`)
    return
  }

  const customerName = session.customer_details?.name?.trim() || 'there'
  const trackUrl = trackingUrl(carrier!, tracking!)
  const reference = orderReference(session)
  const email = await new Resend(resendApiKey!).emails.send({
    from: emailFrom!,
    replyTo: emailReplyTo!,
    to: recipient!,
    subject: `Your Public Vinyl Radio order ${reference} has shipped`,
    html: shipmentEmailHtml({ customerName, reference, carrier: carrier!, tracking: tracking!, trackUrl }),
    text: `Hi ${customerName},\n\nYour Public Vinyl Radio order ${reference} has shipped via ${carrier}.\nTracking number: ${tracking}${trackUrl ? `\nTrack your package: ${trackUrl}` : ''}\n\nThanks for supporting Public Vinyl Radio.`,
  }, {
    idempotencyKey: resendEmail
      ? `shipment-resend/${session.id}/${Date.now()}`
      : `shipment/${session.id}/${tracking}`,
  })
  if (email.error) throw new Error(`Shipment was marked shipped, but Resend could not send the email: ${email.error.message}`)

  const emailMetadata = {
    shipment_email_id: email.data?.id ?? 'sent',
    shipment_email_sent_at: new Date().toISOString(),
  }
  await stripe.checkout.sessions.update(session.id, { metadata: { ...session.metadata, ...emailMetadata } })
  if (paymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    await stripe.paymentIntents.update(paymentIntentId, { metadata: { ...paymentIntent.metadata, ...emailMetadata } })
  }
  console.log(`Marked ${orderReference(session)} as shipped and emailed ${recipient}.`)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
