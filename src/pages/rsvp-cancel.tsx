import React, { useEffect, useState } from 'react'
import { Link } from 'gatsby'
import SEO from '../components/seo'

const RsvpCancelPage = () => {
  const [slug, setSlug] = useState('')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSlug(params.get('slug') || '')
    setToken(params.get('token') || '')
  }, [])

  const cancel = async () => {
    if (!slug || !token) return
    setLoading(true)
    try {
      const response = await fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      setMessage(response.ok ? 'Your RSVP has been cancelled.' : (data.error || 'Unable to cancel your RSVP.'))
    } catch {
      setMessage('Unable to cancel your RSVP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validLink = Boolean(slug && token)
  return (
    <main className="max-w-[540px] mx-auto px-4 md:px-12 pt-16 pb-24">
      <p className="text-xs tracking-[2px] uppercase text-fg/55 mb-6">Event RSVP</p>
      <h1 className="text-fg leading-tight mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 48px)' }}>
        Cancel RSVP
      </h1>
      {message ? <p className="text-sm text-fg/60 leading-relaxed">{message}</p> : validLink ? (
        <>
          <p className="text-sm text-fg/60 leading-relaxed mb-8">This will release your place so someone else can attend.</p>
          <button onClick={cancel} disabled={loading} className="px-5 py-3 text-xs tracking-[1px] uppercase border border-fg/30 text-fg/70 hover:border-fg hover:text-fg transition-colors disabled:opacity-40">
            {loading ? 'Cancelling…' : 'Cancel my RSVP'}
          </button>
        </>
      ) : <p className="text-sm text-fg/60 leading-relaxed">This cancellation link is invalid or incomplete.</p>}
      <Link to="/events" className="inline-block mt-10 text-xs tracking-[1px] uppercase text-fg/55 hover:text-fg transition-colors">← All events</Link>
    </main>
  )
}

export default RsvpCancelPage

export const Head = () => <SEO title="Cancel RSVP · Public Vinyl Radio" />
