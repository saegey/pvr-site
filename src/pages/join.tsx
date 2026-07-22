import React, { useState } from 'react'
import { graphql } from 'gatsby'
import SEO from '../components/seo'

const NewsletterForm = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('https://api.buttondown.email/v1/subscribers', {
        method: 'POST',
        headers: {
          Authorization: `Token 95c23da4-3415-4cde-a755-36a02cd53d4d`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_address: email }),
      })
      const data = await response.json()
      setMessage(data.detail || 'Successfully subscribed!')
    } catch {
      setMessage('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="bg-transparent border border-fg/20 px-4 py-3 text-sm text-fg placeholder:text-fg/30 outline-none focus:border-fg/50 transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="py-3 text-xs tracking-[2px] uppercase border border-fg/30 text-fg/70 hover:border-fg/60 hover:text-fg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Subscribing…' : 'Subscribe'}
      </button>
      {message && <p className="text-xs text-fg/50">{message}</p>}
    </form>
  )
}

const JoinPage = () => (
  <>
    <SEO
      title="Join · Public Vinyl Radio"
      description="Subscribe to the Public Vinyl Radio newsletter."
      url="https://publicvinylradio.com/join"
    />
    <div className="max-w-[540px] mx-auto px-4 md:px-12 pt-16 pb-24">
      <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-6">Newsletter</p>
      <h1
        className="text-fg leading-tight mb-4"
        style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 48px)', letterSpacing: '-0.5px' }}
      >
        Join
      </h1>
      <p className="text-sm text-fg/55 leading-[1.7] mb-10">
        Subscribe for the latest sets, events, and updates from Public Vinyl Radio.
      </p>
      <NewsletterForm />
    </div>
  </>
)

export default JoinPage

export const query = graphql`
  query JoinPageQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
