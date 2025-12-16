#!/bin/bash

# Migration script to reorganize shows into subdirectories
# Usage: ./scripts/migrate-shows.sh <show-slug>
# Example: ./scripts/migrate-shows.sh human-vibrations

set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/migrate-shows.sh <show-slug>"
  echo "Example: ./scripts/migrate-shows.sh human-vibrations"
  exit 1
fi

SHOW_SLUG="$1"
SHOWS_DIR="src/content/shows"
SHOW_MDX="${SHOWS_DIR}/${SHOW_SLUG}.mdx"
NEW_DIR="${SHOWS_DIR}/${SHOW_SLUG}"
GALLERY_DIR="${NEW_DIR}/gallery"

# Check if MDX file exists
if [ ! -f "$SHOW_MDX" ]; then
  echo "Error: ${SHOW_MDX} not found"
  exit 1
fi

echo "Migrating ${SHOW_SLUG}..."

# Create directories
mkdir -p "$NEW_DIR"
mkdir -p "$GALLERY_DIR"

# Move MDX file
mv "$SHOW_MDX" "${NEW_DIR}/index.mdx"
echo "✓ Moved MDX file to ${NEW_DIR}/index.mdx"

# Fix import paths (add one more ../ level since we moved into a subdirectory)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s|from '../../components/|from '../../../components/|g" "${NEW_DIR}/index.mdx"
else
  # Linux
  sed -i "s|from '../../components/|from '../../../components/|g" "${NEW_DIR}/index.mdx"
fi
echo "✓ Updated import paths in index.mdx"

echo ""
echo "Migration complete!"
echo ""
echo "Next steps:"
echo "1. Move the cover image to: ${NEW_DIR}/cover.jpg (or .png)"
echo "2. Move carousel images to: ${GALLERY_DIR}/"
echo "3. Update frontmatter in ${NEW_DIR}/index.mdx:"
echo "   coverImage: './cover.jpg'"
echo "   carouselImages:"
echo "     - './gallery/photo-1.jpg'"
echo "     - './gallery/photo-2.jpg'"
echo ""
echo "Example frontmatter:"
echo "---"
echo "title: 'Show Title'"
echo "slug: '${SHOW_SLUG}'"
echo "coverImage: './cover.jpg'"
echo "carouselImages:"
echo "  - './gallery/photo-1.jpg'"
echo "  - './gallery/photo-2.jpg'"
echo "  - './gallery/photo-3.jpg'"
echo "---"
