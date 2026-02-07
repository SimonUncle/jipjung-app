#!/bin/bash

# Climb Focus - Asset Download Script
# Downloads free CC0 assets from Kenney.nl

set -e

ASSETS_DIR="public/assets"
TEMP_DIR="temp_assets"

echo "📦 Downloading game assets from Kenney.nl..."
echo "License: CC0 1.0 (Public Domain)"
echo ""

# Create directories
mkdir -p "$ASSETS_DIR/bg"
mkdir -p "$ASSETS_DIR/tiles"
mkdir -p "$TEMP_DIR"

# Download Background Elements
echo "⬇️  Downloading Background Elements..."
curl -L -o "$TEMP_DIR/bg-elements.zip" \
  "https://kenney.nl/media/pages/assets/background-elements/745b2cf17f-1677493935/kenney_background-elements.zip" \
  2>/dev/null

unzip -q "$TEMP_DIR/bg-elements.zip" -d "$TEMP_DIR/bg"

# Copy background files
cp "$TEMP_DIR/bg/PNG/backgroundColorForest.png" "$ASSETS_DIR/bg/far.png"
cp "$TEMP_DIR/bg/PNG/backgroundColorFall.png" "$ASSETS_DIR/bg/mid.png"
cp "$TEMP_DIR/bg/PNG/backgroundColorDesert.png" "$ASSETS_DIR/bg/desert.png"
cp "$TEMP_DIR/bg/PNG/backgroundColorGrass.png" "$ASSETS_DIR/bg/grass.png"

echo "✅ Background assets copied"

# Download Pixel Platformer
echo "⬇️  Downloading Pixel Platformer tiles..."
curl -L -o "$TEMP_DIR/pixel-platformer.zip" \
  "https://kenney.nl/media/pages/assets/pixel-platformer/407f62ecf1-1677495999/kenney_pixel-platformer.zip" \
  2>/dev/null

unzip -q "$TEMP_DIR/pixel-platformer.zip" -d "$TEMP_DIR/tiles"

# Copy tile files
cp "$TEMP_DIR/tiles/Tiles/tile_0000.png" "$ASSETS_DIR/tiles/ground_grass.png"
cp "$TEMP_DIR/tiles/Tiles/tile_0001.png" "$ASSETS_DIR/tiles/ground_dirt.png"
cp "$TEMP_DIR/tiles/Tiles/tile_0020.png" "$ASSETS_DIR/tiles/ground_snow.png" 2>/dev/null || true
cp "$TEMP_DIR/tiles/Tiles/tile_0048.png" "$ASSETS_DIR/tiles/ground_sand.png" 2>/dev/null || true

echo "✅ Tile assets copied"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 All assets downloaded successfully!"
echo "   Location: $ASSETS_DIR/"
echo ""
echo "📝 License: CC0 1.0 Universal (Public Domain)"
echo "   Credit: Kenney (www.kenney.nl)"
