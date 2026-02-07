# Game Assets - License & Credits

## Background Assets

### Source: Kenney.nl
- **Asset Pack**: [Background Elements](https://kenney.nl/assets/background-elements)
- **License**: CC0 1.0 Universal (Public Domain)
- **Author**: Kenney (www.kenney.nl)

### Files Used:
```
assets/bg/
├── far.png      # Far mountain layer (backgroundColorForest.png or similar)
├── mid.png      # Mid mountain layer
└── near.png     # Near trees/hills layer
```

## Tile Assets

### Source: Kenney.nl
- **Asset Pack**: [Pixel Platformer](https://kenney.nl/assets/pixel-platformer)
- **License**: CC0 1.0 Universal (Public Domain)
- **Author**: Kenney (www.kenney.nl)

### Files Used:
```
assets/tiles/
├── ground.png         # Ground tile with grass top
├── ground_dirt.png    # Dirt variation
└── ground_snow.png    # Snow variation (for snow zone)
```

---

## Download Instructions

### Option 1: Direct Download
1. Visit https://kenney.nl/assets/background-elements
2. Click "Download" → Extract ZIP
3. Copy relevant PNG files to `public/assets/bg/`

4. Visit https://kenney.nl/assets/pixel-platformer
5. Click "Download" → Extract ZIP
6. Copy tile PNGs to `public/assets/tiles/`

### Option 2: Using curl
```bash
# Background Elements
curl -L -o bg-elements.zip "https://kenney.nl/media/pages/assets/background-elements/745b2cf17f-1677493935/kenney_background-elements.zip"
unzip bg-elements.zip -d temp_bg
cp temp_bg/PNG/backgroundColorForest.png public/assets/bg/far.png
# ... copy other files as needed

# Pixel Platformer
curl -L -o pixel-platformer.zip "https://kenney.nl/media/pages/assets/pixel-platformer/407f62ecf1-1677495999/kenney_pixel-platformer.zip"
unzip pixel-platformer.zip -d temp_tiles
cp temp_tiles/Tiles/tile_0000.png public/assets/tiles/ground.png
# ... copy other files as needed
```

---

## License Summary

**CC0 1.0 Universal (Public Domain Dedication)**

You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.

More info: https://creativecommons.org/publicdomain/zero/1.0/
