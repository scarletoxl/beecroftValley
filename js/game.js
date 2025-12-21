// Beecroft Valley - Main Game Engine
// A realistic recreation of Beecroft, NSW with full game features
// Version: 2025-12-21-FINAL - Complete and validated (3055 lines)

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Real map system - renders OSM tiles as background
        this.mapSystem = new RealMapSystem(this.canvas, this.ctx);

        // Map dimensions (in game units)
        this.mapWidth = 500;
        this.mapHeight = 500;

        // Camera for scrolling (in world coordinates)
        this.camera = { x: 0, y: 0 };

        // Game state - Initialize with defaults
        this.player = {
            x: 270, y: 260, // Start on Malton Road, east of shops (clear of buildings)
            speed: 1,
            energy: 100,
            maxEnergy: 100,
            gold: 100,
            name: "You",
            inCar: false,
            carType: null,
            hasRing: false,
            spouse: null,
            currentJob: null
        };

        // Inventory system
        this.inventory = {
            items: [],
            maxSlots: 20
        };

        // Time and season system
        this.time = {
            hour: 6, // 6 AM start
            minute: 0,
            day: 1,
            season: 'spring' // spring, summer, fall, winter
        };

        // Quest system
        this.quests = [];
        this.completedQuests = [];
        this.initQuests();

        // Interior map system
        this.currentMap = 'overworld';
        this.interiorMaps = {};
        this.previousPosition = null;

        // NPC relationship system
        this.relationships = {};

        // UI state
        this.uiState = {
            showingDialog: false,
            showingShop: false,
            showingMenu: false,
            showingInventory: false,
            currentNPC: null,
            currentBuilding: null,
            shopItems: [],
            menuItems: []
        };

        this.keys = {};
        this.currentTool = 'hoe';

        // Sprite system
        this.spriteManager = new SpriteManager();
        this.spriteGenerator = new ProceduralSpriteGenerator();
        this.lastFrameTime = Date.now();
        this.deltaTime = 0;

        // Player animation state
        this.player.direction = 'down';
        this.player.isMoving = false;
        this.player.sprite = null;

        // Animals
        this.animals = [];

        // Farming system - crops and watered tiles
        this.crops = []; // { x, y, type, stage, watered, plantedDay }
        this.wateredTiles = new Set(); // "x,y" keys for watered farmland

        // Christmas music audio
        this.christmasAudio = new Audio('media/Christmas this year (2).mp3');
        this.christmasAudio.loop = true;
        this.christmasAudioPlaying = false;

        // Initialize game
        this.initMap();
        this.initNPCs();
        this.initBuildings();
        this.initMarkers(); // Create markers from buildings
        this.initInteriors();
        this.initSprites();
        this.initAnimals();
        this.initAnimalSprites();
        this.createUI();
        this.setupEventListeners();

        // Validate spawn point is walkable (not inside building or water)
        this.validateSpawnPoint();

        // Start game loop after sprites load
        this.spriteManager.waitForAll(() => {
            this.gameLoop();
            this.startTimeCycle();
        });
    }

    // Ensure player spawns on a walkable tile
    validateSpawnPoint() {
        const tile = this.map[Math.floor(this.player.y)]?.[Math.floor(this.player.x)];

        // If spawn is blocked (building=6, water=2), find nearest road
        if (tile === 6 || tile === 2 || tile === undefined) {
            console.warn('Spawn point blocked, finding safe location...');

            // Search in expanding circles for a walkable tile (road=3)
            for (let radius = 1; radius < 50; radius++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const testX = Math.floor(this.player.x) + dx;
                        const testY = Math.floor(this.player.y) + dy;
                        const testTile = this.map[testY]?.[testX];

                        // Found a road tile
                        if (testTile === 3 || testTile === 1 || testTile === 0) {
                            this.player.x = testX + 0.5;
                            this.player.y = testY + 0.5;
                            console.log(`Moved to safe spawn: (${testX}, ${testY})`);
                            return;
                        }
                    }
                }
            }
        }
    }

    // ===== ISOMETRIC PROJECTION UTILITIES =====
    // Convert world coordinates (grid x, y) to isometric screen coordinates
    worldToScreen(worldX, worldY, height = 0) {
        const isoX = (worldX - worldY) * (this.tileWidth / 2);
        const isoY = (worldX + worldY) * (this.tileHeight / 2) - height;
        return { x: isoX, y: isoY };
    }

    // Convert world position to screen, accounting for camera
    worldToScreenWithCamera(worldX, worldY, height = 0) {
        const world = this.worldToScreen(worldX, worldY, height);
        const camera = this.worldToScreen(this.camera.x, this.camera.y, 0);
        return {
            x: world.x - camera.x + this.canvas.width / 2,
            y: world.y - camera.y + this.canvas.height / 2
        };
    }

    // Draw an isometric tile (diamond shape)
    drawIsometricTile(screenX, screenY, color, borderColor = 'rgba(0, 0, 0, 0.1)') {
        const hw = this.tileWidth / 2;  // half width
        const hh = this.tileHeight / 2; // half height

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, screenY - hh);           // Top
        this.ctx.lineTo(screenX + hw, screenY);           // Right
        this.ctx.lineTo(screenX, screenY + hh);           // Bottom
        this.ctx.lineTo(screenX - hw, screenY);           // Left
        this.ctx.closePath();
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    // Draw an isometric tile with texture
    drawIsometricTexturedTile(screenX, screenY, textureDataUrl) {
        const hw = this.tileWidth / 2;  // half width
        const hh = this.tileHeight / 2; // half height

        // Create a clipping region for the diamond shape
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, screenY - hh);           // Top
        this.ctx.lineTo(screenX + hw, screenY);           // Right
        this.ctx.lineTo(screenX, screenY + hh);           // Bottom
        this.ctx.lineTo(screenX - hw, screenY);           // Left
        this.ctx.closePath();
        this.ctx.clip();

        // Draw the texture as a pattern
        const img = new Image();
        if (!this.tileTextureCache) this.tileTextureCache = {};

        if (this.tileTextureCache[textureDataUrl]) {
            // Use cached texture
            const pattern = this.ctx.createPattern(this.tileTextureCache[textureDataUrl], 'repeat');
            this.ctx.fillStyle = pattern;
            this.ctx.fillRect(screenX - hw, screenY - hh, this.tileWidth, this.tileHeight);
        } else {
            // Load and cache texture
            img.src = textureDataUrl;
            this.tileTextureCache[textureDataUrl] = img;
            // Fallback fill
            this.ctx.fillStyle = '#7CB342';
            this.ctx.fillRect(screenX - hw, screenY - hh, this.tileWidth, this.tileHeight);
        }

        this.ctx.restore();

        // Border
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, screenY - hh);
        this.ctx.lineTo(screenX + hw, screenY);
        this.ctx.lineTo(screenX, screenY + hh);
        this.ctx.lineTo(screenX - hw, screenY);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    // ===== MAP INITIALIZATION =====
    // OSM tiles show the real roads/railway - we only track terrain for collision
    initMap() {
        this.map = [];
        this.trees = [];
        this.buildings = [];

        // Fill with grass - OSM tiles show the real terrain
        // Map array is only used for collision detection (water, etc.)
        for (let y = 0; y < this.mapHeight; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                this.map[y][x] = 0; // All walkable grass
            }
        }

        this.addTreeClusters();
        this.addParks();
    }

    addTreeClusters() {
        const treeAreas = [
            // Western Beecroft - Dense Blue Gum forest areas (expanded for 500x500 map)
            { x: 20, y: 340, width: 180, height: 120, density: 0.85 }, // SW forest
            { x: 30, y: 180, width: 160, height: 100, density: 0.75 }, // W forest
            { x: 25, y: 40, width: 180, height: 110, density: 0.7 }, // NW forest

            // Northern edge forests
            { x: 220, y: 20, width: 120, height: 80, density: 0.65 },
            { x: 360, y: 30, width: 100, height: 90, density: 0.7 },

            // Eastern residential areas - Medium density
            { x: 310, y: 180, width: 140, height: 100, density: 0.6 },
            { x: 340, y: 300, width: 120, height: 110, density: 0.65 },
            { x: 380, y: 220, width: 90, height: 140, density: 0.55 },

            // Southern areas - Dense eucalyptus
            { x: 180, y: 370, width: 160, height: 100, density: 0.7 },
            { x: 300, y: 400, width: 140, height: 80, density: 0.68 },
            { x: 60, y: 430, width: 180, height: 60, density: 0.75 },

            // Around schools - Leafy surroundings
            { x: 210, y: 270, width: 60, height: 55, density: 0.7 }, // Near Beecroft Public
            { x: 280, y: 285, width: 70, height: 60, density: 0.72 }, // Near Cheltenham Girls
            { x: 180, y: 225, width: 55, height: 45, density: 0.65 }, // Near schools

            // Central pockets between buildings (residential street trees)
            { x: 255, y: 237, width: 35, height: 30, density: 0.5 },
            { x: 260, y: 268, width: 40, height: 35, density: 0.55 },
            { x: 230, y: 248, width: 30, height: 28, density: 0.5 },

            // Northeast corner - Large forested area
            { x: 420, y: 80, width: 70, height: 150, density: 0.65 },
            { x: 360, y: 120, width: 90, height: 100, density: 0.6 },

            // Southeast corner
            { x: 400, y: 350, width: 90, height: 140, density: 0.68 },

            // Far edges (very leafy suburb!)
            { x: 5, y: 10, width: 60, height: 50, density: 0.72 },
            { x: 440, y: 20, width: 55, height: 70, density: 0.7 },
            { x: 10, y: 460, width: 80, height: 35, density: 0.75 },
            { x: 430, y: 450, width: 65, height: 45, density: 0.72 },

            // Additional residential pockets throughout
            { x: 160, y: 160, width: 40, height: 35, density: 0.6 },
            { x: 190, y: 200, width: 35, height: 30, density: 0.58 },
            { x: 270, y: 195, width: 40, height: 35, density: 0.57 },
            { x: 310, y: 240, width: 45, height: 40, density: 0.6 },
            { x: 200, y: 310, width: 50, height: 45, density: 0.62 },
            { x: 350, y: 160, width: 45, height: 40, density: 0.59 }
        ];

        treeAreas.forEach(area => {
            for (let y = area.y; y < area.y + area.height; y++) {
                for (let x = area.x; x < area.x + area.width; x++) {
                    if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
                        if (Math.random() < area.density && this.map[y][x] === 0) {
                            this.trees.push({
                                x, y,
                                type: Math.floor(Math.random() * 3),
                                health: 3 // Trees take 3 chops to cut
                            });
                        }
                    }
                }
            }
        });

        // Clear trees from spawn area and main roads to prevent getting stuck
        this.clearSpawnArea(270, 260, 5); // Main spawn point on Malton Road
        this.clearSpawnArea(235, 240, 3); // Near farm house
    }

    clearSpawnArea(centerX, centerY, radius) {
        // Remove any trees within radius of the spawn point
        this.trees = this.trees.filter(tree => {
            const dx = tree.x - centerX;
            const dy = tree.y - centerY;
            return Math.sqrt(dx * dx + dy * dy) > radius;
        });
    }

    addParks() {
        const parks = [
            // Railway Gardens Playground - North of station at (248, 242)
            { x: 246, y: 240, width: 8, height: 6 },

            // Beecroft Village Green - West of shopping area at (235, 255)
            { x: 233, y: 253, width: 10, height: 8 },

            // Cheltenham Oval - Southeast at (295, 295)
            { x: 290, y: 290, width: 20, height: 15 },

            // Malton Road Playground - East area at (285, 260)
            { x: 283, y: 258, width: 6, height: 6 },

            // Additional parks scattered throughout
            { x: 180, y: 220, width: 12, height: 10 },
            { x: 320, y: 270, width: 15, height: 12 },
            { x: 200, y: 180, width: 10, height: 8 },
            { x: 350, y: 230, width: 12, height: 10 },
            { x: 120, y: 300, width: 14, height: 10 }
        ];

        parks.forEach(park => {
            for (let y = park.y; y < park.y + park.height; y++) {
                for (let x = park.x; x < park.x + park.width; x++) {
                    if (x < this.mapWidth && y < this.mapHeight) {
                        this.map[y][x] = 9;
                    }
                }
            }
        });
    }

    // ===== BUILDING INITIALIZATION =====
    // All coordinates based on Beecroft Railway Station at origin (250, 250)
    initBuildings() {
        this.buildings = [
            // === CENTRAL STATION AREA (tight cluster around 250, 250) ===
            {
                name: "Beecroft Railway Station",
                x: 245, y: 246,
                width: 10, height: 8,
                type: "station",
                emoji: "🚂",
                color: "#8B4513",
                hasInterior: true,
                canEnter: true
            },

            // === IMMEDIATELY AROUND STATION ===
            {
                name: "HerGP Medical Clinic",
                x: 237, y: 237,
                width: 6, height: 5,
                type: "clinic",
                emoji: "👩‍⚕️",
                color: "#E8F5E9",
                hasInterior: true,
                canEnter: true,
                hasDoctor: true,
                owner: "Dr. Shin Li"
            },
            {
                name: "Beecroft Veterinary Clinic",
                x: 260, y: 243,
                width: 5, height: 4,
                type: "vet",
                emoji: "🐾",
                color: "#E0F7FA",
                hasInterior: true,
                canEnter: true
            },
            {
                name: "Smart Cookies Early Learning Centre",
                x: 242, y: 232,
                width: 7, height: 6,
                type: "school",
                emoji: "👶",
                color: "#FFE0B2",
                hasInterior: true,
                canEnter: true
            },

            // === HANNAH STREET SHOPPING STRIP (runs east-west, y≈255) ===
            {
                name: "Hannah's Beecroft",
                x: 243, y: 253,
                width: 5, height: 4,
                type: "restaurant",
                emoji: "🍽️",
                color: "#FFCCBC",
                hasInterior: true,
                canEnter: true,
                isRestaurant: true,
                hasJobs: true
            },
            {
                name: "Woolworths Beecroft",
                x: 252, y: 251,
                width: 10, height: 8,
                type: "shop",
                emoji: "🛒",
                color: "#C8E6C9",
                hasInterior: true,
                canEnter: true,
                isShop: true,
                shopType: "grocery"
            },
            {
                name: "Chargrill Charlie's",
                x: 263, y: 253,
                width: 4, height: 4,
                type: "restaurant",
                emoji: "🍗",
                color: "#FFAB91",
                hasInterior: true,
                canEnter: true,
                isRestaurant: true
            },
            {
                name: "Yo Sushi",
                x: 258, y: 254,
                width: 4, height: 3,
                type: "restaurant",
                emoji: "🍜",
                color: "#FFF9C4",
                hasInterior: true,
                canEnter: true,
                isRestaurant: true
            },
            {
                name: "The Beehive Cafe",
                x: 246, y: 250,
                width: 5, height: 4,
                type: "cafe",
                emoji: "☕",
                color: "#FFF3E0",
                hasInterior: true,
                canEnter: true,
                isRestaurant: true,
                hasJobs: true,
                owner: "Mrs. Chen"
            },
            {
                name: "Vintage Cellars Beecroft",
                x: 250, y: 258,
                width: 5, height: 4,
                type: "shop",
                emoji: "🍷",
                color: "#F3E5F5",
                hasInterior: true,
                canEnter: true,
                isShop: true,
                shopType: "liquor"
            },
            {
                name: "Love Pilates Beecroft",
                x: 241, y: 256,
                width: 4, height: 3,
                type: "gym",
                emoji: "🧘",
                color: "#E1BEE7",
                hasInterior: true,
                canEnter: true,
                hasJobs: true
            },

            // === SCHOOLS (spread across map) ===
            {
                name: "Beecroft Public School (Est. 1897)",
                x: 215, y: 276,
                width: 12, height: 10,
                type: "school",
                emoji: "🏫",
                color: "#FFF9C4",
                hasInterior: true,
                canEnter: true,
                hasJobs: true
            },
            {
                name: "Cheltenham Girls' High School",
                x: 283, y: 284,
                width: 15, height: 12,
                type: "school",
                emoji: "🏫",
                color: "#F8BBD0",
                hasInterior: true,
                canEnter: true,
                hasJobs: true
            },
            {
                name: "Cheltenham Early Education Centre",
                x: 282, y: 292,
                width: 6, height: 5,
                type: "school",
                emoji: "👶",
                color: "#FFECB3",
                hasInterior: true,
                canEnter: true
            },

            // === PARKS & RECREATION ===
            {
                name: "Railway Station Gardens",
                x: 246, y: 240,
                width: 8, height: 6,
                type: "park",
                emoji: "🌸",
                color: "#F1F8E9",
                hasInterior: false
            },
            {
                name: "Beecroft Village Green",
                x: 233, y: 253,
                width: 10, height: 8,
                type: "park",
                emoji: "🌳",
                color: "#E8F5E9",
                hasInterior: false
            },
            {
                name: "Tennis Court 1",
                x: 268, y: 263,
                width: 6, height: 8,
                type: "recreation",
                emoji: "🎾",
                color: "#C5CAE9",
                hasInterior: true,
                canEnter: true
            },
            {
                name: "Tennis Court 2",
                x: 268, y: 272,
                width: 6, height: 8,
                type: "recreation",
                emoji: "🎾",
                color: "#C5CAE9",
                hasInterior: true,
                canEnter: true
            },
            {
                name: "Cheltenham Oval",
                x: 288, y: 288,
                width: 20, height: 15,
                type: "park",
                emoji: "⚽",
                color: "#C8E6C9",
                hasInterior: false
            },
            {
                name: "Malton Road Playground",
                x: 283, y: 258,
                width: 6, height: 6,
                type: "playground",
                emoji: "🎪",
                color: "#FFE082",
                hasInterior: false
            },

            // === OTHER IMPORTANT BUILDINGS ===
            {
                name: "The Verandah Beecroft",
                x: 216, y: 283,
                width: 6, height: 5,
                type: "restaurant",
                emoji: "☕",
                color: "#FFCCBC",
                hasInterior: true,
                canEnter: true,
                isRestaurant: true
            },
            {
                name: "Beecroft Community Centre",
                x: 237, y: 262,
                width: 8, height: 6,
                type: "community",
                emoji: "🏘️",
                color: "#DCEDC8",
                hasInterior: true,
                canEnter: true
            },
            {
                name: "Fire and Rescue NSW Beecroft Fire Station",
                x: 239, y: 267,
                width: 8, height: 7,
                type: "firestation",
                emoji: "🚒",
                color: "#FFCDD2",
                hasInterior: true,
                canEnter: true
            },
            {
                name: "Beecroft Presbyterian Church",
                x: 228, y: 262,
                width: 7, height: 8,
                type: "church",
                emoji: "⛪",
                color: "#E0E0E0",
                hasInterior: true,
                canEnter: true
            },
            {
                name: "Beecroft Auto Sales",
                x: 262, y: 258,
                width: 10, height: 8,
                type: "car_dealer",
                emoji: "🚗",
                color: "#E3F2FD",
                hasInterior: true,
                canEnter: true,
                isCarDealer: true
            },
            {
                name: "Beecroft Station Parking 1",
                x: 250, y: 256,
                width: 8, height: 6,
                type: "parking",
                emoji: "🅿️",
                color: "#CFD8DC",
                hasInterior: false
            },
            {
                name: "Beecroft Station Parking 2",
                x: 254, y: 256,
                width: 8, height: 6,
                type: "parking",
                emoji: "🅿️",
                color: "#CFD8DC",
                hasInterior: false
            },

            // === RESIDENTIAL ADDRESSES ===
            {
                name: "19 Albert Rd",
                x: 233, y: 238,
                width: 4, height: 4,
                type: "home",
                emoji: "🏡",
                color: "#FFEBEE",
                hasInterior: true,
                canEnter: true,
                isPlayerHome: true
            },
            {
                name: "27 Welham St",
                x: 236, y: 243,
                width: 4, height: 4,
                type: "home",
                emoji: "🏠",
                color: "#FFF3E0",
                hasInterior: true,
                canEnter: true
            },

            // === COMMUNITY GARDEN (near Village Green) ===
            {
                name: "Community Garden",
                x: 235, y: 255,
                width: 7, height: 6,
                type: "garden",
                emoji: "🌻",
                color: "#F1F8E9",
                hasInterior: false
            },

            // === CHRISTMAS TREE - Interactive holiday decoration ===
            {
                name: "Beecroft Christmas Tree",
                x: 241, y: 241,
                width: 3, height: 3,
                type: "christmas_tree",
                emoji: "🎄",
                color: "#2E7D32",
                hasInterior: false,
                canEnter: false,
                isChristmasTree: true
            }
        ];

        // Mark building tiles, but preserve roads and paths for navigation
        this.buildings.forEach(building => {
            for (let y = building.y; y < building.y + building.height; y++) {
                for (let x = building.x; x < building.x + building.width; x++) {
                    if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
                        const currentTile = this.map[y][x];
                        // Only mark as building if it's grass (0) - preserve roads (3), paths (1), railway (8), parks (9)
                        if (currentTile === 0) {
                            this.map[y][x] = 6;
                        }
                    }
                }
            }
        });
    }

    // ===== MARKER INITIALIZATION =====
    // Create floating map markers from GPS-based POI data
    initMarkers() {
        // Use BeeccroftPOIData with GPS coordinates
        const pois = BeeccroftPOIData.getPOIsWithGameCoords();

        this.markers = pois.map(poi => ({
            x: poi.x,
            y: poi.y,
            lat: poi.lat,
            lng: poi.lng,
            name: poi.name,
            emoji: poi.emoji,
            type: poi.type,
            interactable: poi.interactable,
            data: poi // Keep reference to full POI data
        }));

        console.log(`Initialized ${this.markers.length} markers from GPS coordinates`);
    }

    // ===== NPC INITIALIZATION =====
    // Positioned at their buildings based on accurate Beecroft geography
    initNPCs() {
        this.npcs = [
            // === CENTRAL SHOPPING AREA ===
            {
                name: "Mrs. Chen", x: 248, y: 252, emoji: "👵",
                role: "cafe owner",
                greeting: "Welcome to The Beehive! Best coffee in Beecroft!",
                dialogues: [
                    "Our coffee is freshly roasted every morning!",
                    "Try our famous Beecroft Blend!",
                    "We're always looking for reliable staff.",
                    "The community loves gathering here."
                ],
                offersJob: true,
                jobType: "barista",
                jobPay: 15,
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 248,
                baseY: 252
            },
            {
                name: "Emma", x: 255, y: 253, emoji: "👩",
                role: "shopkeeper",
                greeting: "Fresh produce just arrived at Woolworths!",
                dialogues: [
                    "We stock the best local produce!",
                    "Check out our weekly specials!",
                    "Woolworths has been here for decades.",
                    "Shopping for the family?"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 255,
                baseY: 253
            },
            {
                name: "Hannah", x: 245, y: 255, emoji: "👩‍🍳",
                role: "restaurant owner",
                greeting: "Welcome to Hannah's! Try our signature dishes!",
                dialogues: [
                    "We use only fresh local ingredients.",
                    "Our menu changes seasonally.",
                    "We're a Beecroft institution!",
                    "Looking for experienced kitchen staff."
                ],
                offersJob: true,
                jobType: "chef",
                jobPay: 18,
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 245,
                baseY: 255
            },
            {
                name: "Marcus", x: 252, y: 260, emoji: "🍷",
                role: "bottle shop owner",
                greeting: "Welcome to Vintage Cellars! Best selection in town!",
                dialogues: [
                    "We have excellent Australian wines.",
                    "Looking for something special?",
                    "Try our craft beer selection.",
                    "Wine tasting every Friday!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 252,
                baseY: 260
            },

            // === MEDICAL FACILITIES ===
            {
                name: "Dr. Shin Li", x: 240, y: 240, emoji: "👩‍⚕️",
                role: "HerGP clinic owner",
                greeting: "Welcome to HerGP! We're here to care for you and your family.",
                dialogues: [
                    "Your health is our priority.",
                    "Don't forget your annual checkup!",
                    "We're accepting new patients.",
                    "Looking after Beecroft's health for years."
                ],
                isDoctor: true,
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 240,
                baseY: 240
            },

            // === STATION AREA ===
            {
                name: "Tom", x: 250, y: 250, emoji: "🧑‍💼",
                role: "station master",
                greeting: "All trains running on time today!",
                dialogues: [
                    "The 8:15 to Central is on platform 2.",
                    "Been working here for 20 years!",
                    "Beecroft Station is always punctual.",
                    "Need directions to the city?"
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 250,
                baseY: 250
            },
            {
                name: "Olivia", x: 248, y: 242, emoji: "👧",
                role: "playground kid",
                greeting: "This playground is so fun!",
                dialogues: [
                    "Want to play on the train equipment?",
                    "I love Railway Gardens!",
                    "My friends come here every day!",
                    "The train-themed slide is my favorite!"
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 248,
                baseY: 242
            },

            // === SCHOOLS ===
            {
                name: "Sarah", x: 220, y: 280, emoji: "👩‍🏫",
                role: "teacher",
                greeting: "Education is the key to success!",
                dialogues: [
                    "Beecroft Public since 1897!",
                    "Teaching is my passion.",
                    "We need more classroom assistants.",
                    "Our students are wonderful!"
                ],
                offersJob: true,
                jobType: "assistant",
                jobPay: 12,
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 220,
                baseY: 280
            },
            {
                name: "David", x: 290, y: 290, emoji: "👨‍🏫",
                role: "principal",
                greeting: "Welcome to Cheltenham Girls' High School!",
                dialogues: [
                    "Excellence in education for young women.",
                    "Our school has great facilities.",
                    "Building character and knowledge.",
                    "A supportive learning community."
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 290,
                baseY: 290
            },

            // === RESTAURANTS ===
            {
                name: "Claire", x: 218, y: 285, emoji: "☕",
                role: "cafe owner",
                greeting: "Welcome to The Verandah! Relax and enjoy!",
                dialogues: [
                    "We're right near Beecroft Public School.",
                    "Parents love our coffee!",
                    "Fresh pastries daily.",
                    "A quiet spot to unwind."
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 218,
                baseY: 285
            },

            // === RECREATION ===
            {
                name: "Lisa", x: 270, y: 268, emoji: "👱‍♀️",
                role: "bowls player",
                greeting: "Come join us for a game sometime!",
                dialogues: [
                    "Bowling is great fun!",
                    "We play every weekend.",
                    "The club is very welcoming.",
                    "Perfect weather for bowls today!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 270,
                baseY: 268
            },
            {
                name: "Mike", x: 270, y: 270, emoji: "🎾",
                role: "tennis coach",
                greeting: "Want to improve your backhand?",
                dialogues: [
                    "Tennis keeps you fit!",
                    "I offer private lessons.",
                    "The courts are in great condition.",
                    "Anyone can learn to play!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 270,
                baseY: 270
            },

            // === COMMUNITY GARDEN ===
            {
                name: "Jack", x: 237, y: 257, emoji: "🧑‍🌾",
                role: "gardener",
                greeting: "Nothing beats growing your own veggies!",
                dialogues: [
                    "The soil here is excellent!",
                    "Try composting your scraps.",
                    "Spring is the best planting season.",
                    "Community gardening brings people together."
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 237,
                baseY: 257
            },

            // === RESIDENTIAL WANDERING NPCs ===
            {
                name: "Ben", x: 245, y: 275, emoji: "🧑",
                role: "neighbor",
                greeting: "G'day neighbor! Lovely weather today!",
                dialogues: [
                    "How's the farming going?",
                    "Beautiful day in Beecroft!",
                    "Love this quiet suburb.",
                    "Need any help around the farm?"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 245,
                baseY: 275
            },
            {
                name: "Grace", x: 265, y: 235, emoji: "👩",
                role: "resident",
                greeting: "Beecroft is such a lovely place to live!",
                dialogues: [
                    "The trees keep us cool.",
                    "Great schools, great people.",
                    "Love this leafy suburb.",
                    "Perfect weather today!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 265,
                baseY: 235
            },
            {
                name: "James", x: 235, y: 260, emoji: "👨",
                role: "local resident",
                greeting: "Beecroft is such a great place to live!",
                dialogues: [
                    "Been here for 30 years.",
                    "The community is wonderful.",
                    "Great schools, great people.",
                    "Wouldn't live anywhere else!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 235,
                baseY: 260
            },
            {
                name: "Sophie", x: 285, y: 260, emoji: "👧",
                role: "playground kid",
                greeting: "This playground at Malton Road is fun!",
                dialogues: [
                    "I know all the best spots!",
                    "Let's explore together!",
                    "Beecroft is the best!",
                    "Do you like adventures?"
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 285,
                baseY: 260
            },
            {
                name: "Noah", x: 245, y: 185, emoji: "🧒",
                role: "student",
                greeting: "Just finished school!",
                dialogues: [
                    "I go to Arden.",
                    "Love sports and study!",
                    "Wanna kick a footy?",
                    "Beecroft rocks!"
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 245,
                baseY: 185
            },
            {
                name: "Isabella", x: 172, y: 188, emoji: "👩",
                role: "yoga instructor",
                greeting: "Namaste! Join our classes at Village Green!",
                dialogues: [
                    "Yoga in the park is magical.",
                    "Mind, body, spirit.",
                    "Free classes Sunday mornings!",
                    "Everyone is welcome!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 172,
                baseY: 188
            }
        ];

        // Initialize relationships
        this.npcs.forEach(npc => {
            this.relationships[npc.name] = {
                hearts: 0,
                maxHearts: 10,
                married: false,
                giftsToday: 0,
                lastGiftDay: 0
            };
        });
    }

    // ===== QUEST SYSTEM INITIALIZATION =====
    initQuests() {
        // Starting quests for new players
        this.quests = [
            {
                id: 'welcome',
                name: 'Welcome to Beecroft Valley',
                description: 'Talk to Mrs. Chen at The Beehive Cafe',
                type: 'talk',
                target: 'Mrs. Chen',
                reward: { gold: 50 },
                completed: false
            },
            {
                id: 'first_crop',
                name: 'Green Thumb',
                description: 'Plant and harvest your first crop',
                type: 'harvest',
                target: 1,
                progress: 0,
                reward: { gold: 100 },
                completed: false
            },
            {
                id: 'chop_trees',
                name: 'Lumberjack',
                description: 'Chop down 5 trees',
                type: 'chop',
                target: 5,
                progress: 0,
                reward: { gold: 75 },
                completed: false
            },
            {
                id: 'make_friend',
                name: 'Making Friends',
                description: 'Give a gift to any villager',
                type: 'gift',
                target: 1,
                progress: 0,
                reward: { gold: 30 },
                completed: false
            },
            {
                id: 'buy_car',
                name: 'Road Tripper',
                description: 'Buy a car from Beecroft Auto Sales',
                type: 'buy_car',
                reward: { gold: 200 },
                completed: false
            }
        ];
    }

    checkQuestProgress(questType, value = 1) {
        this.quests.forEach(quest => {
            if (quest.completed) return;

            if (quest.type === questType) {
                if (quest.progress !== undefined) {
                    quest.progress += value;
                    if (quest.progress >= quest.target) {
                        this.completeQuest(quest);
                    }
                } else if (quest.type === 'talk' && quest.target === value) {
                    this.completeQuest(quest);
                } else if (quest.type === 'buy_car') {
                    this.completeQuest(quest);
                }
            }
        });
        this.updateQuestDisplay();
    }

    completeQuest(quest) {
        quest.completed = true;
        this.completedQuests.push(quest.id);

        // Give rewards
        if (quest.reward) {
            if (quest.reward.gold) {
                this.player.gold += quest.reward.gold;
            }
        }

        this.showMessage(`Quest completed: ${quest.name}! +$${quest.reward.gold || 0}`);
        this.updateQuestDisplay();
        this.updateHUD();
    }

    updateQuestDisplay() {
        const questList = document.getElementById('quest-list');
        if (!questList) return;

        const activeQuests = this.quests.filter(q => !q.completed);
        if (activeQuests.length === 0) {
            questList.innerHTML = '<div style="color: #999;">All quests completed!</div>';
            return;
        }

        questList.innerHTML = activeQuests.map(quest => {
            let progressText = '';
            if (quest.progress !== undefined) {
                progressText = ` (${quest.progress}/${quest.target})`;
            }
            return `
                <div style="margin-bottom: 8px; padding: 5px; background: #f0f0f0; border-radius: 4px;">
                    <div style="font-weight: bold; color: #4a7c7e;">📜 ${quest.name}</div>
                    <div style="font-size: 0.85em; color: #666;">${quest.description}${progressText}</div>
                    <div style="font-size: 0.8em; color: #888;">Reward: $${quest.reward.gold || 0}</div>
                </div>
            `;
        }).join('');
    }

    // ===== AUSTRALIAN ANIMALS INITIALIZATION =====
    // Ambient wildlife that wanders the map
    initAnimals() {
        this.animals = [];

        // Kookaburras - Perch in tree areas
        const kookaburraLocations = [
            { x: 100, y: 200, zone: { x: 90, y: 190, width: 20, height: 20 } },
            { x: 350, y: 250, zone: { x: 340, y: 240, width: 25, height: 25 } },
            { x: 180, y: 160, zone: { x: 170, y: 150, width: 20, height: 20 } },
            { x: 300, y: 350, zone: { x: 290, y: 340, width: 30, height: 30 } },
            { x: 230, y: 230, zone: { x: 220, y: 220, width: 20, height: 20 } }
        ];

        kookaburraLocations.forEach(loc => {
            this.animals.push({
                type: 'kookaburra',
                x: loc.x,
                y: loc.y,
                emoji: '🦜',
                color: '#8B7355',
                size: 24,
                speed: 0.3,
                targetX: loc.x,
                targetY: loc.y,
                wanderZone: loc.zone,
                wanderTimer: Math.random() * 300,
                perched: Math.random() > 0.5,
                animation: 0
            });
        });

        // Rainbow Lorikeets - Flying colorful parrots
        const lorikeetLocations = [
            { x: 250, y: 242, zone: { x: 240, y: 235, width: 30, height: 20 } }, // Railway Gardens
            { x: 235, y: 255, zone: { x: 225, y: 245, width: 25, height: 25 } }, // Village Green
            { x: 290, y: 290, zone: { x: 280, y: 280, width: 35, height: 30 } }, // Cheltenham Oval
            { x: 150, y: 280, zone: { x: 140, y: 270, width: 30, height: 30 } },
            { x: 370, y: 200, zone: { x: 360, y: 190, width: 30, height: 30 } },
            { x: 200, y: 180, zone: { x: 190, y: 170, width: 25, height: 25 } }
        ];

        lorikeetLocations.forEach(loc => {
            this.animals.push({
                type: 'lorikeet',
                x: loc.x,
                y: loc.y,
                emoji: '🦜',
                color: '#00BFFF',
                size: 20,
                speed: 0.5,
                targetX: loc.x,
                targetY: loc.y,
                wanderZone: loc.zone,
                wanderTimer: Math.random() * 200,
                flying: true,
                animation: 0
            });
        });

        // Magpies - Walking on grass in parks
        const magpieLocations = [
            { x: 248, y: 243, zone: { x: 240, y: 235, width: 20, height: 15 } }, // Railway Gardens
            { x: 236, y: 256, zone: { x: 228, y: 248, width: 20, height: 18 } }, // Village Green
            { x: 292, y: 292, zone: { x: 285, y: 285, width: 25, height: 20 } }, // Cheltenham Oval
            { x: 285, y: 260, zone: { x: 278, y: 253, width: 15, height: 15 } }, // Malton Road Playground
            { x: 270, y: 267, zone: { x: 263, y: 260, width: 18, height: 18 } }, // Tennis courts area
            { x: 220, y: 282, zone: { x: 210, y: 272, width: 25, height: 22 } }, // Beecroft Public School
            { x: 180, y: 225, zone: { x: 170, y: 215, width: 25, height: 25 } },
            { x: 350, y: 235, zone: { x: 340, y: 225, width: 25, height: 25 } }
        ];

        magpieLocations.forEach(loc => {
            this.animals.push({
                type: 'magpie',
                x: loc.x,
                y: loc.y,
                emoji: '🐦',
                color: '#000000',
                size: 24,
                speed: 0.4,
                targetX: loc.x,
                targetY: loc.y,
                wanderZone: loc.zone,
                wanderTimer: Math.random() * 250,
                hopping: false,
                animation: 0
            });
        });

        // Blue-tongue Lizards - Sunning on paths/rocks
        const lizardLocations = [
            { x: 248, y: 245 }, { x: 260, y: 255 }, { x: 238, y: 258 },
            { x: 280, y: 265 }, { x: 225, y: 278 }, { x: 295, y: 288 },
            { x: 170, y: 220 }, { x: 320, y: 240 }, { x: 200, y: 190 },
            { x: 350, y: 280 }
        ];

        lizardLocations.forEach(loc => {
            this.animals.push({
                type: 'lizard',
                x: loc.x,
                y: loc.y,
                emoji: '🦎',
                color: '#4169E1',
                size: 16,
                speed: 0.15,
                targetX: loc.x,
                targetY: loc.y,
                wanderZone: { x: loc.x - 5, y: loc.y - 5, width: 10, height: 10 },
                wanderTimer: Math.random() * 400,
                sunning: Math.random() > 0.3,
                animation: 0
            });
        });

        // Cats - Pet cats wandering residential areas
        const catLocations = [
            { x: 235, y: 242, zone: { x: 225, y: 232, width: 25, height: 25 } }, // Near Albert Rd
            { x: 240, y: 248, zone: { x: 230, y: 238, width: 25, height: 25 } }, // Near Welham St
            { x: 243, y: 275, zone: { x: 233, y: 265, width: 25, height: 25 } }, // Residential
            { x: 268, y: 237, zone: { x: 258, y: 227, width: 25, height: 25 } }, // East residential
            { x: 190, y: 265, zone: { x: 180, y: 255, width: 25, height: 25 } }
        ];

        catLocations.forEach(loc => {
            this.animals.push({
                type: 'cat',
                x: loc.x,
                y: loc.y,
                emoji: '🐱',
                color: '#FFA500',
                size: 24,
                speed: 0.35,
                targetX: loc.x,
                targetY: loc.y,
                wanderZone: loc.zone,
                wanderTimer: Math.random() * 280,
                sitting: Math.random() > 0.6,
                animation: 0
            });
        });

        // Dogs - Pet dogs wandering residential areas
        const dogLocations = [
            { x: 237, y: 244, zone: { x: 227, y: 234, width: 25, height: 25 } }, // Near homes
            { x: 248, y: 273, zone: { x: 238, y: 263, width: 25, height: 25 } }, // Residential
            { x: 263, y: 233, zone: { x: 253, y: 223, width: 25, height: 25 } }, // East area
            { x: 235, y: 258, zone: { x: 225, y: 248, width: 25, height: 25 } }, // Near garden
            { x: 287, y: 262, zone: { x: 277, y: 252, width: 25, height: 25 } } // Playground area
        ];

        dogLocations.forEach(loc => {
            this.animals.push({
                type: 'dog',
                x: loc.x,
                y: loc.y,
                emoji: '🐕',
                color: '#8B4513',
                size: 24,
                speed: 0.45,
                targetX: loc.x,
                targetY: loc.y,
                wanderZone: loc.zone,
                wanderTimer: Math.random() * 240,
                playing: Math.random() > 0.7,
                animation: 0
            });
        });
    }

    // ===== SPRITE INITIALIZATION =====
    initSprites() {
        // Generate player character sprite (cute young girl with long hair)
        const playerSpriteData = this.spriteGenerator.generateCharacterSpriteSheet(48, 48, {
            hair: '#8B4513',      // Brown hair
            skin: '#FFE0BD',      // Light skin
            outfit: '#FF6B9D',    // Pink dress
            accent: '#FF1493'     // Pink bow
        });

        const playerSheet = new SpriteSheet(playerSpriteData, 48, 48);
        this.spriteManager.sprites['player'] = playerSheet;

        // Create player animated sprite
        this.player.sprite = new AnimatedSprite(playerSheet, 48, 48);

        // Setup 4-directional animations
        this.player.sprite.setup4DirectionalAnimations(
            // Idle frames (one per direction)
            {
                down: { x: 0, y: 0 },
                left: { x: 0, y: 1 },
                right: { x: 0, y: 2 },
                up: { x: 0, y: 3 }
            },
            // Walking frames (4 frames per direction)
            {
                down: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
                left: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
                right: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }],
                up: [{ x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }]
            }
        );

        // Generate NPC sprites
        this.npcs.forEach((npc, index) => {
            const config = this.getNPCSpriteConfig(npc);
            const npcSpriteData = this.spriteGenerator.generateNPCSprite(48, 48, config);
            npc.sprite = new SpriteSheet(npcSpriteData, 48, 48);
        });

        // Generate tile textures
        this.tileSprites = {
            grass: this.spriteGenerator.generateTile(64, 32, 'grass'),
            path: this.spriteGenerator.generateTile(64, 32, 'path'),
            road: this.spriteGenerator.generateTile(64, 32, 'road'),
            water: this.spriteGenerator.generateTile(64, 32, 'water'),
            park: this.spriteGenerator.generateTile(64, 32, 'park'),
            railway: this.spriteGenerator.generateTile(64, 32, 'railway')
        };
    }

    getNPCSpriteConfig(npc) {
        // Determine sprite characteristics based on NPC role
        const configs = {
            "Mrs. Chen": { bodyColor: '#FFF59D', hairColor: '#424242', skinColor: '#FFE0BD', accessory: 'apron', age: 'adult' },
            "Emma": { bodyColor: '#81C784', hairColor: '#8D6E63', skinColor: '#FFE0BD', accessory: null, age: 'adult' },
            "Hannah": { bodyColor: '#FFB74D', hairColor: '#6D4C41', skinColor: '#FFD7B5', accessory: 'apron', age: 'adult' },
            "Dr. Shin Li": { bodyColor: '#E0F7FA', hairColor: '#000000', skinColor: '#F5DEB3', accessory: 'medcoat', age: 'adult' },
            "Dr. Patel": { bodyColor: '#E0F7FA', hairColor: '#000000', skinColor: '#D2B48C', accessory: 'medcoat', age: 'adult' },
            "Dr. Emily": { bodyColor: '#E0F7FA', hairColor: '#FFD700', skinColor: '#FFE0BD', accessory: 'medcoat', age: 'adult' },
            "Marcus": { bodyColor: '#BCAAA4', hairColor: '#5D4037', skinColor: '#FFE0BD', accessory: null, age: 'adult' },
            "Jade": { bodyColor: '#424242', hairColor: '#FF6B6B', skinColor: '#FFE0BD', accessory: null, age: 'adult' },
            "Wei": { bodyColor: '#FFF9C4', hairColor: '#000000', skinColor: '#F5DEB3', accessory: 'apron', age: 'adult' },
            "Tom": { bodyColor: '#90A4AE', hairColor: '#757575', skinColor: '#FFE0BD', accessory: null, age: 'adult' },
            "Sarah": { bodyColor: '#A5D6A7', hairColor: '#8D6E63', skinColor: '#FFE0BD', accessory: null, age: 'adult' },
            "Ben": { bodyColor: '#64B5F6', hairColor: '#4E342E', skinColor: '#FFD7B5', accessory: null, age: 'adult' },
            "Olivia": { bodyColor: '#F48FB1', hairColor: '#FFD700', skinColor: '#FFE0BD', accessory: null, age: 'child' },
            "Jack": { bodyColor: '#4FC3F7', hairColor: '#8D6E63', skinColor: '#FFE0BD', accessory: null, age: 'child' }
        };

        return configs[npc.name] || {
            bodyColor: '#90CAF9',
            hairColor: '#6D4C41',
            skinColor: '#FFE0BD',
            accessory: null,
            age: 'adult'
        };
    }

    initAnimalSprites() {
        // Generate animal sprites for all animal types
        const animalTypes = ['kookaburra', 'lorikeet', 'lizard', 'magpie', 'cat', 'dog', 'possum'];
        this.animalSprites = {};

        animalTypes.forEach(type => {
            const spriteData = this.spriteGenerator.generateAnimalSprite(24, 24, type);
            this.animalSprites[type] = new SpriteSheet(spriteData, 24, 24);
        });

        // Assign sprites to all animals created by initAnimals()
        this.animals.forEach(animal => {
            animal.sprite = this.animalSprites[animal.type];
            // Ensure animation properties exist
            animal.frame = animal.frame || 0;
            animal.frameTimer = animal.frameTimer || 0;
            animal.baseX = animal.baseX || animal.x;
            animal.baseY = animal.baseY || animal.y;
            animal.wanderRadius = animal.wanderRadius || (animal.wanderZone ? animal.wanderZone.width / 2 : 20);
            animal.moveTimer = animal.moveTimer || 0;
            animal.standTimer = animal.standTimer || Math.random() * 3000;
        });
    }

    // ===== INTERIOR MAPS =====
    initInteriors() {
        // Create simple interior layouts for buildings with NPCs
        this.interiorMaps = {
            "The Beehive Cafe": {
                width: 15,
                height: 12,
                tiles: this.createCafeInterior(),
                exitX: 7,
                exitY: 11,
                spawnX: 7,
                spawnY: 10,
                npcs: [
                    { name: "Mrs. Chen", x: 7, y: 3, emoji: "👵", role: "cafe owner", greeting: "Welcome! What can I get you?" }
                ]
            },
            "Woolworths Beecroft": {
                width: 20,
                height: 15,
                tiles: this.createShopInterior(),
                exitX: 10,
                exitY: 14,
                spawnX: 10,
                spawnY: 13,
                npcs: [
                    { name: "Emma", x: 10, y: 5, emoji: "👩", role: "shopkeeper", greeting: "Let me know if you need help finding anything!" }
                ]
            },
            "Your Farm House": {
                width: 12,
                height: 10,
                tiles: this.createHomeInterior(),
                exitX: 6,
                exitY: 9,
                spawnX: 6,
                spawnY: 8,
                npcs: []
            },
            "HerGP Medical Clinic": {
                width: 10,
                height: 8,
                tiles: this.createClinicInterior(),
                exitX: 5,
                exitY: 7,
                spawnX: 5,
                spawnY: 6,
                npcs: [
                    { name: "Dr. Shin Li", x: 5, y: 3, emoji: "👩‍⚕️", role: "doctor", greeting: "How can I help you today?" }
                ]
            },
            "Beecroft Auto Sales": {
                width: 18,
                height: 12,
                tiles: this.createCarDealerInterior(),
                exitX: 9,
                exitY: 11,
                spawnX: 9,
                spawnY: 10,
                npcs: [
                    { name: "Marcus", x: 9, y: 4, emoji: "👨", role: "salesman", greeting: "Looking for a new ride?" }
                ]
            },
            "Hannah's Beecroft": {
                width: 14,
                height: 10,
                tiles: this.createCafeInterior(),
                exitX: 7,
                exitY: 9,
                spawnX: 7,
                spawnY: 8,
                npcs: [
                    { name: "Hannah", x: 7, y: 3, emoji: "👩‍🍳", role: "chef", greeting: "Welcome to Hannah's! Take a seat!" }
                ]
            },
            "Chargrill Charlie's": {
                width: 12,
                height: 10,
                tiles: this.createCafeInterior(),
                exitX: 6,
                exitY: 9,
                spawnX: 6,
                spawnY: 8,
                npcs: [
                    { name: "Charlie", x: 6, y: 3, emoji: "👨‍🍳", role: "grill master", greeting: "Best charcoal chicken in Beecroft!" }
                ]
            }
        };

        // Generate sprites for interior NPCs
        this.interiorNPCSprites = {};
        Object.values(this.interiorMaps).forEach(interior => {
            if (interior.npcs) {
                interior.npcs.forEach(npc => {
                    if (!this.interiorNPCSprites[npc.name]) {
                        const config = this.getNPCSpriteConfig(npc) || {
                            bodyColor: '#90CAF9',
                            hairColor: '#6D4C41',
                            skinColor: '#FFE0BD',
                            accessory: null,
                            age: 'adult'
                        };
                        const spriteData = this.spriteGenerator.generateNPCSprite(48, 48, config);
                        this.interiorNPCSprites[npc.name] = new SpriteSheet(spriteData, 48, 48);
                    }
                });
            }
        });
    }

    createCafeInterior() {
        const interior = [];
        for (let y = 0; y < 12; y++) {
            interior[y] = [];
            for (let x = 0; x < 15; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Add some tables (building tiles for collision)
        interior[3][3] = 6;
        interior[3][11] = 6;
        interior[7][3] = 6;
        interior[7][11] = 6;
        return interior;
    }

    createShopInterior() {
        const interior = [];
        for (let y = 0; y < 15; y++) {
            interior[y] = [];
            for (let x = 0; x < 20; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Add shelves
        for (let x = 2; x < 18; x += 4) {
            interior[5][x] = 6;
            interior[5][x + 1] = 6;
            interior[9][x] = 6;
            interior[9][x + 1] = 6;
        }
        return interior;
    }

    createHomeInterior() {
        const interior = [];
        for (let y = 0; y < 10; y++) {
            interior[y] = [];
            for (let x = 0; x < 12; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Add bed
        interior[2][2] = 6;
        interior[2][3] = 6;
        return interior;
    }

    createClinicInterior() {
        const interior = [];
        for (let y = 0; y < 8; y++) {
            interior[y] = [];
            for (let x = 0; x < 10; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Add examination table
        interior[3][5] = 6;
        return interior;
    }

    createCarDealerInterior() {
        const interior = [];
        for (let y = 0; y < 12; y++) {
            interior[y] = [];
            for (let x = 0; x < 18; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        return interior;
    }

    // ===== UI CREATION =====
    createUI() {
        // Create dialog box
        const dialogBox = document.createElement('div');
        dialogBox.id = 'dialog-box';
        dialogBox.style.display = 'none';
        dialogBox.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <span class="dialog-emoji"></span>
                    <span class="dialog-name"></span>
                    <button class="dialog-close">×</button>
                </div>
                <div class="dialog-text"></div>
                <div class="dialog-options"></div>
            </div>
        `;
        document.body.appendChild(dialogBox);

        // Create shop menu
        const shopMenu = document.createElement('div');
        shopMenu.id = 'shop-menu';
        shopMenu.style.display = 'none';
        shopMenu.innerHTML = `
            <div class="shop-content">
                <div class="shop-header">
                    <h2 class="shop-title"></h2>
                    <button class="shop-close">×</button>
                </div>
                <div class="shop-items"></div>
            </div>
        `;
        document.body.appendChild(shopMenu);

        // Create inventory UI
        const inventoryUI = document.createElement('div');
        inventoryUI.id = 'inventory-ui';
        inventoryUI.style.display = 'none';
        inventoryUI.innerHTML = `
            <div class="inventory-content">
                <div class="inventory-header">
                    <h2>Inventory</h2>
                    <button class="inventory-close">×</button>
                </div>
                <div class="inventory-grid"></div>
            </div>
        `;
        document.body.appendChild(inventoryUI);

        // Add quest tracker to sidebar
        const questTracker = document.createElement('div');
        questTracker.id = 'quest-tracker';
        questTracker.innerHTML = `
            <h3>Quests</h3>
            <div id="quest-list">No active quests</div>
        `;
        document.getElementById('controls').appendChild(questTracker);
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // Tool usage
            if (e.key === 'e' || e.key === 'E') {
                this.useTool();
            }

            // Talk to NPCs / Interact with markers
            if (e.key === ' ') {
                if (this.currentMap === 'overworld') {
                    // First check for nearby NPCs
                    let foundNPC = false;
                    const talkDistance = 1.5;
                    for (let npc of this.npcs) {
                        const dx = this.player.x - npc.x;
                        const dy = this.player.y - npc.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < talkDistance) {
                            this.showNPCDialog(npc);
                            foundNPC = true;
                            break;
                        }
                    }

                    // Then check for nearby markers
                    if (!foundNPC) {
                        const marker = this.getNearestMarker();
                        if (marker) {
                            this.interactWithMarker(marker);
                        } else {
                            // Fallback to old building interaction or crop harvesting
                            this.talkToNearbyNPC();
                        }
                    }
                } else {
                    // Exit interior
                    this.exitBuilding();
                }
            }

            // Toggle inventory
            if (e.key === 'i' || e.key === 'I') {
                this.toggleInventory();
            }

            // Car toggle
            if (e.key === 'c' || e.key === 'C') {
                this.toggleCar();
            }

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Tool selection
        document.querySelectorAll('.tool').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.tool').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTool = e.target.dataset.tool;
            });
        });

        // Dialog close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('dialog-close')) {
                this.closeDialog();
            }
            if (e.target.classList.contains('shop-close')) {
                this.closeShop();
            }
            if (e.target.classList.contains('inventory-close')) {
                this.closeInventory();
            }
        });
    }

    // ===== NPC INTERACTION =====
    talkToNearbyNPC() {
        // First check if there's a mature crop to harvest
        const tileX = Math.floor(this.player.x);
        const tileY = Math.floor(this.player.y);
        const crop = this.crops.find(c => c.x === tileX && c.y === tileY);
        if (crop && crop.stage >= 4) {
            this.harvestCrop(tileX, tileY);
            return;
        }

        // Then check for NPCs
        const talkDistance = 1.5;
        for (let npc of this.npcs) {
            const dx = this.player.x - npc.x;
            const dy = this.player.y - npc.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < talkDistance) {
                this.showNPCDialog(npc);
                return;
            }
        }

        const building = this.getNearbyBuilding();
        if (building) {
            this.showBuildingDialog(building);
        }
    }

    showNPCDialog(npc) {
        this.uiState.showingDialog = true;
        this.uiState.currentNPC = npc;

        // Check quest progress for talking
        this.checkQuestProgress('talk', npc.name);

        const dialogBox = document.getElementById('dialog-box');
        const randomDialogue = npc.dialogues[Math.floor(Math.random() * npc.dialogues.length)];

        dialogBox.querySelector('.dialog-emoji').textContent = npc.emoji;
        dialogBox.querySelector('.dialog-name').textContent = npc.name;
        dialogBox.querySelector('.dialog-text').textContent = randomDialogue;

        // Create options
        const options = dialogBox.querySelector('.dialog-options');
        options.innerHTML = '';

        // Gift option
        const giftBtn = document.createElement('button');
        giftBtn.textContent = '🎁 Give Gift';
        giftBtn.onclick = () => this.giveGift(npc);
        options.appendChild(giftBtn);

        // Job option
        if (npc.offersJob) {
            const jobBtn = document.createElement('button');
            jobBtn.textContent = '💼 Ask about work';
            jobBtn.onclick = () => this.offerJob(npc);
            options.appendChild(jobBtn);
        }

        // Marriage option
        if (npc.canMarry && this.relationships[npc.name].hearts >= 8 && this.player.hasRing) {
            const proposeBtn = document.createElement('button');
            proposeBtn.textContent = '💍 Propose Marriage';
            proposeBtn.onclick = () => this.proposeMarriage(npc);
            options.appendChild(proposeBtn);
        }

        dialogBox.style.display = 'flex';
    }

    showBuildingDialog(building) {
        if (building.isChristmasTree) {
            this.toggleChristmasMusic();
        } else if (building.isRestaurant) {
            this.showRestaurantMenu(building);
        } else if (building.isShop) {
            this.showShopMenu(building);
        } else if (building.isCarDealer) {
            this.showCarDealer();
        }
    }

    toggleChristmasMusic() {
        if (this.christmasAudioPlaying) {
            this.christmasAudio.pause();
            this.christmasAudioPlaying = false;
            this.showMessage("🎄 Christmas music stopped. Happy Holidays!");
        } else {
            this.christmasAudio.play().then(() => {
                this.christmasAudioPlaying = true;
                this.showMessage("🎄 ♪ Merry Christmas! ♪ 🎅");
            }).catch(err => {
                console.log('Audio playback failed:', err);
                this.showMessage("🎄 Press again to hear Christmas music!");
            });
        }
    }

    closeDialog() {
        document.getElementById('dialog-box').style.display = 'none';
        this.uiState.showingDialog = false;
        this.uiState.currentNPC = null;
    }

    // ===== GIFT SYSTEM =====
    giveGift(npc) {
        // Check if player has items
        if (this.inventory.items.length === 0) {
            this.showMessage("You don't have any items to gift!");
            return;
        }

        // Simple gift system - first item in inventory
        const gift = this.inventory.items[0];
        this.inventory.items.shift();

        // Increase relationship
        const rel = this.relationships[npc.name];
        if (rel.giftsToday < 1) {
            rel.hearts = Math.min(rel.maxHearts, rel.hearts + 0.5);
            rel.giftsToday++;
            this.showMessage(`${npc.name} loved the ${gift.name}! ❤️ +0.5 hearts`);
            // Check quest progress
            this.checkQuestProgress('gift');
        } else {
            this.showMessage(`${npc.name} already received a gift today!`);
        }

        this.closeDialog();
    }

    // ===== MARRIAGE SYSTEM =====
    proposeMarriage(npc) {
        if (!this.player.hasRing) {
            this.showMessage("You need a ring to propose!");
            return;
        }

        const rel = this.relationships[npc.name];
        if (rel.hearts >= 8) {
            rel.married = true;
            this.player.spouse = npc.name;
            this.player.hasRing = false;
            this.showMessage(`${npc.name} said YES! 💕 You are now married!`);
            this.closeDialog();
        }
    }

    // ===== RESTAURANT SYSTEM =====
    showRestaurantMenu(building) {
        const menu = [
            { name: 'Coffee', price: 5, energy: 20, emoji: '☕' },
            { name: 'Sandwich', price: 8, energy: 35, emoji: '🥪' },
            { name: 'Cake', price: 12, energy: 50, emoji: '🍰' },
            { name: 'Salad', price: 10, energy: 30, emoji: '🥗' },
            { name: 'Pasta', price: 15, energy: 60, emoji: '🍝' }
        ];

        this.showShopUI(building.name + " Menu", menu, (item) => {
            if (this.player.gold >= item.price) {
                this.player.gold -= item.price;
                this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + item.energy);
                this.updateHUD();
                this.showMessage(`Ate ${item.name}! +${item.energy} energy`);
            } else {
                this.showMessage("Not enough gold!");
            }
        });
    }

    // ===== SHOP SYSTEM =====
    showShopMenu(building) {
        const items = [
            // Seeds for farming
            { name: 'Turnip Seeds', price: 20, emoji: '🌱', type: 'seed', cropType: 'turnip' },
            { name: 'Potato Seeds', price: 30, emoji: '🥔', type: 'seed', cropType: 'potato' },
            { name: 'Carrot Seeds', price: 25, emoji: '🥕', type: 'seed', cropType: 'carrot' },
            { name: 'Tomato Seeds', price: 40, emoji: '🍅', type: 'seed', cropType: 'tomato' },
            { name: 'Corn Seeds', price: 50, emoji: '🌽', type: 'seed', cropType: 'corn' },
            { name: 'Strawberry Seeds', price: 60, emoji: '🍓', type: 'seed', cropType: 'strawberry' },
            // Food items
            { name: 'Apple', price: 3, energy: 15, emoji: '🍎', type: 'food' },
            { name: 'Bread', price: 4, energy: 20, emoji: '🍞', type: 'food' },
            { name: 'Milk', price: 5, energy: 25, emoji: '🥛', type: 'food' },
            // Other items
            { name: 'Gift Box', price: 20, emoji: '🎁', type: 'gift' },
            { name: 'Engagement Ring', price: 500, emoji: '💍', type: 'ring' }
        ];

        this.showShopUI(building.name, items, (item) => {
            if (this.player.gold >= item.price) {
                if (this.inventory.items.length >= this.inventory.maxSlots) {
                    this.showMessage("Inventory full!");
                    return;
                }
                this.player.gold -= item.price;
                this.inventory.items.push(item);
                this.updateHUD();
                this.showMessage(`Bought ${item.name}!`);
            } else {
                this.showMessage("Not enough gold!");
            }
        });
    }

    showShopUI(title, items, onBuy) {
        const shopMenu = document.getElementById('shop-menu');
        shopMenu.querySelector('.shop-title').textContent = title;

        const itemsContainer = shopMenu.querySelector('.shop-items');
        itemsContainer.innerHTML = '';

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shop-item';
            itemDiv.innerHTML = `
                <span class="item-emoji">${item.emoji}</span>
                <span class="item-name">${item.name}</span>
                <span class="item-price">$${item.price}</span>
            `;
            itemDiv.onclick = () => onBuy(item);
            itemsContainer.appendChild(itemDiv);
        });

        shopMenu.style.display = 'flex';
        this.uiState.showingShop = true;
    }

    closeShop() {
        document.getElementById('shop-menu').style.display = 'none';
        this.uiState.showingShop = false;
    }

    // ===== CAR DEALER =====
    showCarDealer() {
        const cars = [
            { name: 'Basic Car', price: 500, emoji: '🚗', speed: 2 },
            { name: 'Nice Car', price: 1500, emoji: '🚙', speed: 2.5 },
            { name: 'Fancy Car', price: 3000, emoji: '🏎️', speed: 3 },
            { name: 'Caravan', price: 2500, emoji: '🚐', speed: 1.8 }
        ];

        this.showShopUI("Beecroft Auto Sales", cars, (car) => {
            if (this.player.gold >= car.price) {
                this.player.gold -= car.price;
                this.player.carType = car;
                this.updateHUD();
                this.showMessage(`Bought ${car.name}! Press C to drive.`);
                // Check quest progress
                this.checkQuestProgress('buy_car');
                this.closeShop();
            } else {
                this.showMessage("Not enough gold!");
            }
        });
    }

    toggleCar() {
        if (!this.player.carType) {
            this.showMessage("You don't own a car! Visit Beecroft Auto Sales.");
            return;
        }

        this.player.inCar = !this.player.inCar;
        this.showMessage(this.player.inCar ? "Getting in car..." : "Getting out of car...");
    }

    // ===== JOB SYSTEM =====
    offerJob(npc) {
        if (this.player.currentJob) {
            this.showMessage("You already have a job!");
            return;
        }

        this.player.currentJob = {
            employer: npc.name,
            type: npc.jobType,
            pay: npc.jobPay
        };

        this.showMessage(`You're now working as a ${npc.jobType}! Press E near ${npc.name} to work. Pay: $${npc.jobPay}/hour`);
        this.closeDialog();
    }

    doWork() {
        if (!this.player.currentJob) {
            this.showMessage("You don't have a job!");
            return;
        }

        if (this.player.energy < 10) {
            this.showMessage("Too tired to work!");
            return;
        }

        this.player.energy -= 10;
        this.player.gold += this.player.currentJob.pay;
        this.updateHUD();
        this.showMessage(`Worked for an hour! Earned $${this.player.currentJob.pay}`);
    }

    // ===== BUILDING INTERIORS =====
    enterBuilding(building) {
        const interior = this.interiorMaps[building.name];
        if (!interior) {
            this.showMessage(`Can't enter ${building.name} yet!`);
            return;
        }

        // Save current position
        this.previousPosition = { x: this.player.x, y: this.player.y };

        // Switch to interior
        this.currentMap = building.name;
        this.player.x = interior.spawnX;
        this.player.y = interior.spawnY;

        this.showMessage(`Entered ${building.name}. Press Space to exit.`);
    }

    exitBuilding() {
        if (this.currentMap === 'overworld') return;

        // Restore position
        if (this.previousPosition) {
            this.player.x = this.previousPosition.x;
            this.player.y = this.previousPosition.y;
        }

        this.currentMap = 'overworld';
        this.showMessage("Exited building.");
    }

    getNearbyBuilding() {
        for (let building of this.buildings) {
            if (this.player.x >= building.x - 0.5 && this.player.x <= building.x + building.width + 0.5 &&
                this.player.y >= building.y - 0.5 && this.player.y <= building.y + building.height + 0.5) {
                return building;
            }
        }
        return null;
    }

    // ===== INVENTORY =====
    toggleInventory() {
        const inv = document.getElementById('inventory-ui');
        if (this.uiState.showingInventory) {
            this.closeInventory();
        } else {
            this.openInventory();
        }
    }

    openInventory() {
        const inv = document.getElementById('inventory-ui');
        const grid = inv.querySelector('.inventory-grid');
        grid.innerHTML = '';

        this.inventory.items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.innerHTML = `
                <span>${item.emoji}</span>
                <span>${item.name}</span>
            `;
            itemDiv.onclick = () => this.useInventoryItem(item, index);
            grid.appendChild(itemDiv);
        });

        // Add empty slots
        for (let i = this.inventory.items.length; i < this.inventory.maxSlots; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'inventory-item empty';
            emptyDiv.textContent = '—';
            grid.appendChild(emptyDiv);
        }

        inv.style.display = 'flex';
        this.uiState.showingInventory = true;
    }

    closeInventory() {
        document.getElementById('inventory-ui').style.display = 'none';
        this.uiState.showingInventory = false;
    }

    useInventoryItem(item, index) {
        if (item.type === 'food' && item.energy) {
            this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + item.energy);
            this.inventory.items.splice(index, 1);
            this.showMessage(`Ate ${item.name}! +${item.energy} energy`);
            this.openInventory(); // Refresh
            this.updateHUD();
        }
    }

    // ===== TOOL USAGE =====
    useTool() {
        const tileX = Math.floor(this.player.x);
        const tileY = Math.floor(this.player.y);

        if (this.currentTool === 'hoe') {
            // Till soil - converts grass to farmland
            if (this.currentMap === 'overworld' && this.map[tileY][tileX] === 0) {
                this.map[tileY][tileX] = 4; // Farmland tile
                this.player.energy = Math.max(0, this.player.energy - 2);
                this.showMessage('Tilled the soil!');
                this.updateHUD();
            }
        } else if (this.currentTool === 'axe') {
            this.chopTree();
        } else if (this.currentTool === 'water') {
            // Water tilled soil or crops
            if (this.currentMap === 'overworld' && this.map[tileY][tileX] === 4) {
                const tileKey = `${tileX},${tileY}`;
                if (!this.wateredTiles.has(tileKey)) {
                    this.wateredTiles.add(tileKey);
                    this.player.energy = Math.max(0, this.player.energy - 1);

                    // Check if there's a crop here and water it
                    const crop = this.crops.find(c => c.x === tileX && c.y === tileY);
                    if (crop) {
                        crop.watered = true;
                        this.showMessage(`Watered the ${crop.type}!`);
                    } else {
                        this.showMessage('Watered the soil!');
                    }
                    this.updateHUD();
                } else {
                    this.showMessage('Already watered!');
                }
            } else {
                this.showMessage('Need to till soil first!');
            }
        } else if (this.currentTool === 'seeds') {
            // Plant seeds on tilled soil
            if (this.currentMap === 'overworld' && this.map[tileY][tileX] === 4) {
                // Check if there's already a crop here
                const existingCrop = this.crops.find(c => c.x === tileX && c.y === tileY);
                if (existingCrop) {
                    this.showMessage('Something is already planted here!');
                } else {
                    // Check if player has seeds in inventory
                    const seedIndex = this.inventory.items.findIndex(i => i.type === 'seed');
                    if (seedIndex >= 0) {
                        const seed = this.inventory.items[seedIndex];
                        this.crops.push({
                            x: tileX,
                            y: tileY,
                            type: seed.cropType || 'turnip',
                            stage: 0, // 0=seed, 1=sprout, 2=growing, 3=mature, 4=harvest-ready
                            watered: false,
                            plantedDay: this.time.day
                        });
                        this.inventory.items.splice(seedIndex, 1);
                        this.player.energy = Math.max(0, this.player.energy - 1);
                        this.showMessage(`Planted ${seed.cropType || 'turnip'} seeds!`);
                        this.updateHUD();
                    } else {
                        this.showMessage('No seeds! Buy some from the shop.');
                    }
                }
            } else {
                this.showMessage('Need to till soil first!');
            }
        }

        // Work if near employer
        if (this.player.currentJob) {
            const employer = this.npcs.find(n => n.name === this.player.currentJob.employer);
            if (employer) {
                const dx = this.player.x - employer.x;
                const dy = this.player.y - employer.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 2) {
                    this.doWork();
                }
            }
        }
    }

    // Harvest mature crops
    harvestCrop(tileX, tileY) {
        const cropIndex = this.crops.findIndex(c => c.x === tileX && c.y === tileY);
        if (cropIndex >= 0) {
            const crop = this.crops[cropIndex];
            if (crop.stage >= 4) { // Harvest-ready
                const cropData = this.getCropData(crop.type);
                if (this.inventory.items.length < this.inventory.maxSlots) {
                    this.inventory.items.push({
                        name: cropData.harvestName,
                        emoji: cropData.emoji,
                        type: 'crop',
                        sellPrice: cropData.sellPrice
                    });
                    this.crops.splice(cropIndex, 1);
                    this.player.gold += cropData.sellPrice;
                    this.showMessage(`Harvested ${cropData.harvestName}! +$${cropData.sellPrice}`);
                    // Check quest progress
                    this.checkQuestProgress('harvest');
                    this.updateHUD();
                } else {
                    this.showMessage('Inventory full!');
                }
            } else {
                this.showMessage('Not ready to harvest yet!');
            }
        }
    }

    getCropData(cropType) {
        const crops = {
            turnip: { harvestName: 'Turnip', emoji: '🥬', sellPrice: 60, growthDays: 4 },
            potato: { harvestName: 'Potato', emoji: '🥔', sellPrice: 80, growthDays: 6 },
            carrot: { harvestName: 'Carrot', emoji: '🥕', sellPrice: 70, growthDays: 5 },
            tomato: { harvestName: 'Tomato', emoji: '🍅', sellPrice: 100, growthDays: 8 },
            corn: { harvestName: 'Corn', emoji: '🌽', sellPrice: 120, growthDays: 10 },
            strawberry: { harvestName: 'Strawberry', emoji: '🍓', sellPrice: 150, growthDays: 7 }
        };
        return crops[cropType] || crops.turnip;
    }

    growCrops() {
        let cropsGrown = 0;
        this.crops.forEach(crop => {
            // Only grow if watered
            if (crop.watered && crop.stage < 4) {
                crop.stage++;
                cropsGrown++;
                crop.watered = false; // Reset watered status for new day
            }
        });

        if (cropsGrown > 0) {
            // Check if any crops are ready to harvest
            const harvestReady = this.crops.filter(c => c.stage >= 4).length;
            if (harvestReady > 0) {
                this.showMessage(`${harvestReady} crop(s) ready to harvest!`);
            }
        }
    }

    chopTree() {
        // Find nearby tree
        for (let i = 0; i < this.trees.length; i++) {
            const tree = this.trees[i];
            const dx = this.player.x - tree.x;
            const dy = this.player.y - tree.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1.5) {
                tree.health--;
                this.player.energy = Math.max(0, this.player.energy - 5);

                if (tree.health <= 0) {
                    // Tree cut down
                    this.trees.splice(i, 1);
                    this.player.gold += 10;
                    this.showMessage("Tree chopped! +$10 and wood");

                    // Add wood to inventory
                    if (this.inventory.items.length < this.inventory.maxSlots) {
                        this.inventory.items.push({ name: 'Wood', emoji: '🪵', type: 'material' });
                    }

                    // Check quest progress
                    this.checkQuestProgress('chop');
                } else {
                    this.showMessage(`Chopping... (${tree.health} hits left)`);
                }

                this.updateHUD();
                return;
            }
        }
        this.showMessage("No tree nearby!");
    }

    // ===== NPC AI =====
    updateNPCs(deltaTime) {
        this.npcs.forEach(npc => {
            // Random sickness
            if (!npc.isSick && Math.random() < 0.0001) {
                npc.isSick = true;
                this.showMessage(`${npc.name} got sick! 🤢`);

                // Find nearest clinic
                const clinics = this.buildings.filter(b => b.hasDoctor);
                if (clinics.length > 0) {
                    const nearestClinic = clinics[0];
                    npc.targetX = nearestClinic.x + 2;
                    npc.targetY = nearestClinic.y + 2;
                }
            }

            // Sick NPCs go to doctor
            if (npc.isSick && npc.targetX !== null) {
                this.moveNPCToward(npc, npc.targetX, npc.targetY);

                // Check if reached clinic
                const dx = npc.x - npc.targetX;
                const dy = npc.y - npc.targetY;
                if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
                    // Heal after a few seconds
                    setTimeout(() => {
                        npc.isSick = false;
                        npc.targetX = npc.baseX;
                        npc.targetY = npc.baseY;
                        this.showMessage(`${npc.name} was healed!`);
                    }, 3000);
                }
            } else if (!npc.isSick) {
                // Wandering AI
                if (npc.standTimer > 0) {
                    npc.standTimer--;
                } else if (npc.wanderTimer > 0) {
                    npc.wanderTimer--;
                    if (npc.targetX !== null && npc.targetY !== null) {
                        this.moveNPCToward(npc, npc.targetX, npc.targetY);

                        // Check if reached target
                        const dx = npc.x - npc.targetX;
                        const dy = npc.y - npc.targetY;
                        if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
                            npc.wanderTimer = 0;
                            npc.standTimer = Math.random() * 300 + 100; // Stand for a bit
                        }
                    }
                } else {
                    // Start new wander
                    if (Math.random() < 0.01) {
                        const range = 5;
                        npc.targetX = npc.baseX + (Math.random() - 0.5) * range;
                        npc.targetY = npc.baseY + (Math.random() - 0.5) * range;
                        npc.wanderTimer = 300;
                    }
                }
            }
        });
    }

    moveNPCToward(npc, targetX, targetY) {
        const dx = targetX - npc.x;
        const dy = targetY - npc.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0.1) {
            const speed = 0.05;
            const moveX = (dx / distance) * speed;
            const moveY = (dy / distance) * speed;

            const newX = npc.x + moveX;
            const newY = npc.y + moveY;

            // Check collision
            const tileX = Math.floor(newX);
            const tileY = Math.floor(newY);

            if (this.map[tileY] && this.map[tileY][tileX] !== 2 && this.map[tileY][tileX] !== 6) {
                npc.x = newX;
                npc.y = newY;
            }
        }
    }

    updateAnimals() {
        if (!this.animals) return;

        this.animals.forEach(animal => {
            // Update animation frame
            animal.frameTimer += this.deltaTime;
            if (animal.frameTimer >= 150) {  // Change frame every 150ms
                animal.frameTimer = 0;
                animal.frame = (animal.frame + 1) % 4;
            }

            // Update AI behavior
            if (animal.standTimer > 0) {
                animal.standTimer -= this.deltaTime;
            } else if (animal.moveTimer > 0) {
                animal.moveTimer -= this.deltaTime;

                // Move toward target
                const dx = animal.targetX - animal.x;
                const dy = animal.targetY - animal.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0.1) {
                    animal.x += (dx / distance) * animal.speed;
                    animal.y += (dy / distance) * animal.speed;
                } else {
                    // Reached target, stand for a bit
                    animal.moveTimer = 0;
                    animal.standTimer = Math.random() * 2000 + 1000;
                }
            } else {
                // Pick new random target within wander radius
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * animal.wanderRadius;
                animal.targetX = animal.baseX + Math.cos(angle) * radius;
                animal.targetY = animal.baseY + Math.sin(angle) * radius;

                // Clamp to map bounds
                animal.targetX = Math.max(5, Math.min(this.mapWidth - 5, animal.targetX));
                animal.targetY = Math.max(5, Math.min(this.mapHeight - 5, animal.targetY));

                animal.moveTimer = Math.random() * 3000 + 1000;
            }

            // Avoid player (flee if too close)
            const playerDx = this.player.x - animal.x;
            const playerDy = this.player.y - animal.y;
            const playerDist = Math.sqrt(playerDx * playerDx + playerDy * playerDy);

            if (playerDist < 3) {
                // Move away from player
                animal.x -= (playerDx / playerDist) * animal.speed * 2;
                animal.y -= (playerDy / playerDist) * animal.speed * 2;
            }
        });
    }

    // ===== TIME SYSTEM =====
    startTimeCycle() {
        setInterval(() => {
            this.time.minute += 10;
            if (this.time.minute >= 60) {
                this.time.minute = 0;
                this.time.hour++;

                // Regenerate energy each hour
                this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 5);
                this.updateHUD();
            }

            if (this.time.hour >= 24) {
                this.time.hour = 0;
                this.time.day++;

                // New day - reset gift counters
                Object.values(this.relationships).forEach(rel => {
                    rel.giftsToday = 0;
                });

                // New day - grow crops that were watered
                this.growCrops();

                // New day - reset watered tiles
                this.wateredTiles.clear();

                // Change season every 28 days
                if (this.time.day % 28 === 0) {
                    const seasons = ['spring', 'summer', 'fall', 'winter'];
                    const currentIndex = seasons.indexOf(this.time.season);
                    this.time.season = seasons[(currentIndex + 1) % 4];
                    this.showMessage(`Season changed to ${this.time.season}!`);
                }
            }

            this.updateHUD();
        }, 1000); // Update every second (game time passes faster)
    }

    // ===== SAVE/LOAD =====
    saveGame() {
        const saveData = {
            player: this.player,
            inventory: this.inventory,
            time: this.time,
            relationships: this.relationships,
            quests: this.quests,
            completedQuests: this.completedQuests,
            trees: this.trees,
            map: this.map,
            crops: this.crops,
            wateredTiles: Array.from(this.wateredTiles)
        };

        localStorage.setItem('beecroftValleySave', JSON.stringify(saveData));
        this.showMessage("Game saved!");
    }

    loadGame() {
        const saveData = localStorage.getItem('beecroftValleySave');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.player = data.player;
            this.inventory = data.inventory;
            this.time = data.time;
            this.relationships = data.relationships;
            // Load quests - restore if saved, otherwise use existing initialized quests
            if (data.quests && data.quests.length > 0) {
                this.quests = data.quests;
            }
            this.completedQuests = data.completedQuests || [];
            if (data.trees) this.trees = data.trees;
            if (data.map) this.map = data.map;
            if (data.crops) this.crops = data.crops;
            if (data.wateredTiles) this.wateredTiles = new Set(data.wateredTiles);

            this.updateHUD();
            this.updateQuestDisplay();
            this.showMessage("Game loaded!");
            return true;
        }
        return false;
    }

    // ===== UPDATE LOOP =====
    update() {
        // Calculate delta time for smooth animations
        const now = Date.now();
        this.deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        // Player movement
        const prevX = this.player.x;
        const prevY = this.player.y;

        const moveSpeed = this.player.inCar ? this.player.carType.speed * 0.15 : 0.15;

        // Track player movement and direction
        let moved = false;
        let newDirection = this.player.direction;

        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.player.y = Math.max(0, this.player.y - moveSpeed);
            newDirection = 'up';
            moved = true;
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.player.y = Math.min(this.getCurrentMapHeight() - 1, this.player.y + moveSpeed);
            newDirection = 'down';
            moved = true;
        }
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.x = Math.max(0, this.player.x - moveSpeed);
            newDirection = 'left';
            moved = true;
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.x = Math.min(this.getCurrentMapWidth() - 1, this.player.x + moveSpeed);
            newDirection = 'right';
            moved = true;
        }

        // Collision detection - only block water (tile 2), not building tiles
        // Building areas are now represented by floating markers, so players walk freely
        const tileX = Math.floor(this.player.x);
        const tileY = Math.floor(this.player.y);

        const currentMapData = this.getCurrentMapData();
        if (currentMapData[tileY] && currentMapData[tileY][tileX] === 2) {
            this.player.x = prevX;
            this.player.y = prevY;
        }

        // Tree collision (only on overworld)
        if (this.currentMap === 'overworld') {
            for (let tree of this.trees) {
                const dx = this.player.x - tree.x;
                const dy = this.player.y - tree.y;
                if (Math.abs(dx) < 0.6 && Math.abs(dy) < 0.6) {
                    this.player.x = prevX;
                    this.player.y = prevY;
                    break;
                }
            }
        }

        // Update player animation state
        this.player.direction = newDirection;
        this.player.isMoving = moved && (this.player.x !== prevX || this.player.y !== prevY);

        if (this.player.sprite) {
            this.player.sprite.setDirection(this.player.direction, this.player.isMoving);
            this.player.sprite.update(this.deltaTime);
        }

        // Update camera - center on player
        this.camera.x = this.player.x;
        this.camera.y = this.player.y;

        // Clamp camera to map bounds (with some padding)
        const padding = 10;
        this.camera.x = Math.max(padding, Math.min(this.getCurrentMapWidth() - padding, this.camera.x));
        this.camera.y = Math.max(padding, Math.min(this.getCurrentMapHeight() - padding, this.camera.y));

        // Update NPCs
        this.updateNPCs();

        // Update animals
        this.updateAnimals();
    }

    getCurrentMapData() {
        if (this.currentMap === 'overworld') {
            return this.map;
        } else {
            return this.interiorMaps[this.currentMap].tiles;
        }
    }

    getCurrentMapWidth() {
        if (this.currentMap === 'overworld') {
            return this.mapWidth;
        } else {
            return this.interiorMaps[this.currentMap].width;
        }
    }

    getCurrentMapHeight() {
        if (this.currentMap === 'overworld') {
            return this.mapHeight;
        } else {
            return this.interiorMaps[this.currentMap].height;
        }
    }

    // ===== RENDERING =====
    render() {
        // Render OSM tiles as background (overworld only)
        if (this.currentMap === 'overworld') {
            this.mapSystem.render(this.camera.x, this.camera.y);
        } else {
            // Interior: use old rendering for now
            this.ctx.fillStyle = '#f5deb3';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.renderInterior();
        }

        // Calculate visible range for entities
        const viewRange = 30;
        const startX = Math.max(0, Math.floor(this.camera.x - viewRange));
        const startY = Math.max(0, Math.floor(this.camera.y - viewRange));
        const endX = Math.min(this.getCurrentMapWidth(), Math.ceil(this.camera.x + viewRange));
        const endY = Math.min(this.getCurrentMapHeight(), Math.ceil(this.camera.y + viewRange));

        // Collect all entities for depth sorting
        const entities = [];

        // Add entities only on overworld
        if (this.currentMap === 'overworld') {
            // Add markers (floating pins for POIs)
            this.markers.forEach(marker => {
                if (marker.x >= startX - 2 && marker.x < endX + 2 &&
                    marker.y >= startY - 2 && marker.y < endY + 2) {
                    entities.push({
                        type: 'marker',
                        data: marker,
                        sortY: marker.y,
                        sortX: marker.x
                    });
                }
            });

            // Add NPCs
            this.npcs.forEach(npc => {
                if (npc.x >= startX && npc.x < endX && npc.y >= startY && npc.y < endY) {
                    entities.push({ type: 'npc', data: npc, sortY: npc.y, sortX: npc.x });
                }
            });

            // Add animals
            if (this.animals) {
                this.animals.forEach(animal => {
                    if (animal.x >= startX && animal.x < endX && animal.y >= startY && animal.y < endY) {
                        entities.push({ type: 'animal', data: animal, sortY: animal.y, sortX: animal.x });
                    }
                });
            }

            // Add crops
            if (this.crops) {
                this.crops.forEach(crop => {
                    if (crop.x >= startX && crop.x < endX && crop.y >= startY && crop.y < endY) {
                        entities.push({ type: 'crop', data: crop, sortY: crop.y, sortX: crop.x });
                    }
                });
            }
        }

        // Add interior NPCs when inside a building
        if (this.currentMap !== 'overworld') {
            const interior = this.interiorMaps[this.currentMap];
            if (interior && interior.npcs) {
                interior.npcs.forEach(npc => {
                    entities.push({
                        type: 'interior_npc',
                        data: npc,
                        sortY: npc.y,
                        sortX: npc.x
                    });
                });
            }
        }

        // Add player
        entities.push({ type: 'player', data: this.player, sortY: this.player.y, sortX: this.player.x });

        // Sort entities by Y position (back to front), then by X
        entities.sort((a, b) => {
            if (Math.abs(a.sortY - b.sortY) < 0.01) {
                return a.sortX - b.sortX;
            }
            return a.sortY - b.sortY;
        });

        // Render all entities in sorted order
        entities.forEach(entity => {
            if (entity.type === 'tree') {
                this.renderIsometricTree(entity.data);
            } else if (entity.type === 'marker') {
                this.renderMarker(entity.data);
            } else if (entity.type === 'npc') {
                this.renderIsometricNPC(entity.data);
            } else if (entity.type === 'interior_npc') {
                this.renderInteriorNPC(entity.data);
            } else if (entity.type === 'animal') {
                this.renderIsometricAnimal(entity.data);
            } else if (entity.type === 'crop') {
                this.renderIsometricCrop(entity.data);
            } else if (entity.type === 'player') {
                this.renderIsometricPlayer(entity.data);
            }
        });

        // Render mini-map and location indicator (from expanded map features)
        if (this.currentMap === 'overworld') {
            this.renderMiniMap();
            this.renderLocationIndicator();
        }

        // Apply day/night overlay
        this.applyDayNightOverlay();
    }

    // ===== ISOMETRIC ENTITY RENDERING =====
    renderIsometricTree(tree) {
        const treeHeight = 40; // Height of the tree in pixels
        const screen = this.worldToScreenWithCamera(tree.x, tree.y, 0);

        // Tree shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(screen.x, screen.y + 5, 12, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Tree trunk (vertical)
        this.ctx.fillStyle = '#6b4423';
        this.ctx.fillRect(screen.x - 4, screen.y - treeHeight, 8, treeHeight);

        // Tree foliage (layered)
        const treeColors = this.getSeasonalTreeColors();
        const color = treeColors[tree.type % treeColors.length];
        this.ctx.fillStyle = color;

        // Bottom layer
        this.ctx.beginPath();
        this.ctx.arc(screen.x, screen.y - treeHeight + 10, 14, 0, Math.PI * 2);
        this.ctx.fill();

        // Middle layer
        this.ctx.beginPath();
        this.ctx.arc(screen.x - 6, screen.y - treeHeight, 12, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(screen.x + 6, screen.y - treeHeight, 12, 0, Math.PI * 2);
        this.ctx.fill();

        // Top layer
        this.ctx.beginPath();
        this.ctx.arc(screen.x, screen.y - treeHeight - 8, 10, 0, Math.PI * 2);
        this.ctx.fill();
    }

    renderIsometricCrop(crop) {
        // Use map system for coordinate conversion
        const screen = this.mapSystem.gameToScreen(
            crop.x + 0.5, crop.y + 0.5,
            this.camera.x, this.camera.y,
            this.canvas.width, this.canvas.height
        );
        const cropData = this.getCropData(crop.type);

        // Draw watered indicator on tile
        if (crop.watered) {
            this.ctx.fillStyle = 'rgba(0, 100, 200, 0.2)';
            const hw = this.tileWidth / 2;
            const hh = this.tileHeight / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(screen.x, screen.y - hh);
            this.ctx.lineTo(screen.x + hw, screen.y);
            this.ctx.lineTo(screen.x, screen.y + hh);
            this.ctx.lineTo(screen.x - hw, screen.y);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Render based on growth stage
        const stage = crop.stage;
        let cropHeight = 0;
        let emoji = '';
        let size = 12;

        if (stage === 0) {
            // Seed - just dots
            this.ctx.fillStyle = '#654321';
            this.ctx.beginPath();
            this.ctx.arc(screen.x - 3, screen.y - 2, 2, 0, Math.PI * 2);
            this.ctx.arc(screen.x + 3, screen.y - 2, 2, 0, Math.PI * 2);
            this.ctx.fill();
            return;
        } else if (stage === 1) {
            // Sprout
            this.ctx.fillStyle = '#228B22';
            this.ctx.beginPath();
            this.ctx.moveTo(screen.x, screen.y - 8);
            this.ctx.lineTo(screen.x - 4, screen.y);
            this.ctx.lineTo(screen.x + 4, screen.y);
            this.ctx.closePath();
            this.ctx.fill();
            return;
        } else if (stage === 2) {
            // Growing
            this.ctx.fillStyle = '#32CD32';
            this.ctx.beginPath();
            this.ctx.moveTo(screen.x, screen.y - 14);
            this.ctx.lineTo(screen.x - 6, screen.y);
            this.ctx.lineTo(screen.x + 6, screen.y);
            this.ctx.closePath();
            this.ctx.fill();
            // Add small leaves
            this.ctx.beginPath();
            this.ctx.ellipse(screen.x - 4, screen.y - 8, 4, 2, -0.5, 0, Math.PI * 2);
            this.ctx.ellipse(screen.x + 4, screen.y - 8, 4, 2, 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            return;
        } else if (stage === 3) {
            // Mature - larger plant
            this.ctx.fillStyle = '#228B22';
            this.ctx.beginPath();
            this.ctx.moveTo(screen.x, screen.y - 20);
            this.ctx.lineTo(screen.x - 8, screen.y);
            this.ctx.lineTo(screen.x + 8, screen.y);
            this.ctx.closePath();
            this.ctx.fill();
            // Larger leaves
            this.ctx.beginPath();
            this.ctx.ellipse(screen.x - 6, screen.y - 12, 6, 3, -0.5, 0, Math.PI * 2);
            this.ctx.ellipse(screen.x + 6, screen.y - 12, 6, 3, 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            return;
        } else {
            // Harvest ready - show emoji
            emoji = cropData.emoji;
            size = 18;
            cropHeight = 24;
        }

        // Draw harvest-ready crop with emoji
        if (emoji) {
            this.ctx.font = `${size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(emoji, screen.x, screen.y - cropHeight + size / 2);
            this.ctx.textAlign = 'left';

            // Add sparkle effect to show it's ready
            const time = Date.now();
            if (Math.sin(time / 200) > 0.5) {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(screen.x + 8, screen.y - cropHeight - 4, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    renderChristmasTree(building) {
        const centerX = building.x + building.width / 2;
        const centerY = building.y + building.height / 2;
        const screen = this.worldToScreenWithCamera(centerX, centerY, 0);
        const treeHeight = 100;
        const time = Date.now();

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        this.ctx.beginPath();
        this.ctx.ellipse(screen.x, screen.y + 8, 35, 18, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Tree trunk
        this.ctx.fillStyle = '#5D4037';
        this.ctx.fillRect(screen.x - 8, screen.y - 20, 16, 25);

        // Tree layers (triangular Christmas tree shape)
        const layers = [
            { y: -25, width: 60, height: 30 },
            { y: -50, width: 50, height: 28 },
            { y: -72, width: 40, height: 26 },
            { y: -92, width: 28, height: 24 }
        ];

        layers.forEach((layer, i) => {
            // Main green layer
            this.ctx.fillStyle = i % 2 === 0 ? '#1B5E20' : '#2E7D32';
            this.ctx.beginPath();
            this.ctx.moveTo(screen.x, screen.y + layer.y - layer.height);
            this.ctx.lineTo(screen.x + layer.width / 2, screen.y + layer.y);
            this.ctx.lineTo(screen.x - layer.width / 2, screen.y + layer.y);
            this.ctx.closePath();
            this.ctx.fill();

            // Snow on edges
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });

        // Twinkling lights (animated)
        const lightColors = ['#FF0000', '#FFD700', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF'];
        const lightPositions = [
            { x: -20, y: -30 }, { x: 15, y: -35 }, { x: -8, y: -28 },
            { x: -15, y: -55 }, { x: 12, y: -52 }, { x: 0, y: -48 },
            { x: -10, y: -75 }, { x: 8, y: -70 }, { x: -5, y: -68 },
            { x: -5, y: -90 }, { x: 5, y: -88 }
        ];

        lightPositions.forEach((pos, i) => {
            const twinkle = Math.sin(time / 200 + i * 0.8) * 0.5 + 0.5;
            const lightSize = 3 + twinkle * 2;
            const color = lightColors[i % lightColors.length];

            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = 0.5 + twinkle * 0.5;
            this.ctx.beginPath();
            this.ctx.arc(screen.x + pos.x, screen.y + pos.y, lightSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Glow effect
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = 0.2 + twinkle * 0.2;
            this.ctx.beginPath();
            this.ctx.arc(screen.x + pos.x, screen.y + pos.y, lightSize + 4, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1;

        // Star on top
        const starY = screen.y - 105;
        const starPulse = Math.sin(time / 300) * 0.3 + 1;
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const radius = 10 * starPulse;
            const x = screen.x + Math.cos(angle) * radius;
            const y = starY + Math.sin(angle) * radius;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Star glow
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(screen.x, starY, 15 * starPulse, 0, Math.PI * 2);
        this.ctx.fill();

        // "Press SPACE" hint when player is nearby
        const dx = this.player.x - centerX;
        const dy = this.player.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 4) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(screen.x - 55, screen.y - 130, 110, 22);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🎵 Press SPACE 🎵', screen.x, screen.y - 114);
            this.ctx.textAlign = 'left';
        }
    }

    // ===== MARKER RENDERING =====
    // Render a floating map marker using the MarkerRenderer class
    renderMarker(marker) {
        // Use map system for screen coordinate conversion
        const screen = this.mapSystem.gameToScreen(
            marker.x, marker.y,
            this.camera.x, this.camera.y,
            this.canvas.width, this.canvas.height
        );

        // Calculate distance from player
        const dx = this.player.x - marker.x;
        const dy = this.player.y - marker.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Use the MarkerRenderer class
        MarkerRenderer.render(this.ctx, marker, screen.x, screen.y, distance, Date.now());
    }

    // Get the nearest interactable marker within range
    getNearestMarker() {
        let nearest = null;
        let nearestDist = Infinity;

        for (const marker of this.markers) {
            if (!marker.interactable) continue;
            const dx = this.player.x - marker.x;
            const dy = this.player.y - marker.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 5 && dist < nearestDist) {
                nearestDist = dist;
                nearest = marker;
            }
        }
        return nearest;
    }

    // Interact with a marker
    interactWithMarker(marker) {
        const b = marker.data;
        if (b.isChristmasTree) {
            this.toggleChristmasMusic();
        } else if (b.isRestaurant) {
            this.showRestaurantMenu(b);
        } else if (b.isShop) {
            this.showShopMenu(b);
        } else if (b.isCarDealer) {
            this.showCarDealer();
        } else if (b.canEnter) {
            this.enterBuilding(b);
        } else {
            this.showMessage(`📍 ${marker.name}`);
        }
    }

    renderIsometricBuilding(building) {
        // Special rendering for Christmas tree
        if (building.isChristmasTree) {
            this.renderChristmasTree(building);
            return;
        }

        // Draw building base tiles (flat, clean look)
        for (let by = 0; by < building.height; by++) {
            for (let bx = 0; bx < building.width; bx++) {
                const tileScreen = this.worldToScreenWithCamera(
                    building.x + bx,
                    building.y + by,
                    0
                );
                this.drawIsometricTile(tileScreen.x, tileScreen.y, building.color || '#d4a373');
            }
        }

        // Center position for emoji
        const centerScreen = this.worldToScreenWithCamera(
            building.x + building.width / 2,
            building.y + building.height / 2,
            0
        );

        // Emoji in center
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(building.emoji, centerScreen.x, centerScreen.y + 6);
        this.ctx.textAlign = 'left';
    }

    renderIsometricNPC(npc) {
        // Use map system for coordinate conversion
        const screen = this.mapSystem.gameToScreen(
            npc.x, npc.y,
            this.camera.x, this.camera.y,
            this.canvas.width, this.canvas.height
        );

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(screen.x, screen.y + 3, 10, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        if (npc.sprite && npc.sprite.loaded) {
            // Render NPC sprite
            npc.sprite.drawFrame(this.ctx, 0, 0, screen.x, screen.y - 24, 48, 48);
        } else {
            // Fallback rendering
            this.ctx.fillStyle = '#4a9eff';
            this.ctx.fillRect(screen.x - 6, screen.y - 25, 12, 15);
            this.ctx.fillStyle = '#ffdbac';
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y - 33, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Sick indicator
        if (npc.isSick) {
            this.ctx.font = '16px Arial';
            this.ctx.fillText('🤢', screen.x + 8, screen.y - 35);
        }

        // Name (smaller, more subtle)
        this.ctx.font = '7px Arial';
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(npc.name, screen.x, screen.y - 50);
        this.ctx.textAlign = 'left';
    }

    renderInteriorNPC(npc) {
        const screen = this.worldToScreenWithCamera(npc.x, npc.y, 0);

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(screen.x, screen.y + 3, 10, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Try to use pre-generated sprite
        const sprite = this.interiorNPCSprites?.[npc.name];
        if (sprite && sprite.loaded) {
            sprite.drawFrame(this.ctx, 0, 0, screen.x, screen.y - 24, 48, 48);
        } else {
            // Fallback to colored shape
            this.ctx.fillStyle = '#4a9eff';
            this.ctx.fillRect(screen.x - 6, screen.y - 25, 12, 15);
            this.ctx.fillStyle = '#ffdbac';
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y - 33, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Name and role
        this.ctx.font = '8px Arial';
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(npc.name, screen.x, screen.y - 50);
        this.ctx.font = '6px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText(`(${npc.role})`, screen.x, screen.y - 42);
        this.ctx.textAlign = 'left';
    }

    renderInterior() {
        const interior = this.interiorMaps[this.currentMap];
        if (!interior || !interior.tiles) return;

        const tileSize = 32;

        // Render tiles relative to camera
        for (let y = 0; y < interior.height; y++) {
            for (let x = 0; x < interior.width; x++) {
                const screen = this.worldToScreenWithCamera(x, y, 0);
                const tile = interior.tiles[y]?.[x] || 7;

                // Floor tile
                if (tile === 7) {
                    this.drawIsometricTile(screen.x, screen.y, '#f5deb3', '#d4a373');
                } else if (tile === 6) {
                    // Obstacle (table, shelf, etc.)
                    this.drawIsometricTile(screen.x, screen.y, '#8B4513', '#654321');
                }
            }
        }

        // Draw exit door indicator
        if (interior.exitX !== undefined && interior.exitY !== undefined) {
            const exitScreen = this.worldToScreenWithCamera(interior.exitX, interior.exitY, 0);
            this.ctx.fillStyle = 'rgba(76, 175, 80, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(exitScreen.x, exitScreen.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#2e7d32';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('EXIT', exitScreen.x, exitScreen.y + 4);
            this.ctx.textAlign = 'left';
        }
    }

    renderIsometricPlayer(player) {
        // Use different coordinate systems for overworld vs interior
        let screen;
        if (this.currentMap === 'overworld') {
            screen = this.mapSystem.gameToScreen(
                player.x, player.y,
                this.camera.x, this.camera.y,
                this.canvas.width, this.canvas.height
            );
        } else {
            screen = this.worldToScreenWithCamera(player.x, player.y, 0);
        }

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(screen.x, screen.y + 3, 12, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();

        if (player.inCar && player.carType) {
            // Car rendering (still use emoji for now)
            this.ctx.font = '32px Arial';
            this.ctx.fillText(player.carType.emoji, screen.x - 16, screen.y - 5);
        } else if (player.sprite) {
            // Render animated sprite
            player.sprite.draw(this.ctx, screen.x, screen.y - 24, 48, 48);
        } else {
            // Fallback rendering if sprite not loaded
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.fillRect(screen.x - 7, screen.y - 28, 14, 18);
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y - 37, 9, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Name label (smaller, more subtle)
        this.ctx.font = '8px Arial';
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('You', screen.x, screen.y - 52);
        this.ctx.textAlign = 'left';
    }

    renderIsometricAnimal(animal) {
        if (!animal || !animal.sprite) return;

        // Use map system for coordinate conversion
        const screen = this.mapSystem.gameToScreen(
            animal.x, animal.y,
            this.camera.x, this.camera.y,
            this.canvas.width, this.canvas.height
        );

        // Shadow (smaller for animals)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(screen.x, screen.y + 2, 6, 3, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Render animal sprite
        if (animal.sprite.loaded) {
            animal.sprite.drawFrame(this.ctx, animal.frame, 0, screen.x, screen.y - 12, 24, 24);
        }
    }

    // Helper function to darken/lighten colors
    darkenColor(color, factor) {
        // Simple color darkening (works with hex colors)
        if (color.startsWith('#')) {
            const num = parseInt(color.slice(1), 16);
            const r = Math.min(255, Math.floor((num >> 16) * factor));
            const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) * factor));
            const b = Math.min(255, Math.floor((num & 0x0000FF) * factor));
            return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        }
        return color;
    }

    // ===== MINI-MAP =====
    renderMiniMap() {
        // Use map system's minimap renderer with GPS-based markers
        this.mapSystem.renderMinimap(
            this.camera.x, this.camera.y,
            this.player.x, this.player.y,
            this.markers
        );
    }

    renderLocationIndicator() {
        // Find nearest marker using the interactable one first, then any nearby
        const interactableMarker = this.getNearestMarker();
        let nearestMarker = interactableMarker;

        // If no interactable marker nearby, find the closest one overall
        if (!nearestMarker) {
            let nearestDistance = Infinity;
            this.markers.forEach(marker => {
                const dx = this.player.x - marker.x;
                const dy = this.player.y - marker.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < nearestDistance && distance < 15) {
                    nearestDistance = distance;
                    nearestMarker = marker;
                }
            });
        }

        // Display location name
        if (nearestMarker) {
            const boxWidth = 300;
            const boxHeight = 40;
            const boxX = (this.canvas.width - boxWidth) / 2;
            const boxY = this.canvas.height - boxHeight - 10;

            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            // Border
            this.ctx.strokeStyle = '#ffd700';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            // Text
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`📍 ${nearestMarker.name}`, this.canvas.width / 2, boxY + 25);
            this.ctx.textAlign = 'left';
        } else {
            // Show general area
            let areaName = "Beecroft Valley";

            // Determine area based on position
            if (this.player.x < 150) {
                areaName = "Western Beecroft";
            } else if (this.player.x > 250) {
                areaName = "Eastern Beecroft";
            } else if (this.player.y < 180) {
                areaName = "Northern Beecroft";
            } else if (this.player.y > 210) {
                areaName = "Southern Beecroft";
            } else {
                areaName = "Central Beecroft";
            }

            const boxWidth = 200;
            const boxHeight = 30;
            const boxX = (this.canvas.width - boxWidth) / 2;
            const boxY = this.canvas.height - boxHeight - 10;

            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            // Text
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(areaName, this.canvas.width / 2, boxY + 19);
            this.ctx.textAlign = 'left';
        }
    }

    // ===== SEASONAL COLORS =====
    getSeasonalGrassColor() {
        switch (this.time.season) {
            case 'spring': return '#7cb342';
            case 'summer': return '#8bc34a';
            case 'fall': return '#9e9d24';
            case 'winter': return '#a5d6a7';
            default: return '#7cb342';
        }
    }

    getSeasonalTreeColors() {
        switch (this.time.season) {
            case 'spring': return ['#2e7d32', '#388e3c', '#43a047'];
            case 'summer': return ['#1b5e20', '#2e7d32', '#388e3c'];
            case 'fall': return ['#f57c00', '#ff6f00', '#e65100'];
            case 'winter': return ['#546e7a', '#607d8b', '#78909c'];
            default: return ['#2e7d32', '#388e3c', '#43a047'];
        }
    }

    getSeasonalFlowerColor() {
        switch (this.time.season) {
            case 'spring': return '#ffeb3b';
            case 'summer': return '#ff9800';
            case 'fall': return '#ff5722';
            case 'winter': return '#e0e0e0';
            default: return '#ffeb3b';
        }
    }

    // ===== DAY/NIGHT CYCLE =====
    applyDayNightOverlay() {
        let alpha = 0;

        if (this.time.hour >= 20 || this.time.hour < 6) {
            // Night time
            alpha = 0.5;
        } else if (this.time.hour >= 18 || this.time.hour < 8) {
            // Dusk/Dawn
            alpha = 0.25;
        }

        if (alpha > 0) {
            this.ctx.fillStyle = `rgba(0, 0, 50, ${alpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    // ===== HUD =====
    updateHUD() {
        document.getElementById('gold').textContent = Math.floor(this.player.gold);
        document.getElementById('energy').textContent = `${Math.floor(this.player.energy)}/${this.player.maxEnergy}`;
        document.getElementById('day').textContent = `${this.time.day} (${this.time.season}) ${this.time.hour}:${String(this.time.minute).padStart(2, '0')}`;
    }

    showMessage(message) {
        const footer = document.querySelector('footer p');
        footer.textContent = message;
        setTimeout(() => {
            footer.textContent = "Welcome to Beecroft Valley! Use arrow keys to explore.";
        }, 4000);
    }

    // ===== GAME LOOP =====
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Auto-save every 2 minutes
setInterval(() => {
    if (window.game) {
        window.game.saveGame();
    }
}, 120000);

// Start the game
window.addEventListener('load', () => {
    window.game = new Game();

    // Try to load save
    if (!window.game.loadGame()) {
        window.game.showMessage("Welcome to Beecroft Valley! Press I for inventory, C for car.");
    }

    // Update quest display on start
    window.game.updateQuestDisplay();
});
