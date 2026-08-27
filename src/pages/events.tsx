import React, { useEffect, useState } from "react";
import { graphql, Link } from "gatsby";
import SEO from "../components/seo";
import type { PVREvent } from "../data/events";
import {
  partitionEvents,
  formatEventDateShort,
  formatTimeRange,
  eventCoverSrc,
  type PublicEvent,
} from '../data/public-events'

type Summary = {
  capacity: number;
  seatsTaken: number;
  spotsLeft: number;
  waitlistCount: number;
  guests: { name: string; plusOnes: number }[];
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getUnlistedSession = (): PVREvent | undefined => undefined;

// Read the "already RSVP'd" cookie dropped on the event page
const readRsvpCookie = (
  slug: string
): { status: "confirmed" | "waitlisted" } | null => {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`pvr-rsvpd-${slug}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
};

const EventsPage = () => {
  // Private sessions are intentionally unlisted and only render at /e/<code>.
  const session = getUnlistedSession();
  const showPrivateSessions = false;

  const [summary, setSummary] = useState<Summary | null>(null);
  const [myStatus, setMyStatus] = useState<
    "confirmed" | "waitlisted" | null
  >(null);

  // Split upcoming vs. past at render (no post-mount state swap, so there's no
  // layout shift). SSR uses build time; the client recomputes at hydration, so
  // same-day views match the server HTML and a passed event still rolls into
  // Past on load.
  const { upcoming, past } = partitionEvents();

  // Cover photo (or poster) for the row thumbnail.
  const eventThumb = eventCoverSrc;
  const eventMeta = (e: PublicEvent) =>
    [
      e.photos?.length ? `${e.photos.length} photos` : null,
      e.tracklist?.length ? `${e.tracklist.length} tracks` : null,
      e.audioUrl ? 'Set audio' : null,
    ]
      .filter(Boolean)
      .join(' · ');

  // Hero collage photos — deliberately NOT the event covers (those are the row
  // thumbnails), so the hero shows different shots. First pass takes one
  // non-cover photo per event for variety; then tops up from any remaining
  // non-cover photos if still short of four.
  const heroPhotos = (() => {
    const covers = new Set(past.map((e) => eventCoverSrc(e)).filter(Boolean) as string[]);
    const src = (p: { original: string; thumbnail?: string }) => p.thumbnail || p.original;
    const pick: string[] = [];

    for (const e of past) {
      const alt = (e.photos ?? []).map(src).find((s) => !covers.has(s) && !pick.includes(s));
      if (alt) pick.push(alt);
      if (pick.length >= 4) break;
    }
    if (pick.length < 4) {
      for (const e of past) {
        for (const p of e.photos ?? []) {
          const s = src(p);
          if (!covers.has(s) && !pick.includes(s)) pick.push(s);
          if (pick.length >= 4) break;
        }
        if (pick.length >= 4) break;
      }
    }
    return pick.slice(0, 4);
  })();

  useEffect(() => {
    if (!session) return;
    const mine = readRsvpCookie(session.slug);
    setMyStatus(mine?.status ?? null);
    fetch(`/api/rsvp?slug=${encodeURIComponent(session.slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setSummary(data))
      .catch(() => {});
  }, [session?.slug]);

  const capacity = summary?.capacity ?? session?.capacity ?? 0;
  const seatsTaken = summary?.seatsTaken ?? 0;
  const spotsLeft = summary?.spotsLeft ?? capacity;
  const fillPct = capacity
    ? Math.min(100, Math.round((seatsTaken / capacity) * 100))
    : 0;

  return (
    <>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        {/* Full-bleed wood-grain texture (tiled, theme-aware) */}
        <div
          className="hero-grunge absolute inset-0 pointer-events-none"
          style={{ opacity: 0.18, '--grunge-image': "url('/images/wood-grain-texture.webp')", '--grunge-size': '700px' } as React.CSSProperties}
          aria-hidden="true"
        />
        <div className="relative max-w-[1040px] mx-auto px-4 md:px-12 pt-14 md:pt-16 pb-10 md:pb-14">
          <div className="grid md:grid-cols-[1.25fr_1fr] gap-8 md:gap-12 items-center">
            <div>
              <p className="text-xs tracking-[2px] uppercase font-medium text-fg/70 mb-5">
                Events
              </p>
              <h1
                className="text-fg leading-[1.05]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(34px, 5vw, 60px)",
                  letterSpacing: "-0.5px",
                }}
              >
                Out in public.
                <br />
                In the living room.
              </h1>
              <p className="font-text font-medium mt-6 text-base leading-[1.7] max-w-[440px] text-fg/80">
                We play records wherever we can — rooftops, warehouses, living
                rooms. Public nights are open to anyone, and every past night
                has a photo + tracklist recap.
              </p>
            </div>

            {/* Recent recap collage */}
            {heroPhotos.length > 0 && (
              <div className="hidden md:grid grid-cols-2 gap-2.5">
                {heroPhotos.map((src, i) => (
                  <div
                    key={i}
                    className="aspect-square overflow-hidden bg-fg/5 border border-fg/15"
                  >
                    <img
                      src={src}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover grayscale"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-bleed rule below the hero */}
      <div className="border-t border-fg/12" aria-hidden="true" />

      {/* ── Public Events ── */}
      <div className="max-w-[1040px] mx-auto px-4 md:px-12 mb-20">
        <div className="flex items-baseline justify-between border-b border-fg/12 py-4 mb-0">
          <span className="text-xs tracking-[2px] uppercase text-fg/55">
            Public Events
          </span>
        </div>

        {upcoming.length === 0 && (
          <div className="py-12 text-center border-b border-fg/12">
            <p className="text-sm text-fg/35">No upcoming public events. Check back soon.</p>
          </div>
        )}

        {upcoming.map((event) => (
          <div
            key={event.slug}
            className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-6 py-6 border-b border-fg/12 hover:bg-fg/[0.03] transition-colors -mx-4 px-4"
          >
            {/* Thumbnail */}
            <Link
              to={`/events/${event.slug}`}
              className="block w-full md:w-44 md:shrink-0 aspect-video bg-fg/5 overflow-hidden"
              aria-label={event.title}
            >
              {eventThumb(event) && (
                <img
                  src={eventThumb(event)}
                  alt={event.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </Link>

            {/* Date + title + venue/DJs */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-xs tracking-[1px] uppercase text-fg/55">
                  {formatEventDateShort(event.startDateTime)}
                </span>
                {event.rsvpEnabled && (
                  <Link
                    to={`/events/${event.slug}`}
                    className="ml-auto md:hidden text-xs tracking-[1px] uppercase text-fg/50 border border-fg/20 px-3 py-1.5 hover:border-fg/50 hover:text-fg transition-colors shrink-0"
                  >
                    Free · RSVP
                  </Link>
                )}
              </div>
              <Link
                to={`/events/${event.slug}`}
                className="card-title block mt-1 text-fg leading-snug"
                style={{ fontSize: "clamp(18px, 4vw, 21px)" }}
              >
                {event.title}
              </Link>
              <p className="text-xs text-fg/55 mt-1">
                {event.venue}, {event.location} · {formatTimeRange(event.startDateTime, event.endDateTime)} · with {event.djs.join(", ")}
              </p>
              <p className="text-xs text-fg/50 mt-2 max-w-2xl leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* RSVP — desktop only */}
            <Link
              to={`/events/${event.slug}`}
              className="hidden md:inline text-xs tracking-[1px] uppercase text-fg/50 border border-fg/20 px-4 py-2 hover:border-fg/50 hover:text-fg transition-colors shrink-0"
            >
              {event.rsvpEnabled ? "Free · RSVP" : "Details →"}
            </Link>
          </div>
        ))}
      </div>

      {/* ── Past Events ── */}
      {past.length > 0 && (
        <div className="max-w-[1040px] mx-auto px-4 md:px-12 mb-20">
          <div className="flex items-baseline justify-between border-t border-b border-fg/12 py-4 mb-0">
            <span className="text-xs tracking-[2px] uppercase text-fg/40">
              Past Events
            </span>
          </div>

          {past.map((event) => (
            <div
              key={event.slug}
              className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-6 py-6 border-b border-fg/12 -mx-4 px-4"
            >
              {/* Recap thumbnail */}
              <Link
                to={`/events/${event.slug}`}
                className="block w-full md:w-44 md:shrink-0 aspect-video bg-fg/5 overflow-hidden"
                aria-label={event.title}
              >
                {eventThumb(event) && (
                  <img
                    src={eventThumb(event)}
                    alt={event.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <span className="text-xs tracking-[1px] uppercase text-fg/45">
                  {formatEventDateShort(event.startDateTime)}
                </span>
                <Link
                  to={`/events/${event.slug}`}
                  className="card-title block mt-1 text-fg leading-snug"
                  style={{ fontSize: "clamp(18px, 4vw, 21px)" }}
                >
                  {event.title}
                </Link>
                <p className="text-xs text-fg/45 mt-1">
                  {event.venue}, {event.location} · with {event.djs.join(", ")}
                </p>
                {eventMeta(event) && (
                  <p className="text-[11px] tracking-[1px] uppercase text-fg/40 mt-2">
                    {eventMeta(event)}
                  </p>
                )}
              </div>

              <Link
                to={`/events/${event.slug}`}
                className="hidden md:inline text-xs tracking-[1px] uppercase text-fg/45 border border-fg/20 px-4 py-2 hover:border-fg/50 hover:text-fg transition-colors shrink-0"
              >
                View recap →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ── Private Listening Sessions ── */}
      {showPrivateSessions && (
      <div className="max-w-[1040px] mx-auto px-4 md:px-12 mb-24">
        <div className="border-t border-fg/12 pt-6 mb-3">
          <span className="text-xs tracking-[2px] uppercase text-fg/55">
            Private Listening Sessions
          </span>
        </div>
        <p className="text-sm text-fg/55 mb-10 max-w-[560px] leading-[1.7]">
          Monthly, at the house. All vinyl, no phones, 8–10 seats. Address
          shared once you RSVP.
        </p>

        {!session && (
          <div className="py-12 text-center border border-fg/12">
            <p className="text-sm text-fg/35">
              No sessions scheduled right now. Check back soon.
            </p>
          </div>
        )}

        {/* Session card */}
        {session && (
        <div className="border border-fg/16 p-6 md:p-10 flex flex-col md:flex-row gap-10 md:gap-12 items-start">
          {/* Info column */}
          <div className="flex-1 min-w-0 w-full">
            <p className="text-xs tracking-[2px] uppercase text-fg/55 mb-4">
              {session.dateLabel} · {session.time}
            </p>
            <h2
              className="leading-tight mb-5"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "30px",
                letterSpacing: "-0.5px",
              }}
            >
              <Link
                to={`/events/${session.slug}`}
                className="text-fg hover:text-fg/60 transition-colors"
              >
                {session.title}
              </Link>
            </h2>
            <p className="text-sm text-fg/60 leading-[1.7] mb-8 max-w-[400px]">
              {session.description}
            </p>

            {/* Guest list + attendance */}
            <div className="mb-5">
              {summary && summary.guests.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                  {summary.guests.map((g, i) => (
                    <div
                      key={`${g.name}-${i}`}
                      className="flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full border border-bg bg-fg/10 flex items-center justify-center text-[11px] tracking-wide text-fg/70 shrink-0">
                        {initials(g.name)}
                      </div>
                      <span className="text-xs text-fg/60">
                        {g.name}
                        {g.plusOnes > 0 && (
                          <span className="text-fg/35"> +{g.plusOnes}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <span className="text-xs text-fg/55">
                {summary
                  ? `${seatsTaken} going${
                      summary.waitlistCount
                        ? ` · ${summary.waitlistCount} waitlisted`
                        : ""
                    }`
                  : "Loading…"}
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
              {summary
                ? spotsLeft > 0
                  ? `${spotsLeft} of ${capacity} spots left`
                  : "Full — join the waitlist"
                : `${capacity} seats`}
            </p>
          </div>

          {/* RSVP panel */}
          <div className="w-full md:w-[300px] md:shrink-0 border-t border-fg/12 pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-10">
            <p className="text-xs text-fg/50 leading-[1.7] mb-6">
              All vinyl, no phones. You'll get the address here once you RSVP.
            </p>

            <Link
              to={`/events/${session.slug}`}
              className="block w-full py-3 text-center text-xs tracking-[2px] uppercase border border-fg/30 text-fg hover:bg-fg hover:text-bg! transition-colors mb-3"
            >
              {myStatus === "confirmed"
                ? "You're going ✓"
                : myStatus === "waitlisted"
                ? "On the waitlist ✓"
                : spotsLeft > 0
                ? "RSVP · Free"
                : "Join Waitlist"}
            </Link>

            <p className="text-[11px] text-fg/30 leading-[1.6]">
              {myStatus
                ? "Tap to view your RSVP & details."
                : session.maxPlusOnes > 0
                ? "Bring a +1 if you like."
                : "Just you on this one."}
            </p>
          </div>
        </div>
        )}
      </div>
      )}
    </>
  );
};

export default EventsPage;

export const Head = () => (
  <SEO
    title="Events · Public Vinyl Radio"
    description="Public events and private listening sessions from Public Vinyl Radio."
    url="https://publicvinylradio.com/events"
  />
);

export const query = graphql`
  query EventsPageQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
