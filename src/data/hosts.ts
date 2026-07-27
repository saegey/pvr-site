import hostsData from "./hosts.data.json";

// Curated collaborators. `handle` must match the value used in a show's
// frontmatter `host: [...]`. Only handles listed here get a /collaborators/<slug>
// page — handles that appear in shows but aren't here render as plain text.
export type Host = {
  handle: string;
  name: string;
  slug: string;
  bio?: string;
  /** Path relative to src/images, e.g. "collaborators/saegey.jpg". Optional —
   *  a placeholder is shown until the image exists. */
  image?: string;
  website?: string;
  instagram?: string;
  youtube?: string;
  soundcloud?: string;
};

export const HOSTS: Host[] = hostsData as Host[];

export const hostByHandle = (handle: string): Host | undefined =>
  HOSTS.find((h) => h.handle === handle);

export const hostBySlug = (slug: string): Host | undefined =>
  HOSTS.find((h) => h.slug === slug);
