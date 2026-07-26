# Public Vinyl Radio

The official website for Public Vinyl Radio, a Seattle-based music collective showcasing DJ sets, radio shows, and live performances.

## Tech Stack

- **Framework:** Gatsby 5 (React-based static site generator)
- **Language:** TypeScript
- **Styling:** Theme UI (CSS-in-JS with design tokens)
- **Content:** MDX (Markdown + React components)
- **Hosting:** Netlify
- **Audio Storage:** Cloudflare R2

## Features

- **Audio Streaming:** Custom-built audio players for streaming MP3s from Cloudflare R2
- **Show Pages:** Dynamic pages for each radio show/episode with metadata and tracklists
- **Responsive Design:** Mobile-first design with dark/light mode support
- **SEO Optimized:** Automatic meta tags, Open Graph images, and structured data
- **Image Optimization:** Automatic image processing via Gatsby Image
- **Embedded Media:** Support for YouTube, Spotify, and Apple Music embeds

## Getting Started

### Prerequisites

- Node.js 18-20
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pvr-site

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run develop

# Site will be available at http://localhost:8000
# GraphQL playground at http://localhost:8000/___graphql
```

### Building

```bash
# Build for production
npm run build

# Serve production build locally
npm run serve

# Type checking
npm run typecheck

# Clean cache (useful when things break)
gatsby clean
```

## Project Structure

```
pvr-site/
├── src/
│   ├── components/          # React components
│   │   ├── r2-audio-player.tsx
│   │   ├── r2-playlist-player.tsx
│   │   ├── spotify.tsx
│   │   ├── youtube.tsx
│   │   └── ...
│   ├── content/
│   │   └── shows/          # MDX files for shows
│   ├── templates/          # Page templates
│   ├── pages/              # Static pages
│   └── types/              # TypeScript types
├── gatsby-config.ts        # Site configuration
├── gatsby-node.ts          # Build-time Node API
└── package.json
```

## Adding New Shows

Shows are created as MDX files in `src/content/shows/`:

```mdx
---
title: 'Show Title'
description: 'Show description'
episode: 1
date: '2025-12-14'
tags: ['Genre1', 'Genre2']
slug: 'show-slug'
host: ['DJ Name']
template: show
isActive: true
coverImage: './cover.jpg'
---

import R2AudioPlayer from '../../components/r2-audio-player';

<R2AudioPlayer
  url="https://pub-xxx.r2.dev/audio.mp3"
  title="Show Title"
/>

## About This Show

Your content here...
```

### Frontmatter Options

- `title` - Show title (required)
- `description` - Show description (required)
- `episode` - Episode number
- `date` - Show date in YYYY-MM-DD format
- `tags` - Array of genre tags
- `slug` - URL slug (required)
- `host` - Array of DJ/host names
- `template` - Must be `show`
- `isActive` - Set to `false` to hide from listings
- `coverImage` - Path to cover image (shown if no YouTube video)
- `youtubeId` - YouTube video ID for embedding

## Shop

`src/data/products.ts` is the **single source of truth** for the shop. The
storefront renders from it, checkout resolves its price lookup keys, and the
sync script pushes it to Stripe — you should rarely touch the Stripe dashboard
directly.

### Adding / updating a product

1. **Scaffold the entry** — an interactive prompt that appends a formatted
   product to `src/data/products.ts` and creates its image folder:

   ```bash
   npm run shop:new
   ```

   It asks for the name, id, description, price, tags, image filenames, and
   variants (generating `<id>--<variant>` lookup keys). To edit an existing
   product instead, just change its entry in `src/data/products.ts` by hand.

2. **Add source images** to `static/images/shop/<product-id>/` as `.png` (or
   `.jpg`) — the folder is created for you by `shop:new`. High-res originals are
   fine; they get downscaled.

3. **Generate optimized images** — creates the `.webp` (product cards) and
   `-thumb.webp` (cart drawer) derivatives from each source file:

   ```bash
   npm run shop:images            # missing/stale only
   npm run shop:images -- --force # regenerate everything
   ```

4. **Preview locally** with `npm run develop`.

5. **Push to Stripe sandbox, then promote to live** once you're happy:

   ```bash
   npm run shop:sync:sandbox                # write to the sandbox account
   npm run shop:sync:sandbox -- --dry-run   # preview changes, writes nothing
   npm run shop:sync:live                   # promote the same catalog to live
   ```

   The sync is **idempotent** — it creates products/prices that are missing,
   updates names/descriptions/images that drifted, and (because Stripe prices
   are immutable) when a price changes it creates a new Price, moves the lookup
   key onto it, and archives the old one. Re-running is always safe.

### Removing a product

```bash
npm run shop:remove -- <product-id>            # remove entry + image folder only
npm run shop:remove:sandbox -- <product-id>    # also archive its Stripe products (sandbox)
npm run shop:remove:live -- <product-id>       # also archive in live
npm run shop:remove:all -- <product-id>        # archive in both, then remove
```

Deletes the entry from `products.ts` and its `static/images/shop/<id>/` folder,
and (with `:sandbox`/`:live`/`:all`) archives the per-variant Stripe products so
they drop off Checkout. Prompts for confirmation; add `--yes` to skip,
`--keep-images` to keep the folder, or `--dry-run` to preview. (Stripe products
with prices can't be hard-deleted, so they're archived — same as "Archive" in the
dashboard.) Stripe products are found by their `pvr_id` stamp, so archiving still
works even if you already deleted the `products.ts` entry by hand.

### Generating an order PDF

Create a PVR-branded receipt and packing slip from a Stripe Checkout Session or
Payment Intent.
This is read-only: it retrieves the order details but makes no Stripe changes.

```bash
# Sandbox Checkout Session (cs_test_...)
npm run order:pdf:sandbox -- cs_test_123

