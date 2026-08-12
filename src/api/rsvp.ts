import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby";
import { getStore } from "@netlify/blobs";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Resend } from "resend";
import EVENTS from "../data/events.data.json";
import PUBLIC_EVENTS from "../data/public-events.data.json";

type Rsvp = {
  id: string;
  name: string;
  email: string;
  phone: string;
  plusOnes: number;
  status: "confirmed" | "waitlisted";
  createdAt: string;
  updatedAt: string;
};

type PVREvent = {
  slug: string;
  title: string;
  description?: string;
  venue?: string;
  location?: string;
  date?: string;
  dateLabel?: string;
  time?: string;
  startDateTime?: string;
  endDateTime?: string;
  capacity?: number | null;
  maxPlusOnes: number;
  address?: string;
  isActive?: boolean;
  rsvpEnabled?: boolean;
};

const getEvent = (slug: string): PVREvent | undefined =>
  ([...(EVENTS as PVREvent[]), ...(PUBLIC_EVENTS as PVREvent[])]).find(
    (e) => e.slug === slug
  );

// ── storage: Netlify Blobs in prod / `netlify dev`, in-memory under `gatsby develop` ──
const memory: Record<string, Rsvp[]> = {};

// Local `gatsby serve` runs with NODE_ENV=production but has no Netlify Blobs
// credentials. Keep its RSVP preview functional in memory; only deployed
// Netlify requests must persist successfully to Blobs.
const allowMemoryFallback = process.env.NETLIFY !== "true";

// Blobs are scoped to a Netlify site, not a deploy. Keep RSVP data isolated
// between production, branch/deploy previews, and local Netlify development.
// Production intentionally has a stable name so it persists across deploys.
const blobScope = () => {
  const context = process.env.CONTEXT || process.env.NETLIFY_CONTEXT || "development";
  if (context === "production") return "production";

  const branch = (process.env.BRANCH || "local")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${context}-${branch || "local"}`;
};

const RSVP_STORE_NAME = `event-rsvps-${blobScope()}`;

// The Netlify-Gatsby function runtime doesn't always get the automatic Blobs
// context injected, so fall back to explicit siteID + token when provided.
const rsvpStore = () => {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_API_TOKEN;
  if (siteID && token) {
    return getStore({ name: RSVP_STORE_NAME, siteID, token });
  }
  // Auto-configured context (works under `netlify dev` and native functions)
  return getStore(RSVP_STORE_NAME);
};

const loadRsvps = async (slug: string): Promise<Rsvp[]> => {
  try {
    const data = (await rsvpStore().get(slug, { type: "json" })) as {
      rsvps: Rsvp[];
    } | null;
    return data?.rsvps || [];
  } catch (err) {
    if (!allowMemoryFallback) throw err;
    console.warn(
      `[rsvp] Blobs unavailable on load (${slug}), using in-memory:`,
      (err as Error).message
    );
    return memory[slug] || [];
  }
};

const saveRsvps = async (slug: string, rsvps: Rsvp[]): Promise<void> => {
  try {
    await rsvpStore().setJSON(slug, { rsvps });
    console.log(`[rsvp] Saved ${rsvps.length} rsvp(s) to Blobs for ${slug}`);
  } catch (err) {
    if (!allowMemoryFallback) throw err;
    console.warn(
      `[rsvp] Blobs unavailable on save (${slug}), using in-memory:`,
      (err as Error).message
    );
    memory[slug] = rsvps;
  }
};

// ── helpers ──
const partySize = (r: Rsvp) => 1 + (r.plusOnes || 0);

const displayName = (name: string) => {
  const parts = String(name || "").trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return "Guest";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
};

const seatsTaken = (rsvps: Rsvp[]) =>
  rsvps
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + partySize(r), 0);

// Reassign confirmed/waitlisted first-come-first-served by createdAt.
// Auto-promotes the waitlist whenever seats free up. Mutates in place.
const assignStatuses = (rsvps: Rsvp[], capacity?: number | null): Rsvp[] => {
  if (capacity == null) {
    rsvps.forEach((r) => { r.status = "confirmed"; });
    return rsvps;
  }
  let taken = 0;
  [...rsvps]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .forEach((r) => {
      const size = partySize(r);
      if (taken + size <= capacity) {
        r.status = "confirmed";
        taken += size;
      } else {
        r.status = "waitlisted";
      }
    });
  return rsvps;
};

const isAdmin = (key?: string) =>
  !!key && !!process.env.RSVP_ADMIN_KEY && key === process.env.RSVP_ADMIN_KEY;

const cancellationSecret = () => process.env.RSVP_CANCELLATION_SECRET || process.env.RSVP_ADMIN_KEY;

const cancellationToken = (slug: string, rsvp: Rsvp) => {
  const secret = cancellationSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(`${slug}:${rsvp.id}:${rsvp.email}`).digest("hex");
};

const validCancellationToken = (slug: string, rsvp: Rsvp, token?: string) => {
  const expected = cancellationToken(slug, rsvp);
  if (!expected || !token || expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
};

const eventDateTime = (event: PVREvent) => {
  if (event.startDateTime) {
    return new Date(event.startDateTime).toLocaleString("en-US", {
      dateStyle: "full", timeStyle: "short", timeZone: "America/Los_Angeles",
    });
  }
  return [event.dateLabel || event.date, event.time].filter(Boolean).join(" · ");
};

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character] as string));

const escapeIcs = (value: string) => value.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

const eventIcs = (event: PVREvent) => {
  if (!event.startDateTime || !event.endDateTime) return null;
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Public Vinyl Radio//Events//EN", "BEGIN:VEVENT",
    `UID:${event.slug}@publicvinylradio.com`, `DTSTART:${stamp(event.startDateTime)}`,
    `DTEND:${stamp(event.endDateTime)}`, `SUMMARY:${escapeIcs(`${event.title} · Public Vinyl Radio`)}`,
    `DESCRIPTION:${escapeIcs(event.description || "")}`,
    `LOCATION:${escapeIcs([event.venue, event.location].filter(Boolean).join(", "))}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
};

