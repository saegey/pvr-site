/** List recently completed Checkout orders and their fulfillment status. */
import { environmentFromArgs, formatMoney, orderReference, stripeForEnvironment } from './order-fulfillment.mts'

const args = process.argv.slice(2)
const limitArg = args.find(arg => arg.startsWith('--limit='))?.slice('--limit='.length)
const limit = Math.min(100, Math.max(1, Number.parseInt(limitArg ?? '25', 10) || 25))

async function main() {
  const stripe = stripeForEnvironment(environmentFromArgs(args))
  const sessions = await stripe.checkout.sessions.list({ limit, status: 'complete' })
  const rows = sessions.data.filter(session => session.payment_status === 'paid').map(session => ({
    order: orderReference(session),
    fulfillment: session.metadata?.fulfillment_status ?? 'paid',
    customer: session.customer_details?.name ?? '—',
    total: formatMoney(session.amount_total, session.currency),
    placed: new Date(session.created * 1000).toISOString().slice(0, 10),
    tracking: session.metadata?.tracking_number ?? '—',
  }))
  console.table(rows)
  if (sessions.has_more) console.log(`Showing the newest ${limit} completed orders. Use --limit=100 for more.`)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
