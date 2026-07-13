import React from 'react'
import SEO from '../components/seo'

const PUBLIC_EVENTS = [
  {
    date: 'Aug 3, 2026',
    title: 'Rooftop Vinyl Sunset',
    venue: 'Phinney Beer Co.',
    location: 'Seattle',
    djs: ['Saegey', 'TOPYEN'],
    rsvpUrl: '#',
  },
  {
    date: 'Sep 12, 2026',
    title: 'Late Night Disco',
    venue: 'The Vera Project',
    location: 'Seattle',
    djs: ['Saegey', 'Ben Schauland'],
    rsvpUrl: '#',
  },
  {
    date: 'Oct 4, 2026',
    title: 'Analog Rhythms Vol. 3',
    venue: 'King Street Station',
    location: 'Seattle',
    djs: ['Saegey'],
    rsvpUrl: '#',
  },
]

const SESSION = {
  title: 'Home Listening Session Vol. 5',
  date: 'August 22, 2026',
  time: '8:00 PM',
  description:
    'An intimate evening of all-vinyl selections in a living room setting. No phones, no distractions — just the music and the people who love it.',
  capacity: 9,
  confirmed: 5,
  pending: 2,
  guests: ['JR', 'MK', 'TP', 'SG'],
}

const EventsPage = () => {
  const spotsLeft = SESSION.capacity - SESSION.confirmed - SESSION.pending
  const fillPct = Math.round((SESSION.confirmed / SESSION.capacity) * 100)

  return (
    <>
      <SEO
        title="Events · Public Vinyl Radio"
        description="Public events and private listening sessions from Public Vinyl Radio."
        url="https://publicvinylradio.com/events"
      />

      {/* ── Header band ── */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-12 pt-16 pb-12">
        <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-6">Events</p>
        <h1
          className="text-fg leading-tight mb-10"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(34px, 4.5vw, 60px)',
            letterSpacing: '-0.5px',
          }}
        >
          Out in public.<br />In the living room.
        </h1>
        <div className="border-t border-fg/12 pt-8 max-w-[640px]">
          <p className="text-sm text-fg/60 leading-[1.8]">
            We play records wherever we can — rooftops, warehouses, living rooms.
            Public shows are open to anyone. Private sessions are small, invite-only, and seriously good.
          </p>
        </div>
      </div>

      {/* ── Public Events ── */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-12 mb-20">
        <div className="flex items-baseline justify-between border-t border-b border-fg/12 py-4 mb-0">
          <span className="text-xs tracking-[2px] uppercase text-fg/55">Public Events</span>
        </div>

        {PUBLIC_EVENTS.map((event, i) => (
          <div
            key={event.title}
            className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 py-6 border-b border-fg/12 hover:bg-fg/[0.03] transition-colors -mx-4 px-4"
          >
            {/* Top row on mobile: index + date + RSVP pill */}
            <div className="flex items-center gap-3 md:contents">
              <span className="text-xs text-fg/30 w-6 shrink-0 tabular-nums hidden md:inline">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-xs tracking-[1px] uppercase text-fg/40 md:w-28 md:shrink-0">
                {event.date}
              </span>
              {/* RSVP pill — right-aligned on mobile top row */}
              <a
                href={event.rsvpUrl}
                className="ml-auto md:hidden text-xs tracking-[1px] uppercase text-fg/50 border border-fg/20 px-3 py-1.5 hover:border-fg/50 hover:text-fg transition-colors shrink-0"
              >
                Free · RSVP
              </a>
            </div>

            {/* Title + venue/DJs */}
            <div className="flex-1 min-w-0">
              <p
                className="text-fg leading-snug"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 4vw, 21px)' }}
              >
                {event.title}
              </p>
              <p className="text-xs text-fg/40 mt-1">
                {event.venue}, {event.location} · with {event.djs.join(', ')}
              </p>
            </div>

            {/* RSVP — desktop only */}
            <a
              href={event.rsvpUrl}
              className="hidden md:inline text-xs tracking-[1px] uppercase text-fg/50 border border-fg/20 px-4 py-2 hover:border-fg/50 hover:text-fg transition-colors shrink-0"
            >
              Free · RSVP
            </a>
          </div>
        ))}
      </div>

      {/* ── Private Listening Sessions ── */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-12 mb-24">
        <div className="border-t border-fg/12 pt-6 mb-3">
          <span className="text-xs tracking-[2px] uppercase text-fg/55">Private Listening Sessions</span>
        </div>
        <p className="text-sm text-fg/45 mb-10 max-w-[560px] leading-[1.7]">
          Monthly, at the house. All vinyl, no phones, 8–10 seats.
          Address shared once you're approved.
        </p>

        {/* Session card */}
        <div className="border border-fg/16 p-6 md:p-10 flex flex-col md:flex-row gap-10 md:gap-12 items-start">
          {/* Info column */}
          <div className="flex-1 min-w-0 w-full">
            <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-4">
              {SESSION.date} · {SESSION.time}
            </p>
            <h2
              className="text-fg leading-tight mb-5"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '30px',
                letterSpacing: '-0.5px',
              }}
            >
              {SESSION.title}
            </h2>
            <p className="text-sm text-fg/60 leading-[1.7] mb-8 max-w-[400px]">
              {SESSION.description}
            </p>

            {/* Avatars + attendance */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex -space-x-2">
                {SESSION.guests.map((initial) => (
                  <div
                    key={initial}
                    className="w-8 h-8 rounded-full border border-bg bg-fg/10 flex items-center justify-center text-[11px] tracking-wide text-fg/70"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <span className="text-xs text-fg/45">
                {SESSION.confirmed} going · {SESSION.pending} pending
              </span>
            </div>

            {/* Capacity bar */}
            <div className="mb-1">
              <div className="h-0.5 bg-fg/10 w-full">
                <div
                  className="h-full bg-fg/60 transition-all"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-fg/35">
              {spotsLeft} of {SESSION.capacity} spots left
            </p>
          </div>

          {/* RSVP panel */}
          <div className="w-full md:w-[300px] md:shrink-0 border-t border-fg/12 pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-10">
            <p className="text-xs text-fg/50 leading-[1.7] mb-6">
              Request an invite. You'll get the address once approved.
            </p>

            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                placeholder="Your name"
                disabled
                className="w-full bg-transparent border border-fg/16 px-4 py-3 text-xs text-fg/50 placeholder:text-fg/25 outline-none cursor-not-allowed"
              />
              <input
                type="email"
                placeholder="Your email"
                disabled
                className="w-full bg-transparent border border-fg/16 px-4 py-3 text-xs text-fg/50 placeholder:text-fg/25 outline-none cursor-not-allowed"
              />
            </div>

            <button
              disabled
              className="w-full py-3 text-xs tracking-[2px] uppercase border border-fg/16 text-fg/25 cursor-not-allowed mb-3"
            >
              Request Invite
            </button>

            <p className="text-[11px] text-fg/30 leading-[1.6]">
              RSVP requests opening soon.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default EventsPage
