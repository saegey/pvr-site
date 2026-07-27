import Stripe from 'stripe'

export type OrderEnvironment = 'sandbox' | 'live'

export const environmentFromArgs = (args: string[]): OrderEnvironment =>
  args.includes('--env=live') ? 'live' : 'sandbox'

export const stripeForEnvironment = (environment: OrderEnvironment) => {
  const secretVar = environment === 'live' ? 'STRIPE_SECRET_KEY_LIVE' : 'STRIPE_SECRET_KEY_SANDBOX'
  const secret = process.env[secretVar] ?? process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error(`Missing ${secretVar}. Run through the matching npm command so 1Password can provide it.`)
  if (environment === 'live' && secret.startsWith('sk_test')) throw new Error('--env=live was given a test key. Aborting.')
  if (environment === 'sandbox' && secret.startsWith('sk_live')) throw new Error('--env=sandbox was given a live key. Aborting.')
  return new Stripe(secret)
}

export const orderReference = (session: Stripe.Checkout.Session) =>
  session.client_reference_id
  ?? session.metadata?.order_reference
  ?? `PVR-${new Date(session.created * 1000).toISOString().slice(0, 10).replaceAll('-', '')}-${session.id.slice(-6).toUpperCase()}`

export const formatMoney = (amount: number | null, currency: string | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: (currency ?? 'usd').toUpperCase() })
    .format((amount ?? 0) / 100)

export async function findOrder(stripe: Stripe, identifier: string) {
  if (identifier.startsWith('cs_')) return stripe.checkout.sessions.retrieve(identifier)
  if (identifier.startsWith('pi_')) {
    const matches = await stripe.checkout.sessions.list({ payment_intent: identifier, limit: 1 })
    if (matches.data[0]) return stripe.checkout.sessions.retrieve(matches.data[0].id)
  }

  for await (const session of stripe.checkout.sessions.list({ limit: 100 })) {
    if (orderReference(session) === identifier) return session
  }
  throw new Error(`No Checkout Session found for ${identifier}. Use a PVR reference, cs_…, or pi_… ID.`)
}
