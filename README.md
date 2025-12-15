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
