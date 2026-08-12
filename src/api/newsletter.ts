import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'
import { Resend } from 'resend'

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export default async function handler(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const email = String(req.body?.email || '').trim().toLowerCase()
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID
  if (!apiKey || !segmentId) {
    console.error('[newsletter] Missing RESEND_API_KEY or RESEND_NEWSLETTER_SEGMENT_ID')
    return res.status(503).json({ error: 'Newsletter signup is temporarily unavailable.' })
  }

  try {
    const result = await new Resend(apiKey).contacts.create({
      email,
      segments: [{ id: segmentId }],
    })

    if (result.error) {
      // Resend returns an error for duplicate contacts; do not expose account
      // membership to visitors, and treat the requested end state as complete.
      if (result.error.name === 'validation_error') {
        return res.status(200).json({ message: 'You’re already on the list.' })
      }
      console.error('[newsletter] Resend contact creation failed:', result.error)
      return res.status(502).json({ error: 'Unable to subscribe right now. Please try again.' })
    }

    return res.status(200).json({ message: 'You’re on the list. See you soon.' })
  } catch (error) {
    console.error('[newsletter] Unexpected signup error:', error)
    return res.status(502).json({ error: 'Unable to subscribe right now. Please try again.' })
  }
}
