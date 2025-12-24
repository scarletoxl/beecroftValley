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

        // Isometric tile dimensions (for interior rendering)
        this.tileWidth = 64;
        this.tileHeight = 32;

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
            items: [
                // Starting materials for testing
                { id: 'wood', name: 'Wood', icon: '🪵', quantity: 1 },
                { id: 'pebbles', name: 'Pebbles', icon: '🪨', quantity: 1 },
                { id: 'egg', name: 'Egg', icon: '🥚', energy: 10, quantity: 1 },
                { id: 'tomato', name: 'Tomato', icon: '🍅', energy: 16, quantity: 1 },
                { id: 'carrot', name: 'Carrot', icon: '🥕', energy: 15, quantity: 1 }
            ],
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
            showingSleepMenu: false,
            currentNPC: null,
            currentBuilding: null,
            shopItems: [],
            menuItems: [],
            sleepMenuUI: {}
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

        // Farm animals (chickens, cows, sheep) - for player's farm
        this.farmAnimals = [];

        // Farming system - crops and watered tiles
        this.crops = []; // { x, y, type, stage, watered, plantedDay }
        this.wateredTiles = new Set(); // "x,y" keys for watered farmland

        // Cooking and Crafting systems
        this.cookingSystem = new CookingSystem(this);
        this.craftingSystem = new CraftingSystem(this);

        // Message system for notifications
        this.message = { text: '', duration: 0 };

        // Christmas music audio
        this.christmasAudio = new Audio('media/Christmas this year (2).mp3');
        this.christmasAudio.loop = true;
        this.christmasAudioPlaying = false;

        // Initialize game
        this.initMap();
        this.initNPCs();
        this.initBuildings();
        this.initStreetLights();
        this.initMarkers(); // Create markers from buildings
        this.clearTreesFromMarkers(); // Keep trees away from buildings
        this.initInteriors();
        this.initSprites();
        this.initAnimals();
        this.initAnimalSprites();
        this.initFarmAnimals();
        this.createUI();
        this.setupEventListeners();
        this.setupCanvasResize();

        // Load cooking and crafting recipes
        this.cookingSystem.loadRecipes();
        this.craftingSystem.loadRecipes();

        // Validate spawn point is walkable (not inside building or water)
        this.validateSpawnPoint();

        // Start game loop after sprites load
        this.spriteManager.waitForAll(() => {
            this.gameLoop();
            this.startTimeCycle();
        });
    }

    setupCanvasResize() {
        const resize = () => {
            const container = this.canvas.parentElement;
            const rect = container.getBoundingClientRect();
            // Account for controls panel width
            const controlsWidth = document.getElementById('controls')?.offsetWidth || 0;
            const availableWidth = rect.width - controlsWidth;
            const availableHeight = rect.height;

            // Set canvas size to fill available space
            this.canvas.width = Math.max(400, availableWidth);
            this.canvas.height = Math.max(300, availableHeight);
        };

        // Initial resize
        resize();

        // Resize on window resize
        window.addEventListener('resize', resize);
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

    clearTreesFromMarkers() {
        // Remove trees that are too close to any marker/building
        const clearRadius = 8; // Clear trees within 8 tiles of any marker
        const originalCount = this.trees.length;

        this.trees = this.trees.filter(tree => {
            for (const marker of this.markers) {
                const dx = tree.x - marker.x;
                const dy = tree.y - marker.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < clearRadius) {
                    return false; // Remove this tree
                }
            }
            return true; // Keep tree
        });

        console.log(`Cleared ${originalCount - this.trees.length} trees from around markers`);
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
                canEnter: true,
                interiorName: "Bridie's Home"  // Link to Bridie's home interior
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
            },

            // === NEW BUILDINGS ===
            {
                name: "Beecroft Carpenter Shop",
                x: 232, y: 270,
                width: 6, height: 5,
                type: "carpenter",
                emoji: "🔨",
                color: "#D7CCC8",
                hasInterior: true,
                canEnter: true,
                isCarpenter: true,
                owner: "Bill the Carpenter"
            },
            {
                name: "Beecroft Mines Entrance",
                x: 180, y: 300,
                width: 8, height: 6,
                type: "mine",
                emoji: "⛏️",
                color: "#78909C",
                hasInterior: true,
                canEnter: true,
                isMine: true
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

    // ===== STREET LIGHTS INITIALIZATION =====
    // Place street lights every 5-6 tiles along all major roads
    // Lights glow at night (6pm-6am) with yellow illumination
    initStreetLights() {
        this.streetLights = [];
        const spacing = 6; // Place light every 6 tiles

        // Beecroft Road - North-south at x=250, entire map
        for (let y = 0; y < this.mapHeight; y += spacing) {
            this.streetLights.push({ x: 250, y: y });
        }

        // Hannah Street - East-west at y=255
        for (let x = 200; x < 320; x += spacing) {
            this.streetLights.push({ x: x, y: 255 });
        }

        // Chapman Avenue - East-west at y=235
        for (let x = 200; x < 320; x += spacing) {
            this.streetLights.push({ x: x, y: 235 });
        }

        // Copeland Road - East-west at y=265
        for (let x = 200; x < 320; x += spacing) {
            this.streetLights.push({ x: x, y: 265 });
        }

        // Railway tracks - East-west at y=250
        for (let x = 180; x < 350; x += spacing) {
            this.streetLights.push({ x: x, y: 250 });
        }

        // Malton Road - East from station
        for (let x = 260; x < 300; x += spacing) {
            this.streetLights.push({ x: x, y: 260 });
        }

        // Wongala Crescent - Curved road (simplified as line segments)
        for (let x = 260; x < 280; x += spacing) {
            const y = 250 + (x - 260) * 0.5; // Diagonal approximation
            this.streetLights.push({ x: x, y: Math.floor(y) });
        }

        // Albert Road - Near player's home
        for (let y = 235; y < 245; y += spacing) {
            this.streetLights.push({ x: 235, y: y });
        }

        // Welham Street
        for (let x = 235; x < 245; x += spacing) {
            this.streetLights.push({ x: x, y: 243 });
        }

        // Sutherland Road - Diagonal (southeast from Copeland)
        for (let i = 0; i < 15; i++) {
            const x = 260 + i * 2;
            const y = 265 + i * 2;
            if (x < this.mapWidth && y < this.mapHeight) {
                this.streetLights.push({ x: x, y: y });
            }
        }

        console.log(`Initialized ${this.streetLights.length} street lights`);
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
            },

            // === NEW NPCS ===
            {
                name: "Bill", x: 234, y: 272, emoji: "👨‍🔧",
                role: "carpenter",
                greeting: "Need anything built? I'm your man!",
                dialogues: [
                    "I can craft furniture from wood.",
                    "Bring me wood and pebbles for tools.",
                    "Quality craftsmanship, guaranteed!",
                    "Been working wood for 30 years."
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 234,
                baseY: 272,
                isCarpenter: true
            },
            {
                name: "Rocky", x: 182, y: 302, emoji: "⛏️",
                role: "miner",
                greeting: "The mines go deep... real deep.",
                dialogues: [
                    "Found copper on level 3 yesterday!",
                    "Bring a good pickaxe down there.",
                    "Watch out for the critters!",
                    "Mining's in my blood."
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 182,
                baseY: 302
            },
            {
                name: "Dusty", x: 185, y: 303, emoji: "🪨",
                role: "mining foreman",
                greeting: "Stay safe down in the mines!",
                dialogues: [
                    "We've got 20 levels so far.",
                    "Deeper you go, better the ore.",
                    "Found diamonds on level 18!",
                    "Don't mine alone, it's dangerous."
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 185,
                baseY: 303
            },
            // === BRIDIE - YOUR BEST FRIEND (AGE 8, SAME AS YOU!) ===
            {
                name: "Bridie", x: 250, y: 253, emoji: "👧",
                role: "your best friend (age 8)",
                age: 8,
                greeting: "Hey bestie! I'm 8 just like you! Want to go on an adventure together?",
                dialogues: [
                    "Let's explore Beecroft together!",
                    "I found a cool bug earlier, wanna see?",
                    "Race you to the shops!",
                    "Being your best friend is the best!",
                    "Mum said I can stay out until dinner!",
                    "What should we explore today?",
                    "Can I follow you? Adventures are better together!",
                    "I'll go wherever you go!"
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 250,
                baseY: 253,
                followsPlayer: true,
                followDistance: 2,
                isChild: true,
                hearts: 10,  // Already best friends!
                canCommand: true  // Can tell her what to do
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

    // ===== FARM ANIMALS INITIALIZATION =====
    initFarmAnimals() {
        // Farm animals at player's property (19 Albert Rd at 235, 240)
        // Positioned around the farm area
        const farmX = 235;
        const farmY = 240;

        this.farmAnimals = [
            // Chickens (3 chickens in coop area)
            {
                type: 'chicken',
                x: farmX - 3,
                y: farmY + 2,
                emoji: '🐔',
                name: 'Henrietta',
                happiness: 100,
                fedToday: false,
                lastProduced: 0,
                productionTime: 1, // 1 day
                produces: 'egg'
            },
            {
                type: 'chicken',
                x: farmX - 4,
                y: farmY + 3,
                emoji: '🐔',
                name: 'Clucky',
                happiness: 100,
                fedToday: false,
                lastProduced: 0,
                productionTime: 1,
                produces: 'egg'
            },
            {
                type: 'chicken',
                x: farmX - 2,
                y: farmY + 3,
                emoji: '🐔',
                name: 'Pecky',
                happiness: 100,
                fedToday: false,
                lastProduced: 0,
                productionTime: 1,
                produces: 'egg'
            },

            // Cows (2 cows in barn area)
            {
                type: 'cow',
                x: farmX + 2,
                y: farmY + 1,
                emoji: '🐄',
                name: 'Bessie',
                happiness: 100,
                fedToday: false,
                lastProduced: 0,
                productionTime: 1,
                produces: 'milk'
            },
            {
                type: 'cow',
                x: farmX + 4,
                y: farmY + 2,
                emoji: '🐄',
                name: 'Daisy',
                happiness: 100,
                fedToday: false,
                lastProduced: 0,
                productionTime: 1,
                produces: 'milk'
            },

            // Sheep (3 sheep in pen area)
            {
                type: 'sheep',
                x: farmX - 1,
                y: farmY - 2,
                emoji: '🐑',
                name: 'Fluffy',
                happiness: 100,
                fedToday: false,
                lastProduced: 0,
                productionTime: 3, // 3 days for wool
                produces: 'wool'
            },
            {
                type: 'sheep',
                x: farmX + 1,
                y: farmY - 3,
                emoji: '🐑',
                name: 'Woolly',
                happiness: 100,
                fedToday: false,
                lastProduced: 0,
                productionTime: 3,
                produces: 'wool'
            },
            {
                type: 'sheep',
                x: farmX - 2,
                y: farmY - 1,
                emoji: '🐑',
                name: 'Baa-rbara',
                happiness: 100,
                fedToday: false,
                lastProduced: 0,
                productionTime: 3,
                produces: 'wool'
            }
        ];

        console.log(`Initialized ${this.farmAnimals.length} farm animals at player's farm`);
    }

    // ===== INTERIOR MAPS =====
    initInteriors() {
        // Create simple interior layouts for buildings with NPCs
        this.interiorMaps = {
            // ===== CAFES & RESTAURANTS =====
            "The Beehive Cafe": {
                width: 15,
                height: 12,
                tiles: this.createCafeInterior(),
                exitX: 7,
                exitY: 11,
                spawnX: 7,
                spawnY: 10,
                npcs: [
                    { name: "Mrs. Chen", x: 7, y: 3, emoji: "👵", role: "cafe owner", greeting: "Welcome to The Beehive! Best coffee in Beecroft." },
                    { name: "Sophie", x: 4, y: 5, emoji: "👩", role: "barista", greeting: "What can I get started for you?" },
                    { name: "Old Tom", x: 10, y: 6, emoji: "👴", role: "regular customer", greeting: "Been coming here for 30 years. Best scones in Sydney!" }
                ]
            },
            "Hannah's Beecroft": {
                width: 14,
                height: 10,
                tiles: this.createRestaurantInterior(),
                exitX: 7,
                exitY: 9,
                spawnX: 7,
                spawnY: 8,
                npcs: [
                    { name: "Hannah", x: 7, y: 3, emoji: "👩‍🍳", role: "chef & owner", greeting: "Welcome to Hannah's! We have fresh specials today!" },
                    { name: "James", x: 4, y: 4, emoji: "👨", role: "waiter", greeting: "I'll be your server today. Menu's on the table." },
                    { name: "Local Couple", x: 10, y: 5, emoji: "👫", role: "diners", greeting: "The pasta here is amazing!" }
                ]
            },
            "Chargrill Charlie's": {
                width: 12,
                height: 10,
                tiles: this.createRestaurantInterior(),
                exitX: 6,
                exitY: 9,
                spawnX: 6,
                spawnY: 8,
                npcs: [
                    { name: "Charlie", x: 6, y: 3, emoji: "👨‍🍳", role: "grill master", greeting: "Best charcoal chicken in Beecroft! What'll it be?" },
                    { name: "Kev", x: 3, y: 4, emoji: "👨", role: "kitchen hand", greeting: "Fresh batch coming out of the oven!" }
                ]
            },
            "Yo Sushi": {
                width: 14,
                height: 10,
                tiles: this.createRestaurantInterior(),
                exitX: 7,
                exitY: 9,
                spawnX: 7,
                spawnY: 8,
                npcs: [
                    { name: "Takeshi", x: 7, y: 2, emoji: "👨‍🍳", role: "sushi chef", greeting: "Irasshaimase! Welcome! Fresh fish today!" },
                    { name: "Yuki", x: 4, y: 4, emoji: "👩", role: "waitress", greeting: "Would you like the lunch special? Very popular!" },
                    { name: "Ken", x: 10, y: 3, emoji: "👨", role: "apprentice chef", greeting: "Learning the art of sushi from the master!" }
                ]
            },
            "The Verandah Beecroft": {
                width: 14,
                height: 10,
                tiles: this.createCafeInterior(),
                exitX: 7,
                exitY: 9,
                spawnX: 7,
                spawnY: 8,
                npcs: [
                    { name: "Melissa", x: 7, y: 3, emoji: "👩", role: "cafe manager", greeting: "Welcome to The Verandah! Lovely day for a coffee." },
                    { name: "Young Mum", x: 4, y: 5, emoji: "👩‍👧", role: "customer", greeting: "This place is so family friendly. Kids love it!" },
                    { name: "Book Club Ladies", x: 10, y: 6, emoji: "👵", role: "regulars", greeting: "We meet here every Thursday. Great atmosphere!" }
                ]
            },

            // ===== SHOPS =====
            "Woolworths Beecroft": {
                width: 20,
                height: 15,
                tiles: this.createShopInterior(),
                exitX: 10,
                exitY: 14,
                spawnX: 10,
                spawnY: 13,
                npcs: [
                    { name: "Emma", x: 10, y: 5, emoji: "👩", role: "store manager", greeting: "Welcome to Woolies! Let me know if you need help." },
                    { name: "Darren", x: 5, y: 7, emoji: "👨", role: "shelf stocker", greeting: "Just restocking the shelves. Fresh stuff in aisle 3!" },
                    { name: "Linda", x: 15, y: 5, emoji: "👩", role: "checkout operator", greeting: "Ready when you are! Do you have a rewards card?" },
                    { name: "Shopper", x: 8, y: 10, emoji: "🧓", role: "customer", greeting: "These prices keep going up, don't they?" }
                ]
            },
            "Beecroft Village Shopping Centre": {
                width: 20,
                height: 15,
                tiles: this.createShopInterior(),
                exitX: 10,
                exitY: 14,
                spawnX: 10,
                spawnY: 13,
                npcs: [
                    { name: "Security Pete", x: 10, y: 3, emoji: "👮", role: "security guard", greeting: "G'day! Just keeping things safe around here." },
                    { name: "Shop Owner", x: 5, y: 6, emoji: "👨", role: "boutique owner", greeting: "Have a look around! Everything's on special." },
                    { name: "Busy Mum", x: 14, y: 8, emoji: "👩", role: "shopper", greeting: "So much to do today! Where's the pharmacy?" }
                ]
            },
            "19 Albert Rd": {
                width: 20,
                height: 16,
                tiles: this.createDetailedHomeInterior(),
                exitX: 10,
                exitY: 15,
                spawnX: 10,
                spawnY: 14,
                npcs: [],
                furniture: this.createHomeFurniture(),
                hasStove: true,
                hasBed: true,
                hasFridge: true
            },
            "Vintage Cellars": {
                width: 12,
                height: 10,
                tiles: this.createLiquorStoreInterior(),
                exitX: 6,
                exitY: 9,
                spawnX: 6,
                spawnY: 8,
                npcs: [
                    { name: "Richard", x: 6, y: 3, emoji: "🧔", role: "sommelier", greeting: "Looking for something special? I can recommend a great drop." },
                    { name: "Wine Enthusiast", x: 3, y: 5, emoji: "👨", role: "customer", greeting: "The 2019 Shiraz here is exceptional!" }
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
                    { name: "Marcus", x: 9, y: 4, emoji: "👨", role: "sales manager", greeting: "Looking for a new ride? We've got great deals!" },
                    { name: "Dave", x: 5, y: 6, emoji: "🧔", role: "mechanic", greeting: "Every car here's been fully inspected. Top quality!" },
                    { name: "First Car Buyer", x: 13, y: 5, emoji: "👦", role: "customer", greeting: "So nervous! Buying my first car today!" }
                ]
            },

            // ===== MEDICAL & SERVICES =====
            "HerGP Medical Clinic": {
                width: 10,
                height: 8,
                tiles: this.createClinicInterior(),
                exitX: 5,
                exitY: 7,
                spawnX: 5,
                spawnY: 6,
                npcs: [
                    { name: "Dr. Shin Li", x: 5, y: 3, emoji: "👩‍⚕️", role: "doctor", greeting: "Hello! How are you feeling today?" },
                    { name: "Nurse Priya", x: 7, y: 4, emoji: "👩‍⚕️", role: "nurse", greeting: "The doctor will see you shortly. Please take a seat." },
                    { name: "Patient", x: 3, y: 5, emoji: "🤒", role: "waiting patient", greeting: "*cough* Just here for a checkup..." }
                ]
            },
            "Beecroft Vet": {
                width: 12,
                height: 10,
                tiles: this.createVetInterior(),
                exitX: 6,
                exitY: 9,
                spawnX: 6,
                spawnY: 8,
                npcs: [
                    { name: "Dr. Sarah", x: 6, y: 3, emoji: "👩‍⚕️", role: "veterinarian", greeting: "Bring your furry friend in! I'll take good care of them." },
                    { name: "Vet Nurse Amy", x: 8, y: 4, emoji: "👩", role: "vet nurse", greeting: "Aww, what a cute pet! We'll look after them." },
                    { name: "Pet Owner", x: 3, y: 6, emoji: "👧", role: "with sick cat", greeting: "My cat hasn't been eating. Hope she'll be okay..." }
                ]
            },

            // ===== STATIONS =====
            "Beecroft Railway Station": {
                width: 16,
                height: 12,
                tiles: this.createStationInterior(),
                exitX: 8,
                exitY: 11,
                spawnX: 8,
                spawnY: 10,
                npcs: [
                    { name: "Station Master Bob", x: 8, y: 2, emoji: "👨‍✈️", role: "station master", greeting: "Next train to Central in 10 minutes. Platform 1!" },
                    { name: "Ticket Officer", x: 6, y: 3, emoji: "👩", role: "ticket sales", greeting: "Single or return? Opal card works too!" },
                    { name: "Commuter", x: 4, y: 7, emoji: "👨‍💼", role: "waiting for train", greeting: "Running late again... hope the train's on time." },
                    { name: "Tourist Family", x: 12, y: 7, emoji: "👨‍👩‍👧", role: "visitors", greeting: "Which way to the Blue Mountains?" }
                ]
            },
            "Cheltenham Station": {
                width: 16,
                height: 12,
                tiles: this.createStationInterior(),
                exitX: 8,
                exitY: 11,
                spawnX: 8,
                spawnY: 10,
                npcs: [
                    { name: "Station Attendant", x: 8, y: 2, emoji: "👨", role: "station staff", greeting: "Trains running on time today. Platform 2 for city." },
                    { name: "Student", x: 5, y: 7, emoji: "👧", role: "schoolgirl", greeting: "Ugh, Monday mornings..." },
                    { name: "Retiree Couple", x: 11, y: 7, emoji: "👴", role: "day trippers", greeting: "Off to the city for a show! Haven't been in years." }
                ]
            },

            // ===== SCHOOLS & EDUCATION =====
            "Beecroft Public School": {
                width: 18,
                height: 14,
                tiles: this.createSchoolInterior(),
                exitX: 9,
                exitY: 13,
                spawnX: 9,
                spawnY: 12,
                npcs: [
                    { name: "Principal Morrison", x: 9, y: 2, emoji: "👨‍🏫", role: "principal", greeting: "Welcome to Beecroft Public! Education is our passion." },
                    { name: "Ms. Thompson", x: 5, y: 4, emoji: "👩‍🏫", role: "year 3 teacher", greeting: "Just preparing for tomorrow's lesson. Love teaching!" },
                    { name: "School Kids", x: 12, y: 6, emoji: "👦", role: "students", greeting: "Recess is the best! Want to play handball?" },
                    { name: "Parent Helper", x: 4, y: 8, emoji: "👩", role: "volunteer", greeting: "Helping with the reading program today." }
                ]
            },
            "Cheltenham Girls' High School": {
                width: 18,
                height: 14,
                tiles: this.createSchoolInterior(),
                exitX: 9,
                exitY: 13,
                spawnX: 9,
                spawnY: 12,
                npcs: [
                    { name: "Principal Dr. Wright", x: 9, y: 2, emoji: "👩‍🏫", role: "principal", greeting: "Cheltenham Girls produces the best and brightest!" },
                    { name: "Science Teacher", x: 5, y: 5, emoji: "👩‍🔬", role: "chemistry teacher", greeting: "Science is everywhere! Today we're doing experiments." },
                    { name: "Senior Students", x: 12, y: 6, emoji: "👧", role: "year 12 students", greeting: "HSC stress is real... but we'll get through it!" },
                    { name: "Librarian", x: 14, y: 4, emoji: "🧓", role: "librarian", greeting: "Shh! This is the library. Need help finding a book?" }
                ]
            },
            "Smart Cookies Early Learning Centre": {
                width: 14,
                height: 12,
                tiles: this.createDaycareInterior(),
                exitX: 7,
                exitY: 11,
                spawnX: 7,
                spawnY: 10,
                npcs: [
                    { name: "Miss Jenny", x: 7, y: 3, emoji: "👩‍🏫", role: "centre director", greeting: "Welcome! The children are having such a great day!" },
                    { name: "Miss Kate", x: 4, y: 5, emoji: "👩", role: "early childhood educator", greeting: "We're doing finger painting today! So much fun!" },
                    { name: "Toddlers", x: 9, y: 5, emoji: "👶", role: "children", greeting: "*giggles and plays*" },
                    { name: "Anxious Parent", x: 5, y: 8, emoji: "👨", role: "dropping off child", greeting: "First day at daycare... hope they'll be okay!" }
                ]
            },
            "Cheltenham Early Education": {
                width: 14,
                height: 12,
                tiles: this.createDaycareInterior(),
                exitX: 7,
                exitY: 11,
                spawnX: 7,
                spawnY: 10,
                npcs: [
                    { name: "Director Paula", x: 7, y: 3, emoji: "👩", role: "director", greeting: "Learning through play is our philosophy!" },
                    { name: "Educator Tim", x: 4, y: 5, emoji: "👨", role: "educator", greeting: "The kids are building a tower! Want to help?" },
                    { name: "Little Ones", x: 9, y: 6, emoji: "👶", role: "children", greeting: "*playing with blocks*" }
                ]
            },

            // ===== COMMUNITY & RECREATION =====
            "Beecroft Presbyterian Church": {
                width: 12,
                height: 16,
                tiles: this.createChurchInterior(),
                exitX: 6,
                exitY: 15,
                spawnX: 6,
                spawnY: 14,
                npcs: [
                    { name: "Pastor David", x: 6, y: 2, emoji: "👨‍💼", role: "pastor", greeting: "Welcome! All are welcome here. Peace be with you." },
                    { name: "Church Warden", x: 3, y: 5, emoji: "👵", role: "warden", greeting: "Been part of this community for 40 years." },
                    { name: "Choir Member", x: 9, y: 4, emoji: "👩", role: "choir singer", greeting: "Rehearsing for Sunday's service. Do you sing?" }
                ]
            },
            "Beecroft Community Centre": {
                width: 16,
                height: 14,
                tiles: this.createCommunityInterior(),
                exitX: 8,
                exitY: 13,
                spawnX: 8,
                spawnY: 12,
                npcs: [
                    { name: "Centre Manager Jan", x: 8, y: 3, emoji: "👩", role: "manager", greeting: "So many activities on today! Check the noticeboard." },
                    { name: "Yoga Instructor", x: 5, y: 6, emoji: "🧘", role: "yoga teacher", greeting: "Namaste! Class starts at 10am. Join us!" },
                    { name: "Art Class Group", x: 11, y: 5, emoji: "👵", role: "painters", greeting: "We meet every Tuesday for watercolors!" },
                    { name: "Council Worker", x: 4, y: 9, emoji: "👨", role: "maintenance", greeting: "Just making sure everything's in order." }
                ]
            },
            "Fire Station": {
                width: 20,
                height: 14,
                tiles: this.createFireStationInterior(),
                exitX: 10,
                exitY: 13,
                spawnX: 10,
                spawnY: 12,
                npcs: [
                    { name: "Captain Steve", x: 10, y: 3, emoji: "👨‍🚒", role: "fire captain", greeting: "Keeping Beecroft safe! Hope you never need us." },
                    { name: "Firefighter Mike", x: 5, y: 5, emoji: "👨‍🚒", role: "firefighter", greeting: "Just finished cleaning the truck. Ready for action!" },
                    { name: "Firefighter Sam", x: 14, y: 5, emoji: "👩‍🚒", role: "firefighter", greeting: "Training hard every day. Safety first!" },
                    { name: "Fire Dog Rusty", x: 10, y: 8, emoji: "🐕", role: "station dog", greeting: "*wags tail happily*" }
                ]
            },
            "Love Pilates Beecroft": {
                width: 14,
                height: 12,
                tiles: this.createGymInterior(),
                exitX: 7,
                exitY: 11,
                spawnX: 7,
                spawnY: 10,
                npcs: [
                    { name: "Instructor Lisa", x: 7, y: 3, emoji: "🧘‍♀️", role: "pilates instructor", greeting: "Welcome! Ready to strengthen your core?" },
                    { name: "Regular Client", x: 4, y: 5, emoji: "👩", role: "member", greeting: "I've been coming here for 2 years. Life changing!" },
                    { name: "Beginner", x: 10, y: 5, emoji: "👩", role: "new member", greeting: "My first class! A bit nervous but excited." }
                ]
            },

            // ===== HOMES =====
            "My Home": {
                width: 12,
                height: 10,
                tiles: this.createDetailedHomeInterior(),
                exitX: 6,
                exitY: 9,
                spawnX: 6,
                spawnY: 8,
                npcs: []  // Player's home - empty
            },
            "Bridie's Home": {
                width: 12,
                height: 10,
                tiles: this.createDetailedHomeInterior(),
                exitX: 6,
                exitY: 9,
                spawnX: 6,
                spawnY: 8,
                npcs: [
                    { name: "Bridie's Mum", x: 3, y: 3, emoji: "👩", role: "Bridie's mother", greeting: "Oh hello dear! Bridie's outside somewhere - she loves following you around!" },
                    { name: "Family Cat", x: 8, y: 5, emoji: "🐱", role: "pet cat", greeting: "*purrs and rubs against your leg*" }
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

    createDetailedHomeInterior() {
        // 20x16 home with multiple rooms
        const interior = [];
        for (let y = 0; y < 16; y++) {
            interior[y] = [];
            for (let x = 0; x < 20; x++) {
                interior[y][x] = 7; // Floor
            }
        }

        // === WALLS (using tile 6 for collision) ===
        // Outer walls
        for (let x = 0; x < 20; x++) {
            interior[0][x] = 6; // Top wall
            interior[15][x] = 6; // Bottom wall (except door)
        }
        for (let y = 0; y < 16; y++) {
            interior[y][0] = 6; // Left wall
            interior[y][19] = 6; // Right wall
        }

        // Interior walls creating rooms
        // Vertical wall separating bedroom/bathroom from living area (x=6)
        for (let y = 1; y < 8; y++) {
            interior[y][6] = 6;
        }
        // Horizontal wall separating kitchen from living room (y=8)
        for (let x = 1; x < 19; x++) {
            interior[8][x] = 6;
        }
        // Bedroom/Bathroom divider (y=4)
        for (let x = 1; x < 6; x++) {
            interior[4][x] = 6;
        }
        // Kitchen/Basement divider (x=13)
        for (let y = 9; y < 15; y++) {
            interior[y][13] = 6;
        }

        // === DOORWAYS (remove walls for doors) ===
        interior[15][10] = 7; // Front door
        interior[4][3] = 7; // Bedroom to bathroom
        interior[7][6] = 7; // Bedroom to living room
        interior[8][4] = 7; // Living room to kitchen
        interior[8][10] = 7; // Living room to kitchen
        interior[11][13] = 7; // Kitchen to basement

        return interior;
    }

    createHomeFurniture() {
        // Define all furniture pieces with positions and types
        return [
            // === BEDROOM (top-left, 1-5, 1-3) ===
            { x: 2, y: 2, type: 'bed', emoji: '🛏️', name: 'Bed', interactive: true, action: 'sleep' },
            { x: 4, y: 1, type: 'dresser', emoji: '👗', name: 'Dresser' },
            { x: 1, y: 1, type: 'wardrobe', emoji: '🚪', name: 'Wardrobe' },
            { x: 5, y: 2, type: 'nightstand', emoji: '🕯️', name: 'Nightstand' },

            // === BATHROOM (top-left, 1-5, 5-7) ===
            { x: 2, y: 5, type: 'toilet', emoji: '🚽', name: 'Toilet' },
            { x: 4, y: 5, type: 'sink', emoji: '🚰', name: 'Sink' },
            { x: 1, y: 6, type: 'shower', emoji: '🚿', name: 'Shower' },
            { x: 5, y: 7, type: 'towel', emoji: '🧻', name: 'Towel Rack' },

            // === LIVING ROOM (right side, 7-18, 1-7) ===
            { x: 10, y: 3, type: 'couch', emoji: '🛋️', name: 'Couch' },
            { x: 12, y: 3, type: 'couch', emoji: '🛋️', name: 'Couch' },
            { x: 11, y: 1, type: 'tv', emoji: '📺', name: 'TV', interactive: true, action: 'watch' },
            { x: 8, y: 5, type: 'bookshelf', emoji: '📚', name: 'Bookshelf' },
            { x: 11, y: 5, type: 'table', emoji: '🪑', name: 'Coffee Table' },
            { x: 17, y: 3, type: 'plant', emoji: '🪴', name: 'Potted Plant' },

            // === KITCHEN (middle-right, 7-12, 9-14) ===
            { x: 8, y: 10, type: 'fridge', emoji: '❄️', name: 'Refrigerator', interactive: true, action: 'storage' },
            { x: 10, y: 9, type: 'stove', emoji: '🔥', name: 'Stove', interactive: true, action: 'cook' },
            { x: 12, y: 9, type: 'sink', emoji: '💧', name: 'Kitchen Sink' },
            { x: 9, y: 12, type: 'table', emoji: '🍽️', name: 'Dining Table' },
            { x: 8, y: 12, type: 'chair', emoji: '🪑', name: 'Chair' },
            { x: 10, y: 12, type: 'chair', emoji: '🪑', name: 'Chair' },
            { x: 11, y: 14, type: 'counter', emoji: '🔪', name: 'Counter' },

            // === BASEMENT/WORKSHOP (bottom-right, 14-18, 9-14) ===
            { x: 15, y: 10, type: 'workbench', emoji: '🔨', name: 'Crafting Table', interactive: true, action: 'craft' },
            { x: 17, y: 10, type: 'chest', emoji: '📦', name: 'Storage Chest', interactive: true, action: 'storage' },
            { x: 15, y: 13, type: 'chest', emoji: '📦', name: 'Storage Chest', interactive: true, action: 'storage' },
            { x: 17, y: 13, type: 'tools', emoji: '🛠️', name: 'Tool Rack' }
        ];
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

    createStationInterior() {
        const interior = [];
        for (let y = 0; y < 12; y++) {
            interior[y] = [];
            for (let x = 0; x < 16; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Ticket counter
        interior[3][6] = 6;
        interior[3][7] = 6;
        interior[3][8] = 6;
        interior[3][9] = 6;
        // Benches
        interior[7][3] = 6;
        interior[7][4] = 6;
        interior[7][11] = 6;
        interior[7][12] = 6;
        return interior;
    }

    createVetInterior() {
        const interior = [];
        for (let y = 0; y < 10; y++) {
            interior[y] = [];
            for (let x = 0; x < 12; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Examination table
        interior[3][6] = 6;
        interior[3][7] = 6;
        // Waiting area chairs
        interior[6][2] = 6;
        interior[6][3] = 6;
        return interior;
    }

    createSchoolInterior() {
        const interior = [];
        for (let y = 0; y < 14; y++) {
            interior[y] = [];
            for (let x = 0; x < 18; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Desks in rows
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                interior[4 + row * 3][3 + col * 3] = 6;
            }
        }
        // Teacher's desk at front
        interior[2][8] = 6;
        interior[2][9] = 6;
        return interior;
    }

    createChurchInterior() {
        const interior = [];
        for (let y = 0; y < 16; y++) {
            interior[y] = [];
            for (let x = 0; x < 12; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Pews (benches)
        for (let row = 0; row < 5; row++) {
            interior[4 + row * 2][2] = 6;
            interior[4 + row * 2][3] = 6;
            interior[4 + row * 2][8] = 6;
            interior[4 + row * 2][9] = 6;
        }
        // Altar
        interior[1][5] = 6;
        interior[1][6] = 6;
        return interior;
    }

    createFireStationInterior() {
        const interior = [];
        for (let y = 0; y < 14; y++) {
            interior[y] = [];
            for (let x = 0; x < 20; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Fire trucks (large obstacles)
        for (let i = 0; i < 4; i++) {
            interior[4][3 + i] = 6;
            interior[5][3 + i] = 6;
            interior[4][12 + i] = 6;
            interior[5][12 + i] = 6;
        }
        return interior;
    }

    createGymInterior() {
        const interior = [];
        for (let y = 0; y < 12; y++) {
            interior[y] = [];
            for (let x = 0; x < 14; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Yoga mats / equipment areas
        interior[3][3] = 6;
        interior[3][7] = 6;
        interior[3][10] = 6;
        interior[6][3] = 6;
        interior[6][7] = 6;
        interior[6][10] = 6;
        return interior;
    }

    createCommunityInterior() {
        const interior = [];
        for (let y = 0; y < 14; y++) {
            interior[y] = [];
            for (let x = 0; x < 16; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Tables for meetings
        interior[4][4] = 6;
        interior[4][5] = 6;
        interior[4][10] = 6;
        interior[4][11] = 6;
        interior[8][7] = 6;
        interior[8][8] = 6;
        return interior;
    }

    createRestaurantInterior() {
        const interior = [];
        for (let y = 0; y < 12; y++) {
            interior[y] = [];
            for (let x = 0; x < 14; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Dining tables
        interior[3][3] = 6;
        interior[3][7] = 6;
        interior[3][10] = 6;
        interior[6][3] = 6;
        interior[6][7] = 6;
        interior[6][10] = 6;
        // Counter/bar area
        interior[2][6] = 6;
        interior[2][7] = 6;
        return interior;
    }

    createLiquorStoreInterior() {
        const interior = [];
        for (let y = 0; y < 10; y++) {
            interior[y] = [];
            for (let x = 0; x < 12; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Wine racks
        for (let x = 2; x < 10; x += 2) {
            interior[3][x] = 6;
            interior[5][x] = 6;
        }
        return interior;
    }

    createDaycareInterior() {
        const interior = [];
        for (let y = 0; y < 12; y++) {
            interior[y] = [];
            for (let x = 0; x < 14; x++) {
                interior[y][x] = 7; // Floor
            }
        }
        // Play areas
        interior[3][3] = 6;
        interior[3][4] = 6;
        interior[3][9] = 6;
        interior[3][10] = 6;
        // Nap area
        interior[7][6] = 6;
        interior[7][7] = 6;
        return interior;
    }

    // ===== UI CREATION =====
    createUI() {
        // Create dialog box with chat interface
        const dialogBox = document.createElement('div');
        dialogBox.id = 'dialog-box';
        dialogBox.style.display = 'none';
        dialogBox.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <span class="dialog-emoji"></span>
                    <span class="dialog-name"></span>
                    <span class="dialog-role"></span>
                    <button class="dialog-close">×</button>
                </div>
                <div class="dialog-chat">
                    <div class="chat-messages"></div>
                    <div class="chat-input-container">
                        <input type="text" class="chat-input" placeholder="Say something..." maxlength="200">
                        <button class="chat-send">Send</button>
                    </div>
                </div>
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
            // ESC key handling for menus
            if (e.key === 'Escape') {
                if (this.uiState.showingSleepMenu) {
                    this.closeSleepMenu();
                    return;
                }
                if (this.cookingSystem && this.cookingSystem.cookingUI.showing) {
                    this.cookingSystem.closeCookingMenu();
                    return;
                }
                if (this.craftingSystem && this.craftingSystem.craftingUI.showing) {
                    this.craftingSystem.closeCraftingMenu();
                    return;
                }
            }

            // Don't process game keys when dialog is open (except Escape)
            if (this.uiState.showingDialog && e.key !== 'Escape') {
                return;
            }

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
                    // Inside building - check for nearby interior NPCs first
                    const interior = this.interiorMaps[this.currentMap];
                    if (interior && interior.npcs) {
                        let foundInteriorNPC = false;
                        const talkDistance = 2;
                        for (let npc of interior.npcs) {
                            const dx = this.player.x - npc.x;
                            const dy = this.player.y - npc.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance < talkDistance) {
                                this.showNPCDialog(npc, this.currentMap);
                                foundInteriorNPC = true;
                                break;
                            }
                        }

                        // Check for nearby interactive furniture
                        if (!foundInteriorNPC && interior.furniture) {
                            for (let furniture of interior.furniture) {
                                if (furniture.interactive) {
                                    const dx = this.player.x - furniture.x;
                                    const dy = this.player.y - furniture.y;
                                    const distance = Math.sqrt(dx * dx + dy * dy);
                                    if (distance < 1.5) {
                                        this.interactWithFurniture(furniture);
                                        foundInteriorNPC = true;
                                        break;
                                    }
                                }
                            }
                        }

                        // Check if at exit
                        if (!foundInteriorNPC) {
                            const exitDist = Math.sqrt(
                                Math.pow(this.player.x - interior.exitX, 2) +
                                Math.pow(this.player.y - interior.exitY, 2)
                            );
                            if (exitDist < 1.5) {
                                this.exitBuilding();
                            }
                        }
                    } else {
                        this.exitBuilding();
                    }
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

        // Canvas click handler for cooking/crafting/sleep UIs
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Check sleep menu clicks
            if (this.uiState.showingSleepMenu) {
                const ui = this.uiState.sleepMenuUI;

                if (ui.napButton) {
                    const btn = ui.napButton;
                    if (mouseX >= btn.x && mouseX <= btn.x + btn.width &&
                        mouseY >= btn.y && mouseY <= btn.y + btn.height) {
                        this.takeNap();
                        return;
                    }
                }

                if (ui.morningButton) {
                    const btn = ui.morningButton;
                    if (mouseX >= btn.x && mouseX <= btn.x + btn.width &&
                        mouseY >= btn.y && mouseY <= btn.y + btn.height) {
                        this.sleepUntilMorning();
                        return;
                    }
                }

                if (ui.closeButton) {
                    const btn = ui.closeButton;
                    if (mouseX >= btn.x && mouseX <= btn.x + btn.width &&
                        mouseY >= btn.y && mouseY <= btn.y + btn.height) {
                        this.closeSleepMenu();
                        return;
                    }
                }
            }

            // Check cooking UI clicks
            if (this.cookingSystem && this.cookingSystem.handleClick) {
                if (this.cookingSystem.handleClick(mouseX, mouseY)) {
                    return;
                }
            }

            // Check crafting UI clicks
            if (this.craftingSystem && this.craftingSystem.handleClick) {
                if (this.craftingSystem.handleClick(mouseX, mouseY)) {
                    return;
                }
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

    showNPCDialog(npc, location = 'Beecroft') {
        this.uiState.showingDialog = true;
        this.uiState.currentNPC = npc;

        // Check quest progress for talking
        this.checkQuestProgress('talk', npc.name);

        const dialogBox = document.getElementById('dialog-box');

        // Set NPC info in header
        dialogBox.querySelector('.dialog-emoji').textContent = npc.emoji;
        dialogBox.querySelector('.dialog-name').textContent = npc.name;
        dialogBox.querySelector('.dialog-role').textContent = `(${npc.role || 'resident'})`;

        // Initialize AI chat and clear previous messages
        const chatMessages = dialogBox.querySelector('.chat-messages');
        chatMessages.innerHTML = '';

        // Start AI conversation
        const greeting = aiChat.startConversation(npc, location);
        this.addChatMessage(chatMessages, npc.emoji, greeting, 'npc');

        // Setup chat input
        const chatInput = dialogBox.querySelector('.chat-input');
        const chatSend = dialogBox.querySelector('.chat-send');

        // Remove old event listeners by cloning
        const newChatInput = chatInput.cloneNode(true);
        const newChatSend = chatSend.cloneNode(true);
        chatInput.parentNode.replaceChild(newChatInput, chatInput);
        chatSend.parentNode.replaceChild(newChatSend, chatSend);

        // Add send handler
        const sendMessage = async () => {
            const message = newChatInput.value.trim();
            if (!message || aiChat.isLoading) return;

            // Add player message
            this.addChatMessage(chatMessages, '🧑', message, 'player');
            newChatInput.value = '';

            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'chat-message npc typing';
            typingIndicator.innerHTML = `<span class="msg-emoji">${npc.emoji}</span><span class="msg-text">...</span>`;
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Get AI response
            const response = await aiChat.sendMessage(message);

            // Remove typing indicator and add response
            typingIndicator.remove();
            this.addChatMessage(chatMessages, npc.emoji, response, 'npc');
        };

        newChatSend.onclick = sendMessage;
        newChatInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        };

        // Focus input
        setTimeout(() => newChatInput.focus(), 100);

        // Create options
        const options = dialogBox.querySelector('.dialog-options');
        options.innerHTML = '';

        // Gift option
        const giftBtn = document.createElement('button');
        giftBtn.textContent = '🎁 Give Gift';
        giftBtn.onclick = () => this.giveGift(npc);
        options.appendChild(giftBtn);

        // Bridie's special "Follow me" / "Stay here" toggle
        if (npc.name === 'Bridie' || npc.canCommand) {
            const followBtn = document.createElement('button');
            if (npc.followsPlayer) {
                followBtn.textContent = '🛑 Stop Following';
                followBtn.onclick = () => {
                    npc.followsPlayer = false;
                    this.showMessage("Bridie: Okay, I'll wait here!");
                    this.closeDialog();
                };
            } else {
                followBtn.textContent = '🚶‍♀️ Follow Me!';
                followBtn.onclick = () => {
                    npc.followsPlayer = true;
                    this.showMessage("Bridie: Yay! Let's go on an adventure!");
                    this.closeDialog();
                };
            }
            options.appendChild(followBtn);
        }

        // Carpenter crafting option
        if (npc.isCarpenter || npc.name === 'Bill') {
            const craftBtn = document.createElement('button');
            craftBtn.textContent = '🔨 Craft Items';
            craftBtn.onclick = () => {
                this.closeDialog();
                this.craftingSystem.openCraftingMenu();
            };
            options.appendChild(craftBtn);
        }

        // Job option
        if (npc.offersJob) {
            const jobBtn = document.createElement('button');
            jobBtn.textContent = '💼 Ask about work';
            jobBtn.onclick = () => this.offerJob(npc);
            options.appendChild(jobBtn);
        }

        // Marriage option
        if (npc.canMarry && this.relationships[npc.name]?.hearts >= 8 && this.player.hasRing) {
            const proposeBtn = document.createElement('button');
            proposeBtn.textContent = '💍 Propose Marriage';
            proposeBtn.onclick = () => this.proposeMarriage(npc);
            options.appendChild(proposeBtn);
        }

        dialogBox.style.display = 'flex';
    }

    interactWithFurniture(furniture) {
        if (!furniture || !furniture.action) return;

        switch (furniture.action) {
            case 'cook':
                this.cookingSystem.openCookingMenu();
                break;
            case 'craft':
                this.craftingSystem.openCraftingMenu();
                break;
            case 'storage':
                this.showMessage('Storage system coming soon!');
                break;
            case 'sleep':
                this.openSleepMenu();
                break;
            default:
                this.showMessage(`Interacted with ${furniture.name}`);
        }
    }

    openSleepMenu() {
        this.uiState.showingSleepMenu = true;
        this.uiState.showingMenu = true;
    }

    closeSleepMenu() {
        this.uiState.showingSleepMenu = false;
        this.uiState.showingMenu = false;
    }

    takeNap() {
        // Nap for 2 hours, restore 50 energy
        this.time.hour = (this.time.hour + 2) % 24;
        if (this.time.hour < 2) {
            this.time.day++;
        }
        this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 50);
        this.showMessage('You took a nap! +50 energy, +2 hours');
        this.closeSleepMenu();
    }

    sleepUntilMorning() {
        // Sleep until 6 AM next day
        this.time.hour = 6;
        this.time.minute = 0;
        this.time.day++;

        // Restore full energy
        this.player.energy = this.player.maxEnergy;

        // Process overnight events
        this.processOvernightEvents();

        this.showMessage(`Day ${this.time.day}! Fully rested. Energy restored.`);
        this.closeSleepMenu();
    }

    setAlarmSleep(wakeHour) {
        // Sleep until specified hour
        const currentHour = this.time.hour;
        let hoursSlept = 0;

        if (wakeHour > currentHour) {
            hoursSlept = wakeHour - currentHour;
        } else {
            hoursSlept = (24 - currentHour) + wakeHour;
            this.time.day++;
        }

        this.time.hour = wakeHour;
        this.time.minute = 0;

        // Restore energy proportional to hours slept (20 per hour, max 100)
        const energyRestored = Math.min(100, hoursSlept * 20);
        this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + energyRestored);

        if (this.time.hour === 6 && hoursSlept >= 8) {
            this.processOvernightEvents();
        }

        this.showMessage(`Woke up at ${wakeHour}:00! +${energyRestored} energy`);
        this.closeSleepMenu();
    }

    processOvernightEvents() {
        // Process crops growing
        for (let crop of this.crops) {
            crop.stage++;
            crop.watered = false; // Reset watering
        }

        // Reset watered tiles
        this.wateredTiles.clear();

        // Farm animals produce
        for (let animal of this.farmAnimals) {
            if (animal.fedToday) {
                // Animal produces product
                if (animal.type === 'chicken') {
                    this.addToInventory({ id: 'egg', name: 'Egg', icon: '🥚', energy: 10, type: 'product' });
                } else if (animal.type === 'cow') {
                    this.addToInventory({ id: 'milk', name: 'Milk', icon: '🥛', energy: 15, type: 'product' });
                } else if (animal.type === 'sheep') {
                    // Sheep produce wool every 3 days
                    if (this.time.day % 3 === 0) {
                        this.addToInventory({ id: 'wool', name: 'Wool', icon: '🧶', type: 'product' });
                    }
                }
            }
            animal.fedToday = false; // Reset feeding
            animal.happiness = Math.max(0, animal.happiness - 5); // Decrease happiness if not pet
        }

        // Show overnight summary
        setTimeout(() => {
            this.showMessage('Farm products collected! Check your inventory.');
        }, 1000);
    }

    renderSleepMenu() {
        const ctx = this.ctx;
        const width = 500;
        const height = 400;
        const x = (this.canvas.width - width) / 2;
        const y = (this.canvas.height - height) / 2;

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 20, 0.8)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Menu background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        // Title
        ctx.fillStyle = '#f7fafc';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💤 Sleep Menu 💤', x + width / 2, y + 45);

        // Current status
        ctx.font = '18px Arial';
        ctx.fillStyle = '#cbd5e0';
        ctx.fillText(`Current: ${this.time.hour}:${String(this.time.minute).padStart(2, '0')}`, x + width / 2, y + 75);
        ctx.fillText(`Energy: ${Math.floor(this.player.energy)}/${this.player.maxEnergy}`, x + width / 2, y + 100);

        // Options
        const buttonWidth = 400;
        const buttonHeight = 60;
        const buttonX = x + (width - buttonWidth) / 2;
        let buttonY = y + 130;

        // Nap button
        ctx.fillStyle = this.player.energy >= 50 ? '#4a5568' : '#2d3748';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#718096';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#f7fafc';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Take a Nap', buttonX + 20, buttonY + 30);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#cbd5e0';
        ctx.fillText('→ Sleep 2 hours  |  Restore 50 energy', buttonX + 20, buttonY + 48);

        this.uiState.sleepMenuUI.napButton = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
        buttonY += 70;

        // Sleep until morning button
        ctx.fillStyle = '#2b6cb0';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#3182ce';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#f7fafc';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Sleep Until Morning', buttonX + 20, buttonY + 30);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#cbd5e0';
        ctx.fillText('→ Wake at 6:00 AM  |  Restore full energy  |  Next day', buttonX + 20, buttonY + 48);

        this.uiState.sleepMenuUI.morningButton = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
        buttonY += 70;

        // Set alarm button (coming soon)
        ctx.fillStyle = '#4a5568';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#718096';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.fillStyle = '#cbd5e0';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Set Alarm (Coming Soon)', buttonX + 20, buttonY + 35);

        // Close button
        const closeButtonWidth = 100;
        const closeButtonHeight = 35;
        const closeX = x + width - closeButtonWidth - 20;
        const closeY = y + height - closeButtonHeight - 20;

        ctx.fillStyle = '#742a2a';
        ctx.fillRect(closeX, closeY, closeButtonWidth, closeButtonHeight);
        ctx.strokeStyle = '#9b2c2c';
        ctx.lineWidth = 2;
        ctx.strokeRect(closeX, closeY, closeButtonWidth, closeButtonHeight);
        ctx.fillStyle = '#f7fafc';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Close', closeX + closeButtonWidth / 2, closeY + 22);

        this.uiState.sleepMenuUI.closeButton = { x: closeX, y: closeY, width: closeButtonWidth, height: closeButtonHeight };
    }

    addChatMessage(container, emoji, text, role) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${role}`;
        msgDiv.innerHTML = `<span class="msg-emoji">${emoji}</span><span class="msg-text">${text}</span>`;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
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
        // End AI conversation
        if (typeof aiChat !== 'undefined') {
            aiChat.endConversation();
        }
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
        let menu;

        // Special menu for Yo Sushi
        if (building.name === "Yo Sushi") {
            menu = [
                { id: 'sushiRoll', name: 'Sushi Roll', price: 45, energy: 80, icon: '🍣' },
                { id: 'salmonNigiri', name: 'Salmon Nigiri', price: 50, energy: 85, icon: '🍣' },
                { id: 'tunaNigiri', name: 'Tuna Nigiri', price: 55, energy: 90, icon: '🍣' },
                { id: 'californiaRoll', name: 'California Roll', price: 48, energy: 82, icon: '🍣' },
                { id: 'sashimiPlatter', name: 'Sashimi Platter', price: 70, energy: 120, icon: '🍱' },
                { id: 'misoSoup', name: 'Miso Soup', price: 20, energy: 30, icon: '🍜' },
                { id: 'edamame', name: 'Edamame', price: 15, energy: 25, icon: '🫘' },
                { id: 'gyoza', name: 'Gyoza', price: 30, energy: 50, icon: '🥟' },
                { id: 'greenTea', name: 'Green Tea', price: 12, energy: 10, icon: '🍵' }
            ];
        } else {
            // Default cafe/restaurant menu
            menu = [
                { id: 'coffee', name: 'Coffee', price: 25, energy: 30, icon: '☕' },
                { id: 'sandwich', name: 'Sandwich', price: 40, energy: 70, icon: '🥪' },
                { id: 'cake', name: 'Cafe Cake', price: 60, energy: 100, icon: '🍰' },
                { id: 'salad', name: 'Fresh Salad', price: 35, energy: 50, icon: '🥗' },
                { id: 'pasta', name: 'Pasta', price: 50, energy: 90, icon: '🍝' },
                { id: 'tea', name: 'Tea', price: 20, energy: 15, icon: '🍵' }
            ];
        }

        this.showShopUI(building.name + " Menu", menu, (item) => {
            if (this.player.gold >= item.price) {
                // Eat immediately for energy
                this.player.gold -= item.price;
                this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + item.energy);

                // Also add one to inventory for later
                this.addToInventory({
                    id: item.id,
                    name: item.name,
                    icon: item.icon,
                    energy: item.energy,
                    type: 'food'
                });

                this.updateHUD();
                this.showMessage(`Ate ${item.name}! +${item.energy} energy (extra added to inventory)`);
            } else {
                this.showMessage("Not enough gold!");
            }
        });
    }

    // ===== SHOP SYSTEM =====
    showShopMenu(building) {
        const items = [
            // Seeds for farming
            { id: 'tomatoSeeds', name: 'Tomato Seeds', price: 20, icon: '🌱', type: 'seed', cropType: 'tomato' },
            { id: 'carrotSeeds', name: 'Carrot Seeds', price: 18, icon: '🌱', type: 'seed', cropType: 'carrot' },
            { id: 'cornSeeds', name: 'Corn Seeds', price: 25, icon: '🌱', type: 'seed', cropType: 'corn' },
            { id: 'wheatSeeds', name: 'Wheat Seeds', price: 15, icon: '🌱', type: 'seed', cropType: 'wheat' },
            { id: 'potatoSeeds', name: 'Potato Seeds', price: 22, icon: '🌱', type: 'seed', cropType: 'potato' },
            { id: 'strawberrySeeds', name: 'Strawberry Seeds', price: 30, icon: '🌱', type: 'seed', cropType: 'strawberry' },

            // Food ingredients
            { id: 'apple', name: 'Apple', price: 15, energy: 20, icon: '🍎', type: 'food' },
            { id: 'orange', name: 'Orange', price: 18, energy: 22, icon: '🍊', type: 'food' },
            { id: 'banana', name: 'Banana', price: 12, energy: 18, icon: '🍌', type: 'food' },
            { id: 'bread', name: 'Bread', price: 32, energy: 30, icon: '🍞', type: 'food' },
            { id: 'milk', name: 'Milk', price: 35, energy: 15, icon: '🥛', type: 'food' },
            { id: 'egg', name: 'Egg', price: 15, energy: 10, icon: '🥚', type: 'food' },
            { id: 'cheese', name: 'Cheese', price: 45, energy: 20, icon: '🧀', type: 'food' },
            { id: 'butter', name: 'Butter', price: 40, energy: 18, icon: '🧈', type: 'food' },

            // Baking supplies
            { id: 'flour', name: 'Flour', price: 25, energy: 0, icon: '🌾', type: 'baking' },
            { id: 'sugar', name: 'Sugar', price: 22, energy: 5, icon: '🧂', type: 'baking' },
            { id: 'salt', name: 'Salt', price: 8, energy: 0, icon: '🧂', type: 'baking' },
            { id: 'yeast', name: 'Yeast', price: 12, energy: 0, icon: '🧫', type: 'baking' },

            // Vegetables
            { id: 'tomato', name: 'Tomato', price: 14, energy: 16, icon: '🍅', type: 'food' },
            { id: 'carrot', name: 'Carrot', price: 10, energy: 15, icon: '🥕', type: 'food' },
            { id: 'potato', name: 'Potato', price: 11, energy: 17, icon: '🥔', type: 'food' },
            { id: 'lettuce', name: 'Lettuce', price: 13, energy: 12, icon: '🥬', type: 'food' },

            // Farm supplies
            { id: 'grain', name: 'Grain (animal feed)', price: 30, energy: 0, icon: '🌾', type: 'farmSupply' },
            { id: 'hay', name: 'Hay (animal feed)', price: 25, energy: 0, icon: '🌿', type: 'farmSupply' },

            // Special items
            { id: 'giftBox', name: 'Gift Box', price: 20, icon: '🎁', type: 'gift' },
            { id: 'ring', name: 'Engagement Ring', price: 500, icon: '💍', type: 'ring' }
        ];

        this.showShopUI(building.name, items, (item) => {
            if (this.player.gold >= item.price) {
                // Use the proper addToInventory function for stacking
                const added = this.addToInventory({
                    id: item.id,
                    name: item.name,
                    icon: item.icon,
                    energy: item.energy,
                    type: item.type,
                    cropType: item.cropType
                });

                if (added) {
                    this.player.gold -= item.price;
                    this.updateHUD();
                    this.showMessage(`Bought ${item.name}!`);
                }
                // addToInventory already shows "Inventory full!" message
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
        // Use interiorName if specified, otherwise use building name
        const interiorKey = building.interiorName || building.name;
        const interior = this.interiorMaps[interiorKey];

        if (!interior) {
            this.showMessage(`Can't enter ${building.name} yet!`);
            return;
        }

        // Save current position
        this.previousPosition = { x: this.player.x, y: this.player.y };

        // Switch to interior (use the interior key, not building name)
        this.currentMap = interiorKey;
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

                    // Add wood to inventory (5-8 pieces per tree)
                    const woodAmount = Math.floor(Math.random() * 4) + 5; // 5-8 wood
                    for (let w = 0; w < woodAmount; w++) {
                        this.addToInventory({
                            id: 'wood',
                            name: 'Wood',
                            icon: '🪵',
                            type: 'material'
                        });
                    }

                    this.showMessage(`Tree chopped! +$10 and ${woodAmount} wood`);

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
            // Special behavior for NPCs that follow the player (like Bridie)
            if (npc.followsPlayer && this.currentMap === 'overworld') {
                const dx = this.player.x - npc.x;
                const dy = this.player.y - npc.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const followDistance = npc.followDistance || 2;

                // Only follow if player is too far away
                if (distance > followDistance + 1) {
                    // Move toward player but stay at follow distance
                    const targetX = this.player.x - (dx / distance) * followDistance;
                    const targetY = this.player.y - (dy / distance) * followDistance;
                    this.moveNPCToward(npc, targetX, targetY);
                } else if (distance < followDistance - 0.5) {
                    // Too close, back up a bit
                    const targetX = this.player.x - (dx / distance) * followDistance;
                    const targetY = this.player.y - (dy / distance) * followDistance;
                    this.moveNPCToward(npc, targetX, targetY);
                }
                // Update base position to current position for follower NPCs
                npc.baseX = npc.x;
                npc.baseY = npc.y;
                return; // Skip normal wandering AI
            }

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
        // Only save essential game state - trees and map are regenerated on load
        const saveData = {
            player: this.player,
            inventory: this.inventory,
            time: this.time,
            relationships: this.relationships,
            quests: this.quests,
            completedQuests: this.completedQuests,
            crops: this.crops,
            wateredTiles: Array.from(this.wateredTiles)
        };

        try {
            localStorage.setItem('beecroftValleySave', JSON.stringify(saveData));
            this.showMessage("Game saved!");
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                this.showMessage("Save failed - storage full! Try clearing old saves.");
            } else {
                this.showMessage("Save failed!");
            }
            console.error('Save error:', e);
        }
    }

    loadGame() {
        const saveData = localStorage.getItem('beecroftValleySave');
        if (saveData) {
            try {
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
                // Trees and map are not saved - they regenerate on game start
                if (data.crops) this.crops = data.crops;
                if (data.wateredTiles) this.wateredTiles = new Set(data.wateredTiles);

                this.updateHUD();
                this.updateQuestDisplay();
                this.showMessage("Game loaded!");
                return true;
            } catch (e) {
                console.error('Load error:', e);
                this.showMessage("Failed to load save!");
                return false;
            }
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

        // Clamp camera to map bounds (only for overworld, interiors are small)
        if (this.currentMap === 'overworld') {
            const padding = 10;
            this.camera.x = Math.max(padding, Math.min(this.getCurrentMapWidth() - padding, this.camera.x));
            this.camera.y = Math.max(padding, Math.min(this.getCurrentMapHeight() - padding, this.camera.y));
        }
        // For interiors, just let camera follow player directly

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
            // Interior: dark background, then render floor tiles
            this.ctx.fillStyle = '#3a3a3a';
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

            // Add farm animals
            if (this.farmAnimals) {
                this.farmAnimals.forEach(animal => {
                    if (animal.x >= startX && animal.x < endX && animal.y >= startY && animal.y < endY) {
                        entities.push({ type: 'farmanimal', data: animal, sortY: animal.y, sortX: animal.x });
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

            // Add street lights
            if (this.streetLights) {
                this.streetLights.forEach(light => {
                    if (light.x >= startX && light.x < endX && light.y >= startY && light.y < endY) {
                        entities.push({ type: 'streetlight', data: light, sortY: light.y, sortX: light.x });
                    }
                });
            }

            // Add trees
            if (this.trees) {
                this.trees.forEach(tree => {
                    if (tree.x >= startX - 2 && tree.x < endX + 2 &&
                        tree.y >= startY - 2 && tree.y < endY + 2) {
                        entities.push({ type: 'tree', data: tree, sortY: tree.y, sortX: tree.x });
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
            // Add furniture
            if (interior && interior.furniture) {
                interior.furniture.forEach(furniture => {
                    entities.push({
                        type: 'furniture',
                        data: furniture,
                        sortY: furniture.y,
                        sortX: furniture.x
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
            } else if (entity.type === 'furniture') {
                this.renderFurniture(entity.data);
            } else if (entity.type === 'animal') {
                this.renderIsometricAnimal(entity.data);
            } else if (entity.type === 'farmanimal') {
                this.renderFarmAnimal(entity.data);
            } else if (entity.type === 'crop') {
                this.renderIsometricCrop(entity.data);
            } else if (entity.type === 'streetlight') {
                this.renderStreetLight(entity.data);
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

        // Render cooking and crafting UIs (on top of everything)
        if (this.cookingSystem) {
            this.cookingSystem.renderCookingUI(this.ctx);
        }
        if (this.craftingSystem) {
            this.craftingSystem.renderCraftingUI(this.ctx);
        }

        // Render sleep menu
        if (this.uiState.showingSleepMenu) {
            this.renderSleepMenu();
        }
    }

    // ===== ISOMETRIC ENTITY RENDERING =====
    renderIsometricTree(tree) {
        const treeHeight = 40; // Height of the tree in pixels
        // Use map system for coordinate conversion
        const screen = this.mapSystem.gameToScreen(
            tree.x, tree.y,
            this.camera.x, this.camera.y,
            this.canvas.width, this.canvas.height
        );

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

    renderStreetLight(light) {
        // Use map system for coordinate conversion (consistent with trees/crops)
        const screen = this.mapSystem.gameToScreen(
            light.x, light.y,
            this.camera.x, this.camera.y,
            this.canvas.width, this.canvas.height
        );
        const isNight = this.time && (this.time.hour >= 18 || this.time.hour < 6);

        // Street light post (gray pole, 2 tiles high)
        const postHeight = 50;
        this.ctx.fillStyle = '#5a5a5a';
        this.ctx.fillRect(screen.x - 2, screen.y - postHeight, 4, postHeight);

        // Post base
        this.ctx.fillStyle = '#3a3a3a';
        this.ctx.fillRect(screen.x - 4, screen.y, 8, 4);

        // Light fixture at top
        this.ctx.fillStyle = '#7a7a7a';
        this.ctx.beginPath();
        this.ctx.arc(screen.x, screen.y - postHeight, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // At night: glow effect
        if (isNight) {
            // Bright light at top
            this.ctx.fillStyle = '#ffffaa';
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y - postHeight, 3, 0, Math.PI * 2);
            this.ctx.fill();

            // Glowing yellow circle of light on ground (radius 3 tiles)
            const glowRadius = this.tileWidth * 1.5; // About 3 tiles
            const gradient = this.ctx.createRadialGradient(
                screen.x, screen.y, 0,
                screen.x, screen.y, glowRadius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 170, 0.3)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 170, 0.15)');
            gradient.addColorStop(1, 'rgba(255, 255, 170, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, glowRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
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

        // Add CLEAR VISIBLE DOOR if building can be entered
        if (building.canEnter && building.hasInterior) {
            this.renderBuildingDoor(building);
        }
    }

    renderBuildingDoor(building) {
        // Door at front center-bottom of building
        const doorX = building.x + Math.floor(building.width / 2);
        const doorY = building.y + building.height - 1;
        const doorScreen = this.worldToScreenWithCamera(doorX, doorY, 0);

        // Door background (wooden brown)
        const doorWidth = 16;
        const doorHeight = 24;
        this.ctx.fillStyle = '#5D4037'; // Dark brown
        this.ctx.fillRect(
            doorScreen.x - doorWidth / 2,
            doorScreen.y - doorHeight / 2,
            doorWidth,
            doorHeight
        );

        // Door frame (lighter wood)
        this.ctx.strokeStyle = '#8D6E63';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            doorScreen.x - doorWidth / 2,
            doorScreen.y - doorHeight / 2,
            doorWidth,
            doorHeight
        );

        // Door panels (detail)
        this.ctx.strokeStyle = '#4E342E';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            doorScreen.x - doorWidth / 2 + 2,
            doorScreen.y - doorHeight / 2 + 2,
            doorWidth - 4,
            doorHeight / 2 - 3
        );
        this.ctx.strokeRect(
            doorScreen.x - doorWidth / 2 + 2,
            doorScreen.y - 1,
            doorWidth - 4,
            doorHeight / 2 - 3
        );

        // Doorknob (golden brass)
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(doorScreen.x + doorWidth / 2 - 4, doorScreen.y, 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Doorknob outline
        this.ctx.strokeStyle = '#B8860B';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Check if player is near door for interaction hint
        if (this.player) {
            const dist = Math.sqrt(
                Math.pow(this.player.x - doorX, 2) +
                Math.pow(this.player.y - doorY, 2)
            );

            // Show "Press SPACE to enter" if player is close
            if (dist < 2) {
                this.ctx.font = '10px Arial';
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 3;
                this.ctx.textAlign = 'center';

                const text = `Press SPACE to enter ${building.name}`;
                this.ctx.strokeText(text, doorScreen.x, doorScreen.y - 35);
                this.ctx.fillText(text, doorScreen.x, doorScreen.y - 35);
                this.ctx.textAlign = 'left';
            }
        }
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

        // Render tiles relative to camera
        for (let y = 0; y < interior.height; y++) {
            for (let x = 0; x < interior.width; x++) {
                const screen = this.worldToScreenWithCamera(x, y, 0);
                const tile = interior.tiles[y]?.[x] || 7;

                // Checkerboard floor pattern for visibility
                const isLight = (x + y) % 2 === 0;

                if (tile === 7) {
                    // Floor tile - checkerboard pattern
                    const floorColor = isLight ? '#e8d4b8' : '#d4c4a8';
                    this.drawIsometricTile(screen.x, screen.y, floorColor, '#c0a080');
                } else if (tile === 6) {
                    // Obstacle (table, shelf, counter, etc.)
                    this.drawIsometricTile(screen.x, screen.y, '#8B4513', '#654321');
                    // Add a small highlight on top
                    this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    this.ctx.fillRect(screen.x - 8, screen.y - 10, 16, 4);
                }
            }
        }

        // Draw walls around the perimeter
        this.ctx.fillStyle = '#a08060';
        for (let x = 0; x < interior.width; x++) {
            // Top wall
            const topScreen = this.worldToScreenWithCamera(x, -0.5, 0);
            this.ctx.fillRect(topScreen.x - this.tileWidth/2, topScreen.y - 30, this.tileWidth, 30);
        }
        for (let y = 0; y < interior.height; y++) {
            // Left wall
            const leftScreen = this.worldToScreenWithCamera(-0.5, y, 0);
            this.ctx.fillRect(leftScreen.x - 10, leftScreen.y - 20, 10, 30);
        }

        // Draw exit door indicator
        if (interior.exitX !== undefined && interior.exitY !== undefined) {
            const exitScreen = this.worldToScreenWithCamera(interior.exitX, interior.exitY, 0);

            // Green glow
            this.ctx.fillStyle = 'rgba(76, 175, 80, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(exitScreen.x, exitScreen.y, 20, 0, Math.PI * 2);
            this.ctx.fill();

            // Door icon
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🚪', exitScreen.x, exitScreen.y + 6);

            // EXIT label
            this.ctx.font = 'bold 10px Arial';
            this.ctx.fillStyle = '#2e7d32';
            this.ctx.fillText('EXIT', exitScreen.x, exitScreen.y + 22);
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

    renderFarmAnimal(animal) {
        const screen = this.worldToScreenWithCamera(animal.x, animal.y, 0);

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(screen.x, screen.y + 2, 10, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Render farm animal emoji (larger than wild animals)
        this.ctx.font = '28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(animal.emoji, screen.x, screen.y);
        this.ctx.textAlign = 'left';

        // Happiness indicator (hearts above animal if happy)
        if (animal.happiness > 80) {
            this.ctx.font = '12px Arial';
            this.ctx.fillText('💚', screen.x, screen.y - 20);
        } else if (animal.happiness < 30) {
            this.ctx.font = '12px Arial';
            this.ctx.fillText('💔', screen.x, screen.y - 20);
        }

        // Interactive hint if player nearby
        if (this.player) {
            const dist = Math.sqrt(
                Math.pow(this.player.x - animal.x, 2) +
                Math.pow(this.player.y - animal.y, 2)
            );

            if (dist < 1.5) {
                this.ctx.font = '8px Arial';
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2;
                this.ctx.textAlign = 'center';

                let actionText = `${animal.name} - Press E to Pet`;
                if (!animal.fedToday) {
                    actionText = `${animal.name} - Press F to Feed`;
                }

                this.ctx.strokeText(actionText, screen.x, screen.y - 30);
                this.ctx.fillText(actionText, screen.x, screen.y - 30);
                this.ctx.textAlign = 'left';
            }
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

    // ===== INVENTORY HELPERS =====
    getInventoryCount(itemId) {
        let count = 0;
        for (const item of this.inventory.items) {
            if (item && item.id === itemId) {
                // Check if item has a quantity field (stacked items)
                if (item.quantity !== undefined) {
                    count += item.quantity;
                } else {
                    count++;
                }
            }
        }
        return count;
    }

    addToInventory(item) {
        // Try to stack with existing item of same id
        const existingItem = this.inventory.items.find(i => i && i.id === item.id);

        if (existingItem) {
            // Stack with existing item
            if (existingItem.quantity !== undefined) {
                existingItem.quantity++;
            } else {
                existingItem.quantity = 2; // Convert to quantity-based
            }
            return true;
        }

        // Add new item
        if (this.inventory.items.length >= this.inventory.maxSlots) {
            this.showMessage("Inventory full!");
            return false;
        }

        // Initialize with quantity 1
        item.quantity = 1;
        this.inventory.items.push(item);
        return true;
    }

    removeFromInventory(itemId, amount = 1) {
        let removed = 0;

        for (let i = this.inventory.items.length - 1; i >= 0 && removed < amount; i--) {
            const item = this.inventory.items[i];
            if (item && item.id === itemId) {
                if (item.quantity !== undefined && item.quantity > 1) {
                    // Decrease quantity
                    const removeFromStack = Math.min(item.quantity, amount - removed);
                    item.quantity -= removeFromStack;
                    removed += removeFromStack;

                    if (item.quantity <= 0) {
                        this.inventory.items.splice(i, 1);
                    }
                } else {
                    // Remove entire item
                    this.inventory.items.splice(i, 1);
                    removed++;
                }
            }
        }
        return removed === amount;
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
