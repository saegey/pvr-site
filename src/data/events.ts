import eventsData from "./events.data.json";

export type PVREvent = {
  slug: string;
  title: string;
  /** ISO date, e.g. 2026-07-28 */
  date: string;
  /** Human label, e.g. "July 28, 2026" */
  dateLabel: string;
  time: string;
  description: string;
  /** Total seats available (each RSVP takes 1 + plusOnes seats) */
  capacity: number;
  /** Max additional guests a single RSVP may bring */
  maxPlusOnes: number;
  /** Public-facing location line */
  location: string;
  /** Private address — only revealed by the server to confirmed guests */
  address?: string;
  djs: string[];
  isPrivate: boolean;
  isActive: boolean;
};

export const EVENTS: PVREvent[] = eventsData as PVREvent[];

export const ACTIVE_EVENTS = EVENTS.filter((e) => e.isActive);

export const getEvent = (slug: string): PVREvent | undefined =>
  EVENTS.find((e) => e.slug === slug);
