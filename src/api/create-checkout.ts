import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'
import Stripe from 'stripe'
import { PRODUCTS } from '../data/products'

type CartItem = {
  priceLookupKey: string
  quantity: number
}

const FREE_SHIPPING_THRESHOLD = 7_500 // $75.00, in cents
const FIRST_ITEM_SHIPPING = 500 // $5.00, in cents
const ADDITIONAL_ITEM_SHIPPING = 100 // $1.00, in cents
const ALLOWED_PRICE_LOOKUP_KEYS = new Set(
  PRODUCTS.flatMap(product => [
    product.priceLookupKey,
    ...(product.variants?.map(variant => variant.priceLookupKey) ?? []),
  ]).filter((lookupKey): lookupKey is string => Boolean(lookupKey))
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
      !item?.priceLookupKey ||
      !ALLOWED_PRICE_LOOKUP_KEYS.has(item.priceLookupKey) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    )) {
      return res.status(400).json({ error: 'Cart contains an invalid item' })
    }

    const baseUrl = process.env.NETLIFY_DEV === 'true'
      ? 'http://localhost:8888'
      : (process.env.DEPLOY_PRIME_URL || process.env.URL || 'http://localhost:8888')

    // Resolve catalog keys in the current Stripe environment. This makes the
    // same catalog work with live and sandbox Price IDs.
    const lookupKeys = [...new Set(items.map(item => item.priceLookupKey))]
    const prices = await stripe.prices.list({ lookup_keys: lookupKeys, active: true, limit: 100 })
    const pricesByLookupKey = new Map(
      prices.data.map(price => [price.lookup_key, price])
    )
    const resolvedPrices = items.map(item => pricesByLookupKey.get(item.priceLookupKey))

    if (resolvedPrices.some(price => !price || price.currency !== 'usd' || price.unit_amount === null)) {
      return res.status(400).json({ error: 'Cart contains an unavailable item' })
    }

    const itemCount = items.reduce((count, item) => count + item.quantity, 0)
    const subtotal = resolvedPrices.reduce(
      (total, price, index) => total + (price!.unit_amount as number) * items[index].quantity,
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
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Local pickup — Seattle',
          },
        },
      ],
      custom_text: {
        shipping_address: {
          message: 'Choose Local pickup below if you would prefer to collect your order in Seattle. We will contact you to arrange pickup.',
        },
      },
      line_items: items.map(item => ({
        quantity: item.quantity,
        price: pricesByLookupKey.get(item.priceLookupKey)!.id,
      })),
      success_url: `${baseUrl}/shop?success=true`,
      cancel_url: `${baseUrl}/shop`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
