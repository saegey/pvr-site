# Public Vinyl Radio - Claude Documentation

This document provides context for Claude Code when working with the Public Vinyl Radio website.

## Project Overview

Public Vinyl Radio is a Seattle-based music collective showcasing DJ sets, radio shows, and live performances. This is the public-facing website built with Gatsby and hosted on Netlify.

**Live Site:** Public Vinyl Radio (deployed on Netlify)
**Tech Stack:** Gatsby 5, TypeScript, Theme UI, React, MDX

## Project Structure

```
pvr-site/
├── src/
│   ├── components/        # React components
│   │   ├── r2-audio-player.tsx      # Cloudflare R2 audio streaming player
│   │   ├── r2-playlist-player.tsx   # Multi-track playlist player
│   │   ├── spotify.tsx              # Spotify embed component
│   │   ├── youtube.tsx              # YouTube embed component
│   │   ├── track-card.tsx           # Individual track display
│   │   └── ...
│   ├── content/
│   │   └── shows/         # MDX files for radio shows/episodes
│   ├── templates/
│   │   └── show-template.tsx        # Template for show pages
│   ├── pages/             # Gatsby pages
│   └── gatsby-types.d.ts  # Auto-generated TypeScript types
├── gatsby-config.ts       # Gatsby configuration
├── gatsby-node.ts         # Gatsby Node API customization
└── package.json
```

## Key Components

### Audio Players

#### R2AudioPlayer (`src/components/r2-audio-player.tsx`)
Streams MP3 files from Cloudflare R2 buckets.

**Usage in MDX:**
```jsx
import R2AudioPlayer from '../../components/r2-audio-player';

<R2AudioPlayer
  url="https://pub-xxx.r2.dev/audio.mp3"
  title="Episode Title"
  showDownload={true}
/>
```

**Features:**
- Play/pause controls
- Seek bar with time display
- Volume controls (hidden on mobile)
- Download button (optional)
- Dark/light mode support
- Professional icons from react-icons/io5

#### R2PlaylistPlayer (`src/components/r2-playlist-player.tsx`)
Multi-track playlist player with track navigation.

**Usage:**
```jsx
import R2PlaylistPlayer from '../../components/r2-playlist-player';

<R2PlaylistPlayer
  tracks={[
    { url: "https://...", title: "Track 1", artist: "Artist 1" },
    { url: "https://...", title: "Track 2", artist: "Artist 2" }
  ]}
  autoplay={false}
  showDownload={true}
/>
```

**Features:**
- Previous/Next track navigation
- Automatic playlist progression
- Track list display with click-to-play
- All features from R2AudioPlayer

### Embed Components

- **ResponsiveYouTube** - YouTube video embeds
- **SpotifyEmbed** - Spotify playlist embeds
- **AppleMusic** - Apple Music embeds

## Show/Episode Structure

Shows are stored as MDX files in `src/content/shows/`. Each show has frontmatter metadata and can include custom React components.

### Required Frontmatter Fields:
```yaml
---
title: 'Show Title'
description: 'Show description'
episode: 1
date: '2025-12-14'
tags: ['Genre1', 'Genre2']
slug: 'show-slug'
host: ['DJ Name']
template: show
isActive: true  # Set to false to hide from listings
coverImage: './image.jpg'  # Optional, displayed if no youtubeId
youtubeId: 'videoId'  # Optional YouTube embed
---
```

### Show Template Behavior:
- If `youtubeId` exists → displays YouTube video
- If no `youtubeId` but `coverImage` exists → displays cover image
- Both use optimized Gatsby Image processing

### Example Show File:
```mdx
---
title: 'Human Vibrations'
description: 'A groovy mix'
episode: 1
date: '2025-12-14'
tags: ['Cumbia', 'Disco', 'Funk']
slug: 'human-vibrations'
host: ['Saegey', 'TOPYEN']
template: show
isActive: true
coverImage: './DSC01720.jpeg'
---

import R2AudioPlayer from '../../components/r2-audio-player';

<R2AudioPlayer
  url="https://pub-xxx.r2.dev/audio.mp3"
  title="Human Vibrations"
/>

## About This Mix
Content here...
```

## Cloudflare R2 Integration

Audio files are hosted on Cloudflare R2 (object storage).

**R2 URL Format:** `https://pub-{bucket-id}.r2.dev/path/to/file.mp3`

### CORS Configuration Required:
```json
[
  {
    "AllowedOrigins": ["https://your-site.netlify.app", "http://localhost:8000"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Length", "Content-Range"],
    "MaxAgeSeconds": 3600
  }
]
```

## Styling

**Theme System:** Theme UI
- Colors, typography, and spacing defined in theme configuration
- `sx` prop for component-level styling
- Responsive arrays: `[mobile, tablet, desktop]`
- Color modes: automatic dark/light theme switching

**Example Responsive Styling:**
```tsx
<Box sx={{
  display: ['none', 'flex'],  // hidden on mobile, flex on tablet+
  padding: [2, 3, 4],          // 2 on mobile, 3 on tablet, 4 on desktop
}}>
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run develop
# Site runs at http://localhost:8000

# Build for production
npm run build

# Serve production build
npm run serve

# Type checking
npm run typecheck
```

## Git Workflow

- Main branch: `main`
- Current branch: `acc` (or check `git branch`)
- `.DS_Store` files are gitignored with `**/.DS_Store`
- To remove tracked `.DS_Store` files:
  ```bash
  find . -name .DS_Store -print0 | xargs -0 git rm -f --ignore-unmatch --cached
  ```

## Important Notes

1. **MDX Components:** Components must be imported at the top of MDX files
2. **Images:** Place images alongside MDX files, reference with `./filename.jpg`
3. **Icons:** Use `react-icons/io5` for consistent iconography
4. **Mobile Responsiveness:** Volume controls hidden on mobile, time display always visible
5. **TypeScript:** Gatsby auto-generates types from GraphQL queries
6. **Show Visibility:** Use `isActive: false` to hide shows from listings while keeping them accessible via URL

## Common Tasks

### Adding a New Show
1. Create MDX file in `src/content/shows/`
2. Add frontmatter with required fields
3. Add cover image to same directory
4. Use R2AudioPlayer component for audio streaming
5. Set `isActive: false` for draft shows

### Updating Audio Player
- Single player: `src/components/r2-audio-player.tsx`
- Playlist player: `src/components/r2-playlist-player.tsx`
- Icons from `react-icons/io5`
- Responsive hiding: `display: ['none', 'block']`

### Working with Images
- Use `coverImage: './filename.jpg'` in frontmatter
- Gatsby automatically optimizes images
- Show template displays image if no YouTube video

## Troubleshooting

**TypeScript Errors on `sx` prop:**
- These are warnings from Theme UI's sx prop
- Safe to ignore - the code works correctly
- Theme UI extends HTML elements with the `sx` prop

**Audio Not Playing:**
- Check R2 bucket CORS configuration
- Verify URL is publicly accessible
- Check browser console for CORS errors

**Show Not Appearing in Listings:**
- Check `isActive: true` in frontmatter
- Verify `template: show` is set
- Clear Gatsby cache: `gatsby clean && gatsby develop`
