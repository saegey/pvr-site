import React, { useEffect, useState } from 'react'
import { graphql, Link } from 'gatsby'
import SEO from '../components/seo'
import type { PublicEvent } from '../data/public-events'

type RsvpSummary = {
  seatsTaken: number
  guests: { name: string; plusOnes: number }[]
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const PublicEventTemplate: React.FC<{ pageContext: { event: PublicEvent } }> = ({
  pageContext,
}) => {
  const event = pageContext.event
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bringGuest, setBringGuest] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<RsvpSummary | null>(null)

  useEffect(() => {
    fetch(`/api/rsvp?slug=${encodeURIComponent(event.slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setSummary(data))
      .catch(() => undefined)
  }, [event.slug])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: event.slug,
          name,
          email,
          phone,
          plusOnes: bringGuest ? 1 : 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setSummary(data.summary)
      setConfirmed(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SEO
        title={`${event.title} · Public Vinyl Radio`}
        description={event.description}
        url={`https://publicvinylradio.com/events/${event.slug}`}
      />
      <main className="min-h-screen bg-bg text-fg">
        <div className="max-w-[960px] mx-auto px-4 md:px-12 py-8 md:py-16">
          <Link
            to="/events"
            className="inline-block text-xs tracking-[1px] uppercase text-fg/50 hover:text-fg transition-colors"
          >
            ← All events
          </Link>

          <section className="mt-8 md:border md:border-fg/15">
            <div className="bg-black px-5 py-7 md:px-12 md:py-12">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex h-16 flex-1 items-center justify-center border border-white/20 px-4 md:h-24">
                  <img
                    src="/images/pvr-logo-white.svg"
                    alt="Public Vinyl Radio"
                    className="max-h-10 w-full object-contain md:max-h-14"
                  />
                </div>
                {event.partnerLogo && (
                  <>
                    <span className="text-white/40 text-lg">×</span>
                    <div className="flex h-16 flex-1 items-center justify-center border border-white/20 px-4 md:h-24">
                      <img
                        src={event.partnerLogo}
                        alt={event.partnerLogoAlt ?? 'Partner logo'}
                        className="max-h-10 w-full object-contain md:max-h-14"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="px-5 py-7 md:px-12 md:py-12">
              <p className="text-xs tracking-[2px] uppercase text-fg/50">
                Public event · {event.date} · {event.time}
              </p>
              <h1
                className="mt-4 text-fg leading-[0.95]"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 8vw, 82px)' }}
              >
                {event.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-fg/75 md:text-lg">
                {event.description}
              </p>

              <div className="mt-10 border-t border-fg/12 pt-6 text-sm leading-relaxed text-fg/60">
                <p className="text-fg">{event.venue}</p>
                <p>{event.location}</p>
                <p className="mt-3">{event.time} · with {event.djs.join(', ')}</p>
              </div>

              <div className="mt-10 border-t border-fg/12 pt-8">
                {event.rsvpEnabled ? confirmed ? (
                  <div className="border border-fg/16 p-6">
                    <p className="text-fg" style={{ fontFamily: 'var(--font-display)', fontSize: '22px' }}>
                      You’re on the list.
                    </p>
                    <p className="mt-2 text-sm text-fg/60">See you August 8 at Sound Break Bike House.</p>
                  </div>
                ) : (
                  <form onSubmit={submit} className="max-w-xl border border-fg/16 p-6">
                    <p className="text-xs tracking-[1px] uppercase text-fg/45 mb-5">RSVP · free</p>
                    <div className="flex flex-col gap-3">
                      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-transparent border border-fg/16 px-4 py-3 text-base md:text-sm text-fg placeholder:text-fg/30 outline-none focus:border-fg/40" />
                      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="w-full bg-transparent border border-fg/16 px-4 py-3 text-base md:text-sm text-fg placeholder:text-fg/30 outline-none focus:border-fg/40" />
                      <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="w-full bg-transparent border border-fg/16 px-4 py-3 text-base md:text-sm text-fg placeholder:text-fg/30 outline-none focus:border-fg/40" />
                    </div>
                    {event.maxPlusOnes > 0 && (
                      <label className="mt-4 flex items-center gap-3 cursor-pointer text-sm text-fg/60">
                        <input type="checkbox" checked={bringGuest} onChange={(e) => setBringGuest(e.target.checked)} className="w-4 h-4 accent-current" />
                        Bringing a +1
                      </label>
                    )}
                    {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
                    <button type="submit" disabled={submitting} className="mt-6 w-full py-3 text-xs tracking-[2px] uppercase border border-fg/30 text-fg hover:bg-fg hover:text-bg transition-colors disabled:opacity-40">
                      {submitting ? 'Sending…' : 'RSVP'}
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-fg/50">RSVPs are not currently available for this event.</p>
                )}
              </div>

              {summary && summary.guests.length > 0 && (
                <div className="mt-10 border-t border-fg/12 pt-8">
                  <p className="text-xs tracking-[1px] uppercase text-fg/45">
                    On the list · {summary.seatsTaken} {summary.seatsTaken === 1 ? 'person' : 'people'}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-4">
                    {summary.guests.map((guest, index) => (
                      <div key={`${guest.name}-${index}`} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border border-fg/20 bg-fg/5 flex items-center justify-center text-[11px] text-fg/70">
                          {initials(guest.name)}
                        </div>
                        <span className="text-sm text-fg/65">
                          {guest.name}
                          {guest.plusOnes > 0 && <span className="text-fg/40"> +{guest.plusOnes}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export default PublicEventTemplate

export const query = graphql`
  query PublicEventPageQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
