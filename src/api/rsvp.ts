import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby";
import { getStore } from "@netlify/blobs";
import EVENTS from "../data/events.data.json";

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
  capacity: number;
  maxPlusOnes: number;
  address?: string;
  isActive?: boolean;
};

const getEvent = (slug: string): PVREvent | undefined =>
  (EVENTS as PVREvent[]).find((e) => e.slug === slug);

// ── storage: Netlify Blobs in prod / `netlify dev`, in-memory under `gatsby develop` ──
const memory: Record<string, Rsvp[]> = {};

const loadRsvps = async (slug: string): Promise<Rsvp[]> => {
  try {
    const store = getStore("event-rsvps");
    const data = (await store.get(slug, { type: "json" })) as {
      rsvps: Rsvp[];
    } | null;
    return data?.rsvps || [];
  } catch (err) {
    console.warn(
      `[rsvp] Blobs unavailable on load (${slug}), using in-memory:`,
      (err as Error).message
    );
    return memory[slug] || [];
  }
};

const saveRsvps = async (slug: string, rsvps: Rsvp[]): Promise<void> => {
  try {
    const store = getStore("event-rsvps");
    await store.setJSON(slug, { rsvps });
    console.log(`[rsvp] Saved ${rsvps.length} rsvp(s) to Blobs for ${slug}`);
  } catch (err) {
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
const assignStatuses = (rsvps: Rsvp[], capacity: number): Rsvp[] => {
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

const summarize = (event: PVREvent, rsvps: Rsvp[]) => {
  const confirmed = rsvps.filter((r) => r.status === "confirmed");
  const waitlisted = rsvps.filter((r) => r.status === "waitlisted");
  const taken = seatsTaken(rsvps);
  return {
    slug: event.slug,
    capacity: event.capacity,
    seatsTaken: taken,
    spotsLeft: Math.max(0, event.capacity - taken),
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
    if (!name || !name.trim())
      return res.status(400).json({ error: "Name is required" });
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return res.status(400).json({ error: "A valid email is required" });
    if (!phone || (phone.match(/\d/g) || []).length < 7)
      return res.status(400).json({ error: "A valid phone number is required" });

    const cappedPlusOnes = Math.min(plusOnes, ev.maxPlusOnes || 0);

    const rsvps = await loadRsvps(slug as string);
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

    return res.status(200).json({
      status: saved.status,
      party: partySize(saved),
      address: saved.status === "confirmed" ? ev.address || null : null,
      summary: summarize(ev, rsvps),
    });
  }

  // DELETE — cancel an RSVP (auto-promotes the waitlist).
  //   Admin:  ?key=…&id=…     Guest self-cancel: ?email=…
  if (req.method === "DELETE") {
    const slug = req.query.slug as string;
    const id = req.query.id as string | undefined;
    const key = req.query.key as string | undefined;
    const email = ((req.query.email as string) || "").trim().toLowerCase();
    const ev = getEvent(slug);
    if (!ev) return res.status(404).json({ error: "Event not found" });

    const admin = isAdmin(key);
    if (!admin && !email)
      return res.status(401).json({ error: "Unauthorized" });

    const current = await loadRsvps(slug);
    const rsvps = admin
      ? current.filter((r) => r.id !== id)
      : current.filter((r) => r.email !== email);

    assignStatuses(rsvps, ev.capacity);
    await saveRsvps(slug, rsvps);

    // Admins get the full list; guests only get the public summary
    return res
      .status(200)
      .json(admin ? { ...summarize(ev, rsvps), rsvps } : summarize(ev, rsvps));
  }

  return res.status(405).json({ error: "Method not allowed" });
}
