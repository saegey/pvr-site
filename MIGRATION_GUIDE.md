# Shows Migration Guide

## Migrating to Organized Folder Structure

This guide helps you reorganize your shows from a flat structure to organized subdirectories.

## New Structure

```
src/content/shows/
├── human-vibrations/
│   ├── index.mdx              # Show content (was human-vibrations.mdx)
│   ├── cover.jpg              # Main cover image
│   └── gallery/               # Carousel/gallery images
│       ├── photo-1.jpg
│       ├── photo-2.jpg
│       └── photo-3.jpg
```

## Migration Steps

### Option 1: Automated Migration (Partial)

Use the migration script to create the directory structure:

```bash
./scripts/migrate-shows.sh human-vibrations
```

This will:
- Create `shows/human-vibrations/` directory
- Create `shows/human-vibrations/gallery/` directory
- Move `human-vibrations.mdx` to `human-vibrations/index.mdx`
- Automatically fix import paths (adds one more `../` level)

Then manually:
1. Move cover image to `human-vibrations/cover.jpg`
2. Move carousel photos to `human-vibrations/gallery/`
3. Update frontmatter paths (see below)

### Option 2: Manual Migration

For each show:

1. **Create directory structure:**
   ```bash
   mkdir -p src/content/shows/human-vibrations/gallery
   ```

2. **Move MDX file:**
   ```bash
   mv src/content/shows/human-vibrations.mdx src/content/shows/human-vibrations/index.mdx
   ```

3. **Move cover image:**
   ```bash
   mv src/content/shows/DSC01720.jpeg src/content/shows/human-vibrations/cover.jpg
   ```

4. **Move gallery images:**
   ```bash
   mv src/content/shows/event-photo-*.jpg src/content/shows/human-vibrations/gallery/
   ```

5. **Update frontmatter** in `index.mdx`:

   **Before:**
   ```yaml
   coverImage: './DSC01720.jpeg'
   ```

   **After:**
   ```yaml
   coverImage: './cover.jpg'
   carouselImages:
     - './gallery/photo-1.jpg'
     - './gallery/photo-2.jpg'
     - './gallery/photo-3.jpg'
   ```

## Updated Frontmatter Format

```yaml
---
title: 'Human Vibrations — Live at Human People Brewing'
description: 'A packed, cozy night in Roosevelt'
episode: 1
date: '2025-12-14'
tags: ['Cumbia', 'Latin', 'Disco']
slug: 'human-vibrations'
host: ['Saegey', 'TOPYEN']
template: show
isActive: true
coverImage: './cover.jpg'           # Relative to the show's directory
carouselImages:                      # Array of gallery images
  - './gallery/photo-1.jpg'
  - './gallery/photo-2.jpg'
  - './gallery/photo-3.jpg'
  - './gallery/photo-4.jpg'
---
```

## Creating New Shows

When creating a new show, use this structure from the start:

```bash
# Create directories
mkdir -p src/content/shows/my-new-show/gallery

# Create MDX file
touch src/content/shows/my-new-show/index.mdx

# Add images
cp ~/Photos/cover.jpg src/content/shows/my-new-show/
cp ~/Photos/gallery/*.jpg src/content/shows/my-new-show/gallery/
```

## Benefits

✓ **Organized** - All show assets in one place
✓ **Scalable** - Easy to add more asset types (PDFs, audio files, etc.)
✓ **Clean** - No more mixed files in the shows directory
✓ **Flexible** - Can add show-specific folders like `downloads/`, `press/`, etc.

## Troubleshooting

**Images not showing after migration?**
- Check that image paths in frontmatter start with `./`
- Verify files exist in the new locations
- Run `gatsby clean && gatsby develop` to rebuild

**GraphQL errors?**
- Make sure you updated `gatsby-node.ts` with the `carouselImages` field
- Check that frontmatter uses array syntax for `carouselImages`

**Build fails?**
- Ensure all image files referenced in frontmatter actually exist
- Check for typos in file paths
