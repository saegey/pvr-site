import type { GatsbyFunctionConfig, GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'
import Stripe from 'stripe'

// Stripe signature verification requires the exact request bytes.
export const config: GatsbyFunctionConfig = {
  bodyParser: { raw: { type: 'application/json', limit: '1mb' } },
}

const FULFILLMENT_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
])

export default async function handler(
  req: GatsbyFunctionRequest<Buffer>,
  res: GatsbyFunctionResponse
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = req.headers['stripe-signature']
  if (!secret || !webhookSecret) return res.status(500).json({ error: 'Stripe webhook is not configured' })
  if (typeof signature !== 'string') return res.status(400).json({ error: 'Missing Stripe signature' })

  let event: Stripe.Event
  try {
    event = Stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
  } catch (error) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${(error as Error).message}` })
  }

  if (!FULFILLMENT_EVENTS.has(event.type)) return res.status(200).json({ received: true })

  const checkoutSession = event.data.object as Stripe.Checkout.Session
  const stripe = new Stripe(secret)
  const session = await stripe.checkout.sessions.retrieve(checkoutSession.id)
  if (session.payment_status !== 'paid') return res.status(200).json({ received: true, paymentStatus: session.payment_status })

  const metadata = session.metadata ?? {}
  const fulfillmentStatus = metadata.fulfillment_status ?? 'paid'
  const paidAt = metadata.paid_at ?? new Date().toISOString()
  await stripe.checkout.sessions.update(session.id, {
    metadata: {
      ...metadata,
      fulfillment_status: fulfillmentStatus,
      paid_at: paidAt,
    },
  })
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
  if (paymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        ...paymentIntent.metadata,
        order_reference: metadata.order_reference ?? session.client_reference_id ?? session.id,
        fulfillment_status: fulfillmentStatus,
        paid_at: paidAt,
      },
    })
  }
  return res.status(200).json({ received: true })
}
