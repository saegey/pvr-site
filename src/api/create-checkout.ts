import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'
import Stripe from 'stripe'

type CartItem = {
  stripePrice: string
  quantity: number
  productName: string
  variantLabel?: string
  price: number // dollars
  image?: string // path like /images/shop/pvr-tee/front.jpg
}

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

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    const baseUrl = process.env.URL || 'http://localhost:8000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      line_items: items.map(item => ({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.variantLabel
              ? `${item.productName} — ${item.variantLabel}`
              : item.productName,
            ...(item.image && { images: [`${baseUrl}${item.image}`] }),
          },
        },
      })),
      success_url: `${baseUrl}/shop?success=true`,
      cancel_url: `${baseUrl}/shop`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