const sendRsvpEmail = async (event: PVREvent, rsvp: Rsvp) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RSVP_EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("[rsvp] RSVP email skipped: RESEND_API_KEY or RSVP_EMAIL_FROM is not configured");
    return;
  }
  const siteUrl = (process.env.SITE_URL || "https://publicvinylradio.com").replace(/\/$/, "");
  const token = cancellationToken(event.slug, rsvp);
  const cancelUrl = token
    ? `${siteUrl}/rsvp-cancel?slug=${encodeURIComponent(event.slug)}&token=${encodeURIComponent(token)}`
    : null;
  const confirmed = rsvp.status === "confirmed";
  const party = 1 + (rsvp.plusOnes || 0);
  const where = [event.venue, confirmed ? (event.address || event.location) : event.location].filter(Boolean).join(" · ");
  const details = `${eventDateTime(event)}\n${where}`;
  const subject = confirmed
    ? `You’re confirmed: ${event.title}`
    : `You’re on the waitlist: ${event.title}`;
  const intro = confirmed
    ? `Your RSVP for ${party} ${party === 1 ? "person is" : "people are"} confirmed.`
    : "The event is currently full, but you’re on the waitlist. We’ll email you if a spot opens up.";
  const cancelCopy = cancelUrl ? `\n\nNeed to cancel? ${cancelUrl}` : "";
  const ics = confirmed ? eventIcs(event) : null;
  const result = await new Resend(apiKey).emails.send({
    from,
    replyTo: process.env.RSVP_EMAIL_REPLY_TO || undefined,
    to: rsvp.email,
    subject,
    text: `Hi ${rsvp.name},\n\n${intro}\n\n${event.title}\n${details}${cancelCopy}`,
    html: `<p>Hi ${escapeHtml(rsvp.name)},</p><p>${escapeHtml(intro)}</p><p><strong>${escapeHtml(event.title)}</strong><br />${escapeHtml(eventDateTime(event))}<br />${escapeHtml(where)}</p>${confirmed && ics ? "<p>A calendar invite is attached to this email.</p>" : ""}${cancelUrl ? `<p><a href="${cancelUrl}">Cancel your RSVP</a></p>` : ""}`,
    attachments: ics ? [{ filename: `${event.slug}.ics`, content: Buffer.from(ics) }] : undefined,
  }, { idempotencyKey: `rsvp/${event.slug}/${rsvp.id}/${rsvp.status}` });
  if (result.error) throw new Error(result.error.message);
};

const summarize = (event: PVREvent, rsvps: Rsvp[]) => {
  const confirmed = rsvps.filter((r) => r.status === "confirmed");
  const waitlisted = rsvps.filter((r) => r.status === "waitlisted");
  const taken = seatsTaken(rsvps);
  return {
    slug: event.slug,
    capacity: event.capacity,
    seatsTaken: taken,
    spotsLeft: event.capacity == null ? null : Math.max(0, event.capacity - taken),
    waitlistCount: waitlisted.length,
    guests: confirmed.map((r) => ({
      name: displayName(r.name),
      plusOnes: r.plusOnes || 0,
    })),
  };
};

