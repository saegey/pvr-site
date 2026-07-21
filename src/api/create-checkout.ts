import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'
import Stripe from 'stripe'
import { PRODUCTS } from '../data/products'

type CartItem = {
  stripePrice: string
  quantity: number
}

const FREE_SHIPPING_THRESHOLD = 7_500 // $75.00, in cents
const FIRST_ITEM_SHIPPING = 500 // $5.00, in cents
const ADDITIONAL_ITEM_SHIPPING = 100 // $1.00, in cents
const ALLOWED_PRICE_IDS = new Set(
  PRODUCTS.flatMap(product => [
    product.stripePrice,
    ...(product.variants?.map(variant => variant.stripePrice) ?? []),
  ]).filter((priceId): priceId is string => Boolean(priceId))
)

export default async function handler(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

  try {
    const { items }: { items: CartItem[] } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    if (items.some(item =>
      !item?.stripePrice?.startsWith('price_') ||
      !ALLOWED_PRICE_IDS.has(item.stripePrice) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    )) {
      return res.status(400).json({ error: 'Cart contains an invalid item' })
    }

    const baseUrl = process.env.NETLIFY_DEV === 'true'
      ? 'http://localhost:8888'
      : (process.env.DEPLOY_PRIME_URL || process.env.URL || 'http://localhost:8888')

    // Retrieve prices from Stripe rather than trusting price or product details
    // sent by the browser.
    const prices = await Promise.all(
      items.map(item => stripe.prices.retrieve(item.stripePrice))
    )

    if (prices.some(price => !price.active || price.currency !== 'usd' || price.unit_amount === null)) {
      return res.status(400).json({ error: 'Cart contains an unavailable item' })
    }

    const itemCount = items.reduce((count, item) => count + item.quantity, 0)
    const subtotal = prices.reduce(
      (total, price, index) => total + (price.unit_amount as number) * items[index].quantity,
      0
    )
    const shippingAmount = subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : FIRST_ITEM_SHIPPING + (itemCount - 1) * ADDITIONAL_ITEM_SHIPPING

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shippingAmount, currency: 'usd' },
            display_name: shippingAmount === 0 ? 'Free shipping' : 'Shipping',
          },
        },
      ],
      line_items: items.map(item => ({
        quantity: item.quantity,
        price: item.stripePrice,
      })),
      success_url: `${baseUrl}/shop?success=true`,
      cancel_url: `${baseUrl}/shop`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
