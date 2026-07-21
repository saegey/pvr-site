const Stripe = require('stripe')

const FREE_SHIPPING_THRESHOLD = 7500
const FIRST_ITEM_SHIPPING = 500
const ADDITIONAL_ITEM_SHIPPING = 100
// Keep this list in sync with src/data/products.ts. The Gatsby API route is the
// storefront endpoint; this covers the legacy Netlify function endpoint too.
const ALLOWED_PRICE_LOOKUP_KEYS = new Set([
  'pvr-decal-solid',
  'pvr-decal-cutout',
  'pvr-coaster',
  'pvr-cyanotype-print',
])

exports.handler = async ({ body }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const { items } = JSON.parse(body)

    if (!Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Cart is empty' }),
      }
    }

    if (items.some(item =>
      !item?.priceLookupKey ||
      !ALLOWED_PRICE_LOOKUP_KEYS.has(item.priceLookupKey) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    )) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Cart contains an invalid item' }),
      }
    }

    const baseUrl = process.env.URL || 'http://localhost:8888'
    const lookupKeys = [...new Set(items.map(item => item.priceLookupKey))]
    const prices = await stripe.prices.list({ lookup_keys: lookupKeys, active: true, limit: 100 })
    const pricesByLookupKey = new Map(
      prices.data.map(price => [price.lookup_key, price])
    )
    const resolvedPrices = items.map(item => pricesByLookupKey.get(item.priceLookupKey))

    if (resolvedPrices.some(price => !price || price.currency !== 'usd' || price.unit_amount === null)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Cart contains an unavailable item' }),
      }
    }

    const itemCount = items.reduce((count, item) => count + item.quantity, 0)
    const subtotal = resolvedPrices.reduce(
      (total, price, index) => total + price.unit_amount * items[index].quantity,
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
        price: pricesByLookupKey.get(item.priceLookupKey).id,
        quantity: item.quantity,
      })),
      success_url: `${baseUrl}/shop?success=true`,
      cancel_url: `${baseUrl}/shop`,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
