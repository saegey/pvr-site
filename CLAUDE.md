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
│   │   ├── image-carousel.tsx       # Image gallery carousel
│   │   ├── spotify.tsx              # Spotify embed component
│   │   ├── youtube.tsx              # YouTube embed component
│   │   ├── track-card.tsx           # Individual track display
│   │   └── ...
│   ├── content/
│   │   └── shows/         # Show directories with MDX files
│   │       ├── show-name/
│   │       │   ├── index.mdx        # Show content
│   │       │   ├── cover.jpg        # Cover image
│   │       │   └── gallery/         # Carousel images
│   │       └── ...
│   ├── templates/
│   │   └── show-template.tsx        # Template for show pages
│   ├── pages/             # Gatsby pages
│   └── gatsby-types.d.ts  # Auto-generated TypeScript types
├── scripts/
│   └── migrate-shows.sh   # Helper script to migrate shows to new structure
├── gatsby-config.ts       # Gatsby configuration
├── gatsby-node.ts         # Gatsby Node API customization
├── MIGRATION_GUIDE.md     # Guide for migrating to organized structure
└── package.json
```

## Key Components

### Audio Players

#### R2AudioPlayer (`src/components/r2-audio-player.tsx`)
Streams MP3 files from Cloudflare R2 buckets.

**Usage in MDX:**
```jsx
import R2AudioPlayer from '../../../components/r2-audio-player';

<R2AudioPlayer
  url="https://pub-xxx.r2.dev/audio.mp3"
  title="Episode Title"
  showDownload={true}
/>
```

**Note:** Import path uses `../../../` since shows are now organized in subdirectories (`shows/show-name/index.mdx`).

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

### Image Carousel

#### ImageCarousel (`src/components/image-carousel.tsx`)
Display a gallery of images with thumbnail navigation using react-image-gallery.

**Usage in MDX:**
```jsx
import ImageCarousel from '../../../components/image-carousel';

<ImageCarousel
  images={[
    { original: './gallery/photo-1.jpg', thumbnail: './gallery/photo-1.jpg' },
    { original: './gallery/photo-2.jpg', thumbnail: './gallery/photo-2.jpg' }
  ]}
  showThumbnails={true}
  autoPlay={false}
/>
```

**Features:**
- Thumbnail navigation
- Fullscreen mode
- Keyboard navigation
- Touch/swipe support
- Lazy loading
- Responsive design

**Note:** The carousel automatically appears on show pages when `carouselImages` is specified in frontmatter.

### Embed Components

- **ResponsiveYouTube** - YouTube video embeds
- **SpotifyEmbed** - Spotify playlist embeds
- **AppleMusic** - Apple Music embeds

## Show/Episode Structure

Shows are organized in subdirectories under `src/content/shows/`. Each show has its own folder containing:
- `index.mdx` - Show content and metadata
- `cover.jpg` (or `.png`) - Main cover image
- `gallery/` - Directory for carousel images

**Example structure:**
```
shows/
├── human-vibrations/
│   ├── index.mdx
│   ├── cover.jpg
│   └── gallery/
│       ├── photo-1.jpg
│       ├── photo-2.jpg
│       └── photo-3.jpg
```

### Migrating Existing Shows

Use the migration script to reorganize existing flat-file shows:
```bash
./scripts/migrate-shows.sh show-slug
```

See `MIGRATION_GUIDE.md` for detailed migration instructions.

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
coverImage: './cover.jpg'  # Relative to show directory
carouselImages:  # Optional: array of gallery images
  - './gallery/photo-1.jpg'
  - './gallery/photo-2.jpg'
  - './gallery/photo-3.jpg'
youtubeId: 'videoId'  # Optional YouTube embed
---
```

### Show Template Behavior:
- If `youtubeId` exists → displays YouTube video
- If no `youtubeId` but `coverImage` exists → displays cover image
- Both use optimized Gatsby Image processing

### Example Show File:
**File:** `shows/human-vibrations/index.mdx`

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
coverImage: './cover.jpg'
carouselImages:
  - './gallery/event-1.jpg'
  - './gallery/event-2.jpg'
  - './gallery/speakers.jpg'
---

import R2AudioPlayer from '../../../components/r2-audio-player';

<R2AudioPlayer
  url="https://pub-xxx.r2.dev/audio.mp3"
  title="Human Vibrations"
/>

## About This Mix
Content here...
```

**Note:** The carousel will automatically appear between the MDX content and tracklist when `carouselImages` is specified.

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

1. **MDX Components:** Components must be imported at the top of MDX files with `../../../components/` path
2. **Images:** Place images in show directory or `gallery/` subdirectory, reference with `./filename.jpg`
3. **Icons:** Use `react-icons/io5` for consistent iconography
4. **Mobile Responsiveness:** Volume controls hidden on mobile, time display always visible
5. **TypeScript:** Gatsby auto-generates types from GraphQL queries
6. **Show Visibility:** Use `isActive: false` to hide shows from listings while keeping them accessible via URL
7. **Directory Structure:** Each show now has its own directory with `index.mdx`, `cover.jpg`, and optional `gallery/`

## Common Tasks

### Adding a New Show
1. Create show directory: `mkdir -p src/content/shows/show-name/gallery`
2. Create `index.mdx` file in the show directory
3. Add frontmatter with required fields
4. Add cover image as `cover.jpg` (or `.png`) in show directory
5. Add gallery images to `gallery/` subdirectory (optional)
6. Import components with `../../../components/` path
7. Set `isActive: false` for draft shows

**Quick template:**
```bash
mkdir -p src/content/shows/my-show/gallery
touch src/content/shows/my-show/index.mdx
# Add your cover.jpg and gallery images
```

### Migrating an Existing Show
1. Run migration script: `./scripts/migrate-shows.sh show-slug`
2. Move cover image to show directory as `cover.jpg`
3. Move gallery photos to `gallery/` subdirectory
4. Update frontmatter paths (script handles import paths automatically)
5. Add `carouselImages` array to frontmatter if using gallery

See `MIGRATION_GUIDE.md` for detailed instructions.

### Adding Carousel Images to a Show
1. Place images in the show's `gallery/` directory
2. Add `carouselImages` array to frontmatter:
   ```yaml
   carouselImages:
     - './gallery/photo-1.jpg'
     - './gallery/photo-2.jpg'
   ```
3. Carousel will automatically appear between content and tracklist

### Updating Audio Player
- Single player: `src/components/r2-audio-player.tsx`
- Playlist player: `src/components/r2-playlist-player.tsx`
- Carousel: `src/components/image-carousel.tsx`
- Icons from `react-icons/io5`
- Responsive hiding: `display: ['none', 'block']`

### Working with Images
- Use `coverImage: './cover.jpg'` in frontmatter (relative to show directory)
- Use `carouselImages: ['./gallery/photo-1.jpg']` for gallery images
- Gatsby automatically optimizes all images
- Show template displays cover image if no YouTube video
- Carousel appears automatically when `carouselImages` is specified

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

**Import Errors After Migration:**
- Component imports need `../../../components/` path (three levels up)
- Migration script automatically fixes this for `../../components/` imports
- Manually update any other import paths if needed

**Carousel Images Not Showing:**
- Check that images exist in the `gallery/` directory
- Verify paths in `carouselImages` array start with `./`
- Clear Gatsby cache: `gatsby clean && gatsby develop`
- Check browser console for GraphQL or image loading errors
