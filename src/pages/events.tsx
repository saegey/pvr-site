import React, { useEffect, useState } from "react";
import { graphql, Link } from "gatsby";
import SEO from "../components/seo";
import { ACTIVE_EVENTS } from "../data/events";
import { PUBLIC_EVENTS } from '../data/public-events'

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
  // Show the soonest active private session in the RSVP card
  const session = ACTIVE_EVENTS.filter((e) => e.isPrivate).sort((a, b) =>
    a.date.localeCompare(b.date)
  )[0];

  const [summary, setSummary] = useState<Summary | null>(null);
  const [myStatus, setMyStatus] = useState<
    "confirmed" | "waitlisted" | null
  >(null);

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
      <SEO
        title="Events · Public Vinyl Radio"
        description="Public events and private listening sessions from Public Vinyl Radio."
        url="https://publicvinylradio.com/events"
      />

      {/* ── Header band ── */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-12 pt-16 pb-12">
        <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-6">
          Events
        </p>
        <h1
          className="text-fg leading-tight mb-10"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(34px, 4.5vw, 60px)",
            letterSpacing: "-0.5px",
          }}
        >
          Out in public.
          <br />
          In the living room.
        </h1>
        <div className="border-t border-fg/12 pt-8 max-w-[640px]">
          <p className="text-sm text-fg/60 leading-[1.8]">
            We play records wherever we can — rooftops, warehouses, living
            rooms. Public shows are open to anyone. Private sessions are small,
            invite-only, and seriously good.
          </p>
        </div>
      </div>

      {/* ── Public Events ── */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-12 mb-20">
        <div className="flex items-baseline justify-between border-t border-b border-fg/12 py-4 mb-0">
          <span className="text-xs tracking-[2px] uppercase text-fg/55">
            Public Events
          </span>
        </div>

        {PUBLIC_EVENTS.length === 0 && (
          <div className="py-12 text-center border-b border-fg/12">
            <p className="text-sm text-fg/35">No upcoming public events. Check back soon.</p>
          </div>
        )}

        {PUBLIC_EVENTS.map((event, i) => (
          <div
            key={event.title}
            className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 py-6 border-b border-fg/12 hover:bg-fg/[0.03] transition-colors -mx-4 px-4"
          >
            {/* Top row on mobile: index + date + RSVP pill */}
            <div className="flex items-center gap-3 md:contents">
              <span className="text-xs text-fg/30 w-6 shrink-0 tabular-nums hidden md:inline">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-xs tracking-[1px] uppercase text-fg/40 md:w-28 md:shrink-0">
                {event.date}
              </span>
              {/* RSVP pill — right-aligned on mobile top row */}
              {event.rsvpEnabled && (
                <Link
                  to={`/events/${event.slug}`}
                  className="ml-auto md:hidden text-xs tracking-[1px] uppercase text-fg/50 border border-fg/20 px-3 py-1.5 hover:border-fg/50 hover:text-fg transition-colors shrink-0"
                >
                  Free · RSVP
                </Link>
              )}
            </div>

            {/* Title + venue/DJs */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/events/${event.slug}`}
                className="text-fg leading-snug"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(18px, 4vw, 21px)",
                }}
              >
                {event.title}
              </Link>
              <p className="text-xs text-fg/40 mt-1">
                {event.venue}, {event.location} · {event.time} · with {event.djs.join(", ")}
              </p>
              <p className="text-xs text-fg/50 mt-2 max-w-2xl leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* RSVP — desktop only */}
            {event.rsvpEnabled ? (
              <Link
                to={`/events/${event.slug}`}
                className="hidden md:inline text-xs tracking-[1px] uppercase text-fg/50 border border-fg/20 px-4 py-2 hover:border-fg/50 hover:text-fg transition-colors shrink-0"
              >
                Free · RSVP
              </Link>
            ) : (
              <Link
                to={`/events/${event.slug}`}
                className="hidden md:inline text-xs tracking-[1px] uppercase text-fg/50 border border-fg/20 px-4 py-2 hover:border-fg/50 hover:text-fg transition-colors shrink-0"
              >
                Details →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* ── Private Listening Sessions ── */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-12 mb-24">
        <div className="border-t border-fg/12 pt-6 mb-3">
          <span className="text-xs tracking-[2px] uppercase text-fg/55">
            Private Listening Sessions
          </span>
        </div>
        <p className="text-sm text-fg/45 mb-10 max-w-[560px] leading-[1.7]">
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
            <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-4">
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
              <span className="text-xs text-fg/45">
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
    </>
  );
};

export default EventsPage;

export const query = graphql`
  query EventsPageQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