// ── handler ──
export default async function handler(
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse
) {
  try {
  // GET — live summary (or full list with admin key)
  if (req.method === "GET") {
    const slug = req.query.slug as string;
    const key = req.query.key as string | undefined;
    const ev = getEvent(slug);
    if (!ev) return res.status(404).json({ error: "Event not found" });

    const rsvps = await loadRsvps(slug);

    if (isAdmin(key)) {
      return res.status(200).json({ ...summarize(ev, rsvps), rsvps });
    }
    return res.status(200).json(summarize(ev, rsvps));
  }

  // POST — create / update an RSVP
  if (req.method === "POST") {
    const body = (req.body || {}) as {
      slug?: string;
      name?: string;
      email?: string;
      phone?: string;
      plusOnes?: number | string;
    };
    const { slug, name, email, phone } = body;
    const plusOnes = Math.max(0, parseInt(String(body.plusOnes), 10) || 0);

    const ev = getEvent(slug || "");
    if (!ev) return res.status(404).json({ error: "Event not found" });
    if (ev.isActive === false)
      return res.status(403).json({ error: "RSVPs are closed" });
    if (ev.rsvpEnabled === false)
      return res.status(403).json({ error: "RSVPs are not available for this event" });
    if (!name || !name.trim())
      return res.status(400).json({ error: "Name is required" });
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return res.status(400).json({ error: "A valid email is required" });
    if (!phone || (phone.match(/\d/g) || []).length < 7)
      return res.status(400).json({ error: "A valid phone number is required" });

    const cappedPlusOnes = Math.min(plusOnes, ev.maxPlusOnes || 0);

    const rsvps = await loadRsvps(slug as string);
    const previousStatuses = new Map(rsvps.map(rsvp => [rsvp.id, rsvp.status]));
    const normalizedEmail = email.trim().toLowerCase();
    const existing = rsvps.find((r) => r.email === normalizedEmail);

    const now = new Date().toISOString();
    const record: Rsvp = {
      id: existing?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      plusOnes: cappedPlusOnes,
      status: existing?.status || "waitlisted",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    if (existing) {
      Object.assign(existing, record);
    } else {
      rsvps.push(record);
    }

    assignStatuses(rsvps, ev.capacity);
    await saveRsvps(slug as string, rsvps);

    const saved = rsvps.find((r) => r.email === normalizedEmail) as Rsvp;

    // RSVP storage remains the source of truth: a delivery failure never loses
    // a guest's place. Notify new guests and anyone newly promoted from waitlist.
    const notifications = rsvps.filter(rsvp =>
      !previousStatuses.has(rsvp.id) || previousStatuses.get(rsvp.id) !== rsvp.status
    );
    await Promise.all(notifications.map(rsvp =>
      sendRsvpEmail(ev, rsvp).catch(error =>
        console.error(`[rsvp] Could not send ${rsvp.status} email to ${rsvp.email}:`, error)
      )
    ));

    return res.status(200).json({
      status: saved.status,
      party: partySize(saved),
      address: saved.status === "confirmed" ? ev.address || null : null,
      cancellationToken: cancellationToken(ev.slug, saved),
      summary: summarize(ev, rsvps),
    });
  }

  // DELETE — cancel an RSVP (auto-promotes the waitlist).
  // Admins use ?key=…&id=…; guests use the signed token in their RSVP email.
  if (req.method === "DELETE") {
    const slug = req.query.slug as string;
    const id = req.query.id as string | undefined;
    const key = req.query.key as string | undefined;
    const token = req.query.token as string | undefined;
    const ev = getEvent(slug);
    if (!ev) return res.status(404).json({ error: "Event not found" });

    const admin = isAdmin(key);
    const current = await loadRsvps(slug);
    const target = admin
      ? current.find(rsvp => rsvp.id === id)
      : current.find(rsvp => validCancellationToken(slug, rsvp, token));
    if (!target)
      return res.status(401).json({ error: "This cancellation link is invalid or has expired." });
    const previousStatuses = new Map(current.map(rsvp => [rsvp.id, rsvp.status]));
    const rsvps = admin
      ? current.filter((r) => r.id !== id)
      : current.filter((r) => r.id !== target.id);

    assignStatuses(rsvps, ev.capacity);
    await saveRsvps(slug, rsvps);

    const promotions = rsvps.filter(rsvp =>
      previousStatuses.get(rsvp.id) === "waitlisted" && rsvp.status === "confirmed"
    );
    await Promise.all(promotions.map(rsvp =>
      sendRsvpEmail(ev, rsvp).catch(error =>
        console.error(`[rsvp] Could not send promotion email to ${rsvp.email}:`, error)
      )
    ));

    // Admins get the full list; guests only get the public summary
    return res
      .status(200)
      .json(admin ? { ...summarize(ev, rsvps), rsvps } : summarize(ev, rsvps));
  }

  return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(`[rsvp] Storage error:`, (err as Error).message);
    return res.status(500).json({
      error: "RSVP storage is temporarily unavailable. Please try again shortly.",
    });
  }
}
