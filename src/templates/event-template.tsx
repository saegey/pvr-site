import React, { useEffect, useState, useCallback } from "react";
import { Link } from "gatsby";
import SEO from "../components/seo";
import type { PVREvent } from "../data/events";

type Summary = {
  capacity: number;
  seatsTaken: number;
  spotsLeft: number;
  waitlistCount: number;
  guests: { name: string; plusOnes: number }[];
};

type RsvpResult = {
  status: "confirmed" | "waitlisted";
  party: number;
  address: string | null;
  summary: Summary;
};

type StoredRsvp = {
  status: "confirmed" | "waitlisted";
  name: string;
  email: string;
  plusOnes: number;
  address: string | null;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "";

// ── cookie helpers (persist "already RSVP'd" across localStorage clears) ──
const setCookie = (name: string, value: string, days = 180) => {
  const d = new Date();
  d.setTime(d.getTime() + days * 864e5);
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
};
const getCookie = (name: string): string | null => {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
};
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=0; path=/`;
};

const EventTemplate: React.FC<{ pageContext: { event: PVREvent } }> = ({
  pageContext,
}) => {
  const event = pageContext.event;
  const storageKey = `pvr-rsvp-${event.slug}`;
  const cookieKey = `pvr-rsvpd-${event.slug}`;

  const [summary, setSummary] = useState<Summary | null>(null);
  const [stored, setStored] = useState<StoredRsvp | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bringGuest, setBringGuest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load any previous RSVP for this device.
  // Prefer localStorage (full details); fall back to the cookie so the form
  // stays disabled even if localStorage was cleared.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setStored(JSON.parse(raw));
        return;
      }
    } catch {
      /* ignore */
    }
    const cookie = getCookie(cookieKey);
    if (cookie) {
      try {
        const { status, name } = JSON.parse(cookie);
        setStored({ status, name, email: "", plusOnes: 0, address: null });
      } catch {
        /* ignore malformed cookie */
      }
    }
  }, [storageKey, cookieKey]);

  const loadSummary = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/rsvp?slug=${encodeURIComponent(event.slug)}`
      );
      if (res.ok) setSummary(await res.json());
    } catch {
      /* network — leave summary null */
    }
  }, [event.slug]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: event.slug,
          name,
          email,
          phone,
          plusOnes: bringGuest ? 1 : 0,
        }),
      });
      const data: RsvpResult & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      const record: StoredRsvp = {
        status: data.status,
        name,
        email,
        plusOnes: bringGuest ? 1 : 0,
        address: data.address,
      };
      localStorage.setItem(storageKey, JSON.stringify(record));
      // Cookie mirrors the essentials so the form stays disabled on this
      // device even if localStorage is later cleared.
      setCookie(cookieKey, JSON.stringify({ status: data.status, name }));
      setStored(record);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelMyRsvp = async () => {
    if (!stored?.email) return;
    if (!window.confirm("Cancel your RSVP? This frees up your seat.")) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/rsvp?slug=${encodeURIComponent(
          event.slug
        )}&email=${encodeURIComponent(stored.email)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not cancel");
      localStorage.removeItem(storageKey);
      deleteCookie(cookieKey);
      setStored(null);
      setName("");
      setEmail("");
      setPhone("");
      setBringGuest(false);
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const capacity = summary?.capacity ?? event.capacity;
  const seatsTaken = summary?.seatsTaken ?? 0;
  const spotsLeft = summary?.spotsLeft ?? capacity;
  const fillPct = Math.min(100, Math.round((seatsTaken / capacity) * 100));
  const isFull = spotsLeft <= 0;

  return (
    <>
      <SEO
        title={`${event.title} · Public Vinyl Radio`}
        description={event.description}
        url={`https://publicvinylradio.com/events/${event.slug}`}
      />

      <div className="max-w-[600px] mx-auto px-5 pt-10 pb-24">
        <Link
          to="/events"
          className="text-xs tracking-[1px] uppercase text-fg/40 hover:text-fg transition-colors"
        >
          ← All events
        </Link>

        {/* ── Header ── */}
        <p className="text-xs tracking-[2px] uppercase text-fg/40 mt-10 mb-4">
          {event.isPrivate ? "Private session" : "Event"} · {event.dateLabel} ·{" "}
          {event.time}
        </p>
        <h1
          className="text-fg leading-tight mb-5"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(30px, 8vw, 42px)",
            letterSpacing: "-0.5px",
          }}
        >
          {event.title}
        </h1>
        <p className="text-sm text-fg/60 leading-[1.7] mb-6">
          {event.description}
        </p>
        <p className="text-xs text-fg/45 mb-10">
          {event.location}
          {event.djs?.length ? ` · with ${event.djs.join(", ")}` : ""}
        </p>

        {/* ── Capacity ── */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs tracking-[1px] uppercase text-fg/45">
            {summary ? `${seatsTaken} going` : "Loading…"}
          </span>
          <span className="text-xs text-fg/35">
            {summary
              ? isFull
                ? `Full · ${summary.waitlistCount} on waitlist`
                : `${spotsLeft} of ${capacity} spots left`
              : ""}
          </span>
        </div>
        <div className="h-0.5 bg-fg/10 w-full mb-4">
          <div
            className="h-full bg-fg/60 transition-all"
            style={{ width: `${fillPct}%` }}
          />
        </div>

        {/* ── Guest list ── */}
        {summary && summary.guests.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-10">
            {summary.guests.map((g, i) => (
              <div key={`${g.name}-${i}`} className="flex items-center gap-2">
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

        {/* ── RSVP state ── */}
        {stored ? (
          <div className="border border-fg/16 p-6">
            {stored.status === "confirmed" ? (
              <>
                <p
                  className="text-fg mb-2"
                  style={{ fontFamily: "var(--font-display)", fontSize: "22px" }}
                >
                  You're in{firstName(stored.name) ? `, ${firstName(stored.name)}` : ""}
                  {stored.plusOnes ? " (+1)" : ""} 🎶
                </p>
                <p className="text-sm text-fg/55 leading-[1.7] mb-5">
                  See you {event.dateLabel} at {event.time}.
                </p>
                {stored.address && (
                  <div className="border-t border-fg/12 pt-5">
                    <p className="text-xs tracking-[1px] uppercase text-fg/40 mb-2">
                      Address
                    </p>
                    <p className="text-sm text-fg/75 leading-[1.7]">
                      {stored.address}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p
                  className="text-fg mb-2"
                  style={{ fontFamily: "var(--font-display)", fontSize: "22px" }}
                >
                  You're on the waitlist
                  {firstName(stored.name) ? `, ${firstName(stored.name)}` : ""}
                </p>
                <p className="text-sm text-fg/55 leading-[1.7]">
                  This session filled up, but people drop — we'll reach out
                  {stored.email ? ` at ${stored.email}` : ""} if a spot opens.
                </p>
              </>
            )}
            {error && <p className="text-xs text-red-400 mt-5">{error}</p>}

            <div className="mt-6 flex flex-col gap-3 border-t border-fg/12 pt-5">
              {stored.email && (
                <button
                  onClick={cancelMyRsvp}
                  disabled={submitting}
                  className="self-start text-xs tracking-[1px] uppercase text-fg/45 hover:text-red-400 transition-colors disabled:opacity-40"
                >
                  {submitting ? "Cancelling…" : "Can't make it? Cancel RSVP"}
                </button>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem(storageKey);
                  deleteCookie(cookieKey);
                  setStored(null);
                  setName("");
                  setEmail("");
                  setPhone("");
                  setBringGuest(false);
                }}
                className="self-start text-[11px] tracking-[1px] uppercase text-fg/30 hover:text-fg transition-colors"
              >
                Not you? RSVP again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="border border-fg/16 p-6">
            <p className="text-xs tracking-[1px] uppercase text-fg/45 mb-5">
              {isFull ? "Join the waitlist" : "RSVP · free"}
            </p>

            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-transparent border border-fg/16 px-4 py-3 text-sm text-fg placeholder:text-fg/30 outline-none focus:border-fg/40 transition-colors"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full bg-transparent border border-fg/16 px-4 py-3 text-sm text-fg placeholder:text-fg/30 outline-none focus:border-fg/40 transition-colors"
              />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full bg-transparent border border-fg/16 px-4 py-3 text-sm text-fg placeholder:text-fg/30 outline-none focus:border-fg/40 transition-colors"
              />
            </div>

            {event.maxPlusOnes > 0 && (
              <label className="flex items-center gap-3 mb-6 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bringGuest}
                  onChange={(e) => setBringGuest(e.target.checked)}
                  className="w-4 h-4 accent-current"
                />
                <span className="text-sm text-fg/60">Bringing a +1</span>
              </label>
            )}

            {error && (
              <p className="text-xs text-red-400 mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-xs tracking-[2px] uppercase border border-fg/30 text-fg hover:bg-fg hover:text-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Sending…"
                : isFull
                ? "Join waitlist"
                : "RSVP"}
            </button>

            <p className="text-[11px] text-fg/30 leading-[1.6] mt-4">
              {event.isPrivate
                ? "The address is shared with you here once you're confirmed."
                : "You'll get a confirmation on the next screen."}
            </p>
          </form>
        )}
      </div>
    </>
  );
};

export default EventTemplate;
