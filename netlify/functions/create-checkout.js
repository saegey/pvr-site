const Stripe = require('stripe')

exports.handler = async ({ body }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const { items } = JSON.parse(body)

    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Cart is empty' }),
      }
    }

    const baseUrl = process.env.URL || 'http://localhost:8888'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items.map(item => ({
        price: item.stripePrice,
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
