#!/usr/bin/env bash
#
# Batch-export Pixelmator Pro .pxd files to a web format, straight from the
# lossless masters (no recompression). Re-running only re-exports files whose
# .pxd is newer than the existing output.
#
# Usage:
#   scripts/pxd-export.sh <src-dir> [--format webp|jpeg|png] [--quality 1-100]
#                          [--width <px>] [--out <dir>] [--subdir <name>] [--force]
#
# The <src-dir> may appear in any position (so `npm run ... -- <dir>` works).
# --width downscales (Lanczos) to that pixel width, keeping aspect ratio. The
# resize happens on an in-memory copy only; the .pxd masters are never touched.
# --subdir writes into <src-dir>/<name>; --out sets an explicit output dir.
#
# Examples:
#   scripts/pxd-export.sh ~/Pictures/pvr-masters                 # WebP q90, full size, next to each .pxd
#   scripts/pxd-export.sh ~/Pictures/pvr-masters --width 2560 --subdir web
#   scripts/pxd-export.sh ~/Pictures/pvr-masters --format jpeg --quality 90 --width 1440 --subdir instagram
#
set -euo pipefail

FORMAT="webp"
QUALITY="90"
OUT=""
SUBDIR=""
FORCE="0"
WIDTH="0"
SRC=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --format)  FORMAT="$2"; shift 2 ;;
    --quality) QUALITY="$2"; shift 2 ;;
    --width)   WIDTH="$2"; shift 2 ;;
    --out)     OUT="$2"; shift 2 ;;
    --subdir)  SUBDIR="$2"; shift 2 ;;
    --force)   FORCE="1"; shift ;;
    -*) echo "Unknown flag: $1" >&2; exit 1 ;;
    *) SRC="$1"; shift ;;
  esac
done

[[ -n "$SRC" ]] || { echo "Usage: pxd-export.sh <src-dir> [--format webp|jpeg|png] [--quality N] [--width px] [--out dir] [--subdir name] [--force]" >&2; exit 1; }
[[ -d "$SRC" ]] || { echo "Not a directory: $SRC" >&2; exit 1; }

# --subdir puts outputs in <src>/<name>; an explicit --out wins if both are set.
[[ -z "$OUT" && -n "$SUBDIR" ]] && OUT="$SRC/$SUBDIR"

case "$FORMAT" in
  webp) EXT="webp"; PMFORMAT="WebP" ;;
  jpeg|jpg) EXT="jpg"; PMFORMAT="JPEG" ;;
  png) EXT="png"; PMFORMAT="PNG" ;;
  *) echo "Unsupported format: $FORMAT (use webp|jpeg|png)" >&2; exit 1 ;;
esac

shopt -s nullglob nocaseglob
FILES=("$SRC"/*.pxd)
(( ${#FILES[@]} )) || { echo "No .pxd files in $SRC"; exit 0; }

for src in "${FILES[@]}"; do
  base="$(basename "${src%.*}")"
  dir="${OUT:-$(dirname "$src")}"
  mkdir -p "$dir"
  # Pixelmator's `POSIX file` won't resolve relative paths against the shell's
  # CWD, so make both source and destination absolute.
  dir="$(cd "$dir" && pwd)"
  src="$(cd "$(dirname "$src")" && pwd)/$(basename "$src")"
  dest="$dir/$base.$EXT"

  if [[ "$FORCE" == "0" && -f "$dest" && "$dest" -nt "$src" ]]; then
    echo "skip  $base.$EXT (up to date)"
    continue
  fi

  echo "export $base -> $dest"
  osascript - "$src" "$dest" "$PMFORMAT" "$QUALITY" "$WIDTH" <<'APPLESCRIPT'
on run argv
  set srcPath to item 1 of argv
  set destPath to item 2 of argv
  set fmtName to item 3 of argv
  set q to (item 4 of argv) as integer
  set targetWidth to (item 5 of argv) as integer

  set srcFile to POSIX file srcPath
  set destFile to POSIX file destPath

  tell application "Pixelmator Pro"
    set doc to open srcFile
    if targetWidth > 0 then
      resize image doc width targetWidth algorithm lanczos
    end if
    if fmtName is "WebP" then
      export for web doc to destFile as WebP with properties {compression factor:q, convert to sRGB:true}
    else if fmtName is "JPEG" then
      export for web doc to destFile as JPEG with properties {compression factor:q, convert to sRGB:true}
    else
      export for web doc to destFile as PNG with properties {convert to sRGB:true, advanced compression:true}
    end if
    close doc saving no
  end tell
end run
APPLESCRIPT
done

echo "done."
