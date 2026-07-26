/** Mark an order as shipped in Stripe metadata. */
import { environmentFromArgs, findOrder, orderReference, stripeForEnvironment } from './order-fulfillment.mts'

const args = process.argv.slice(2)
const identifier = args.find(arg => !arg.startsWith('--'))
const carrier = args.find(arg => arg.startsWith('--carrier='))?.slice('--carrier='.length)
const tracking = args.find(arg => arg.startsWith('--tracking='))?.slice('--tracking='.length)

if (!identifier || !carrier || !tracking) {
  console.error('Usage: npm run order:ship:sandbox -- PVR-… --carrier=USPS --tracking=9400…')
  process.exit(1)
}

async function main() {
  const stripe = stripeForEnvironment(environmentFromArgs(args))
  const session = await findOrder(stripe, identifier!)
  if (session.payment_status !== 'paid') {
    throw new Error(`${orderReference(session)} has payment status ${session.payment_status}; it cannot be marked shipped.`)
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
  console.log(`Marked ${orderReference(session)} as shipped via ${carrier} (${tracking}).`)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
