# Beecroft Valley 🌾

A charming web-based farming and life simulation game set in the beautiful suburb of Beecroft, NSW, Australia.

## About

Beecroft Valley is inspired by games like Stardew Valley, bringing the peaceful lifestyle of Beecroft to life. Based on the **real map and landmarks** of Beecroft, NSW, this game features a **geographically accurate** recreation using Beecroft Railway Station as the central origin point. Tend to your garden, explore local landmarks, chat with friendly neighbors, and encounter Australian wildlife in this relaxing browser-based game!

## Features

- 🗺️ **Geographically Accurate Map** - Explore a huge **500×500 tile map** with Beecroft Railway Station as the origin point (250, 250)
- 📍 **Precise Locations** - All buildings, roads, and landmarks positioned using accurate coordinates from real Beecroft
- 🛣️ **Authentic Road Network** - Navigate Beecroft Road, Hannah Street, Chapman Avenue, Copeland Road, Sutherland Road, Wongala Crescent, Albert Road, Welham Street, and more
- 🚂 **Real Landmarks** - Visit 35+ actual Beecroft locations including:
  - Railway station, schools, medical centres, cafes, restaurants, parks
  - Fire Station, Presbyterian Church, Community Centre
  - Tennis courts, Cheltenham Oval, parking areas
  - Real residential addresses (19 Albert Rd, 27 Welham St)
- 🌳 **Very Leafy Suburb** - Experience Beecroft's famously dense tree coverage with 30+ forested areas and thousands of procedural trees
- 👥 **Diverse NPCs** - Meet locals including cafe owners, doctors, teachers, coaches, shop owners, and residents positioned at their real-world locations
- 🦜 **Australian Wildlife** - Encounter authentic Australian animals:
  - 🦜 Kookaburras perching in trees
  - 🦜 Rainbow Lorikeets flying between parks
  - 🐦 Magpies hopping on grass
  - 🦎 Blue-tongue Lizards sunning on paths
  - 🐱 Cats wandering residential areas
  - 🐕 Dogs playing near homes
- 🏫 **Historic Schools** - Beecroft Public School (est. 1897), Cheltenham Girls' High School, Cheltenham Early Education Centre, Smart Cookies Early Learning Centre
- 🏥 **Medical Services** - HerGP Medical Clinic (Dr. Shin Li), Beecroft Veterinary Clinic
- 🛒 **Shopping & Dining** - Woolworths, Hannah's Beecroft, The Beehive Cafe, Chargrill Charlie's, Yo Sushi, The Verandah, Vintage Cellars, Love Pilates
- 🎾 **Recreation** - Tennis Courts 1 & 2, Cheltenham Oval, Railway Station Gardens, Village Green, Malton Road Playground
- 🗺️ **Navigation Tools** - Built-in mini-map and location indicator to help you navigate the expansive map
- 🎮 **Browser-based** - No installation required!

## Controls

- **Arrow Keys** or **WASD** - Move your character
- **Space** - Talk to NPCs and interact with buildings
- **E** - Use currently selected tool
- **Mouse Click** - Select tools from toolbar

## Real Beecroft Locations

### Central Station Area (Origin: 250, 250)
- **Beecroft Railway Station** (245, 246) - Main transport hub with east-west platforms, 10x8 tiles
- **HerGP Medical Clinic** (240, 240) - Northwest of station, run by Dr. Shin Li, 6x5 tiles
- **Beecroft Veterinary Clinic** (262, 245) - East of station, 5x4 tiles
- **Smart Cookies Early Learning Centre** (245, 235) - Near Chapman Ave, 7x6 tiles

### Hannah Street Shopping Strip (y≈255)
- **Woolworths Beecroft** (255, 253) - Largest building at 10x8 tiles
- **Hannah's Beecroft** (245, 255) - Popular restaurant, 5x4 tiles
- **The Beehive Cafe** (248, 252) - Local landmark owned by Mrs. Chen, 5x4 tiles
- **Chargrill Charlie's** (265, 255) - Grill restaurant, 4x4 tiles
- **Yo Sushi** (260, 256) - Japanese restaurant, 4x3 tiles
- **Vintage Cellars Beecroft** (252, 260) - Bottle shop, 5x4 tiles
- **Love Pilates Beecroft** (243, 258) - Fitness studio, 4x3 tiles
- **Beecroft Station Parking** - Two parking areas south of station, 8x6 tiles each