# Live Checkout Session, written to a chosen location
npm run order:pdf:live -- cs_live_123 --output=./orders/pvr-order.pdf

# Payment Intent IDs work too
npm run order:pdf:sandbox -- pi_123
```

The default output is `.generated/orders/order-<id>.pdf`, a gitignored local
directory. The command will not replace an existing file unless `--force` is supplied. The
template includes the PVR display and mono fonts, customer shipping details,
line items, shipping, discount, tax, and total. Like the shop sync commands,
the scripts obtain their corresponding Stripe key from 1Password.

### Stripe credentials via 1Password

The sync scripts pull secrets from 1Password at runtime using
`op run --env-file=.env.op`. `.env.op` contains only `op://` references (no
secrets), so it's safe to commit.

Create the two 1Password items the references point at (run these yourself so
the keys never leave your machine — paste your real Stripe keys in place of the
placeholders):

```bash
# Sandbox key (starts with sk_test_...)
op item create \
  --category="API Credential" \
  --vault="PVR" \
  --title="Stripe PVR Sandbox" \
  "secret key[password]=sk_test_REPLACE_ME"

# Live key (starts with sk_live_...)
op item create \
  --category="API Credential" \
  --vault="PVR" \
  --title="Stripe PVR Live" \
  "secret key[password]=sk_live_REPLACE_ME"
```

Then verify the references resolve:

```bash
op run --env-file=.env.op -- printenv STRIPE_SECRET_KEY_SANDBOX
```

If you keep the keys in a different vault or under different item names, update
`--vault=`/`--title=` above and edit the matching `op://` lines in `.env.op`.
(`op vault list` shows your vault names.)

### Notes

- Requires the [1Password CLI](https://developer.1password.com/docs/cli/) (`op`)
  installed and signed in. The scripts run on Node's native TypeScript support
  (Node 22+), so there's no build step.
- **Local checkout** — the `/api/create-checkout` route needs `STRIPE_SECRET_KEY`
  at runtime. Start the dev server with the sandbox key injected from 1Password:

  ```bash
  npm run dev   # = op run --env-file=.env.op -- npx netlify dev
  ```

  Plain `npm run develop` works for everything except placing an order. (In
  production, Netlify provides `STRIPE_SECRET_KEY` as the live key.)
- **Variants become separate Stripe products.** A product with variants syncs as
  one Stripe Product per variant, named `<product> — <variant>` (e.g. `PVR Tee —
  Large`), so the size shows on the Checkout page. The cart and lookup keys are
  unchanged.
- **Product images must be publicly reachable URLs** (Stripe can't host arbitrary
  product images for you). The sync points Stripe at the deployed site's `.webp`
  files, so run `npm run shop:images` first. A **brand-new** product's images
  aren't on the live site until you deploy — until then the product syncs without
  images (you'll see a warning) and picks them up on the next sync after deploy.
  To preview images before merging, sync against a public Netlify deploy-preview
  URL: `npm run shop:sync:sandbox -- --image-base=https://deploy-preview-NN--yoursite.netlify.app`.
  Images are only re-sent when their bytes or the base URL change (tracked via an
  `image_hash` on the Stripe product).
- Products are matched to Stripe by `metadata.pvr_id` (= the product `id`), so
  the same catalog maps cleanly onto both the sandbox and live accounts.
- The sync never archives Stripe products removed from `products.ts` — clean
  those up in the dashboard if needed.

## Audio Streaming

Audio files are hosted on Cloudflare R2. To use the audio player:

1. Upload MP3 to your R2 bucket
2. Make sure CORS is configured for your domain
3. Use the R2AudioPlayer component in your MDX

```jsx
<R2AudioPlayer
  url="https://pub-{bucket-id}.r2.dev/path/to/file.mp3"
  title="Episode Title"
  showDownload={true}
/>
```

## Deployment

The site is automatically deployed to Netlify when changes are pushed to the main branch.

### Environment Variables

Configure these in Netlify:
- Any API keys or secrets needed for builds

## Contributing

1. Create a new branch for your changes
2. Make your changes
3. Test locally with `npm run develop`
4. Create a pull request

## License

All rights reserved - Public Vinyl Radio

## Contact

For questions or support, contact the Public Vinyl Radio team.
