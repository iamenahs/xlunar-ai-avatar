#!/bin/bash
#
# Download Mixamo animations and convert them to VRMA format for use with VRM avatars.
#
# This script helps you build a comprehensive animation library by downloading
# free mocap animations from Mixamo (Adobe) and converting them to .vrma files.
#
# Prerequisites:
#   - Node.js 18+
#   - A free Adobe/Mixamo account (https://www.mixamo.com/)
#
# Usage:
#   1. Go to https://www.mixamo.com/ and sign in
#   2. Search for an animation (e.g., "Walking", "Sitting Down", "Dancing")
#   3. Click "Download" with these settings:
#        Format: FBX Binary (.fbx)
#        Skin: Without Skin
#        Keyframe Reduction: none
#   4. Save the .fbx file to the downloads/ folder
#   5. Run this script: ./scripts/download-mixamo-animations.sh
#
# Alternatively, use the online converter at https://3dretarget.com/mixamo-fbx-to-vrma
# or the GitHub tool: https://github.com/tk256ailab/fbx2vrma-converter

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ANIMATIONS_DIR="$PROJECT_DIR/public/animations"
DOWNLOADS_DIR="$PROJECT_DIR/downloads"

echo "=== Mixamo → VRMA Animation Pipeline ==="
echo ""
echo "Animation output directory: $ANIMATIONS_DIR"
echo ""

# Create downloads directory if it doesn't exist
mkdir -p "$DOWNLOADS_DIR"

# Check if fbx2vrma converter is available
if ! command -v npx &> /dev/null; then
  echo "Error: npx not found. Please install Node.js 18+."
  exit 1
fi

# Check for .fbx files in downloads/
FBX_FILES=$(find "$DOWNLOADS_DIR" -name "*.fbx" -type f 2>/dev/null | sort)

if [ -z "$FBX_FILES" ]; then
  echo "No .fbx files found in $DOWNLOADS_DIR"
  echo ""
  echo "To get started:"
  echo "  1. Visit https://www.mixamo.com/ and sign in (free account)"
  echo "  2. Browse or search for animations"
  echo "  3. Download as FBX Binary (.fbx), Without Skin"
  echo "  4. Save to: $DOWNLOADS_DIR/"
  echo "  5. Re-run this script"
  echo ""
  echo "=== Recommended Mixamo Animations for AI Companions ==="
  echo ""
  echo "  IDLE / STANDING:"
  echo "    - Happy Idle            - Idle"
  echo "    - Bored Idle            - Nervous Idle"
  echo "    - Weight Shift          - Standing Idle"
  echo ""
  echo "  WALKING / MOVEMENT:"
  echo "    - Walking               - Slow Walk"
  echo "    - Confident Walk        - Sneaking Walk"
  echo "    - Sad Walk              - Happy Walk"
  echo "    - Running               - Jogging"
  echo ""
  echo "  SITTING:"
  echo "    - Sitting Down          - Standing Up From Chair"
  echo "    - Sitting Idle          - Sitting Talking"
  echo "    - Sitting Bored         - Sitting Clapping"
  echo ""
  echo "  EMOTIONAL REACTIONS:"
  echo "    - Laughing              - Crying"
  echo "    - Surprised             - Angry"
  echo "    - Defeated              - Excited"
  echo "    - Bashful               - Terrified"
  echo ""
  echo "  CONVERSATION:"
  echo "    - Talking               - Arguing"
  echo "    - Agreeing              - Explaining"
  echo "    - Yelling               - Whispering"
  echo ""
  echo "  DANCING:"
  echo "    - Hip Hop Dancing       - Samba Dancing"
  echo "    - Macarena              - Swing Dancing"
  echo "    - Salsa Dancing         - Gangnam Style"
  echo ""
  echo "  OTHER ACTIONS:"
  echo "    - Sleeping              - Waking Up"
  echo "    - Stretching            - Yawning"
  echo "    - Looking Around        - Praying"
  echo "    - Clapping              - Push Ups"
  echo "    - Jumping               - Falling"
  echo "    - Picking Up Object     - Throwing"
  echo ""
  echo "=== Alternative: Online Converter ==="
  echo ""
  echo "  You can also convert FBX to VRMA online at:"
  echo "    https://3dretarget.com/mixamo-fbx-to-vrma"
  echo "  Then place the .vrma files directly in public/animations/"
  echo ""
  exit 0
fi

echo "Found $(echo "$FBX_FILES" | wc -l | tr -d ' ') FBX files to convert:"
echo ""

CONVERTED=0
FAILED=0

while IFS= read -r fbx_file; do
  filename=$(basename "$fbx_file" .fbx)
  output_file="$ANIMATIONS_DIR/${filename}.vrma"

  if [ -f "$output_file" ]; then
    echo "  [SKIP] $filename.vrma (already exists)"
    continue
  fi

  echo -n "  [CONVERTING] $filename.fbx → $filename.vrma ... "

  # Try using fbx2vrma-converter via npx
  if npx --yes fbx2vrma-converter "$fbx_file" "$output_file" 2>/dev/null; then
    echo "OK"
    CONVERTED=$((CONVERTED + 1))
  else
    echo "FAILED"
    echo "    Try the online converter: https://3dretarget.com/mixamo-fbx-to-vrma"
    FAILED=$((FAILED + 1))
  fi
done <<< "$FBX_FILES"

echo ""
echo "=== Done ==="
echo "  Converted: $CONVERTED"
echo "  Failed:    $FAILED"
echo ""

if [ "$CONVERTED" -gt 0 ]; then
  echo "Next step: Add entries to src/lib/avatar/config/animations.ts"
  echo ""
  echo "Example entry:"
  echo '  {'
  echo '    id: "mixamo-walking",'
  echo '    name: "Walking",'
  echo '    url: "/animations/Walking.vrma",'
  echo '    description: "Natural walking animation from Mixamo",'
  echo '    category: "action",'
  echo '    loop: true,'
  echo '  },'
fi