### Schools (Spread Across Map)
- **Beecroft Public School** (220, 280) - Historic school est. 1897, 12x10 tiles
- **Cheltenham Girls' High School** (290, 290) - Large school, 15x12 tiles
- **Cheltenham Early Education Centre** (285, 295) - Near Cheltenham Girls, 6x5 tiles
- **The Verandah Beecroft** (218, 285) - Cafe near Beecroft Public School, 6x5 tiles

### Parks & Recreation
- **Railway Station Gardens** (248, 242) - Playground north of station with flowers, 8x6 tiles
- **Beecroft Village Green** (235, 255) - Park west of shopping area, 10x8 tiles
- **Tennis Court 1** (270, 265) - 6x8 tiles
- **Tennis Court 2** (270, 274) - 6x8 tiles
- **Cheltenham Oval** (295, 295) - Large sports oval, 20x15 tiles
- **Malton Road Playground** (285, 260) - 6x6 tiles

### Community Buildings
- **Beecroft Community Centre** (240, 265) - 8x6 tiles
- **Fire and Rescue NSW Beecroft Fire Station** (242, 270) - 8x7 tiles
- **Beecroft Presbyterian Church** (230, 265) - 7x8 tiles
- **Community Garden** (237, 257) - Near Village Green, 7x6 tiles

### Residential Addresses
- **19 Albert Rd** (235, 240) - Player's home, 4x4 tiles
- **27 Welham St** (238, 245) - Residential house, 4x4 tiles

### Natural Areas
- **30+ forested zones** - Throughout the map with dense Australian eucalyptus
- **Australian wildlife habitats** - Kookaburras, lorikeets, magpies, lizards, cats, and dogs
- **Very leafy suburb** - Beecroft is one of Sydney's leafiest suburbs

## Getting Started

Simply open `index.html` in your web browser to start playing!

For development with live server:
```bash
npm start
# Game will be available at http://localhost:8000
```

## Technology Stack

- HTML5 Canvas for rendering with camera scrolling
- Vanilla JavaScript for game engine
- CSS3 for UI styling
- Procedurally generated tree placement
- No build process required!

## Map Details

The game features a **massive 500×500 tile map** (16,000×16,000 pixels in isometric view) with:

### Coordinate System
- **Origin Point**: Beecroft Railway Station at (250, 250)
- All buildings and landmarks positioned relative to this central point
- Geographically accurate placement matching real-world Beecroft layout

### Road Network
- **Beecroft Road** - Main 5-tile wide north-south arterial centered at x=250, running entire map height
- **Hannah Street** - 4-tile wide east-west shopping strip at y=255
- **Chapman Avenue** - 4-tile wide east-west road north of station at y=235
- **Copeland Road** - 4-tile wide east-west road south of station at y=265
- **Railway Line** - East-west tracks at y=250, running through station
- **Wongala Crescent** - Curved 4-tile road through eastern area (260-280, 250-260)
- **Sutherland Road** - Diagonal road southeast from Copeland Rd area
- **Malton Road** - 4-tile road east from station area
- **Albert Road** & **Welham Street** - Residential streets with real addresses
- Multiple local residential connector streets

### Features
- **30+ forested areas** with thousands of procedurally generated Australian eucalyptus trees
- **35+ buildings** representing real Beecroft locations at accurate coordinates
- **9 parks and recreational areas** with flowers, ovals, and playgrounds
- **Railway tracks** running east-west at y=250 through the station
- **Community garden** near Village Green for farming
- **Australian wildlife system** - 40+ animals wandering in designated zones
- **Built-in mini-map** in top-right corner showing your position and major landmarks
- **Location indicator** at bottom showing current area or nearest building
- **Geographic accuracy** - All positions match real Beecroft geography with station as origin
- **Optimized rendering** - Viewport culling ensures smooth performance on the large map
- **Isometric 3D view** - Stardew Valley-style isometric perspective

## Development

This is an open-source project. Contributions are welcome!

## License

MIT License
