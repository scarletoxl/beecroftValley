// Beecroft Valley - Main Game Engine
// A realistic recreation of Beecroft, NSW with full game features

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Isometric tile dimensions (2:1 ratio)
        this.tileWidth = 64;  // Width of diamond
        this.tileHeight = 32; // Height of diamond
        this.tileSize = 32;   // Keep for compatibility with some calculations

        this.mapWidth = 250;
        this.mapHeight = 250;

        // Camera for scrolling (in world coordinates)
        this.camera = { x: 0, y: 0 };

        // Game state - Initialize with defaults
        this.player = {
            x: 85, y: 135, // Start at farm house in western Beecroft
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

        // Initialize game
        this.initMap();
        this.initNPCs();
        this.initBuildings();
        this.initInteriors();
        this.initSprites();
        this.initAnimals();
        this.createUI();
        this.setupEventListeners();

        // Start game loop after sprites load
        this.spriteManager.waitForAll(() => {
            this.gameLoop();
            this.startTimeCycle();
        });
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
    initMap() {
        this.map = [];
        this.trees = [];
        this.buildings = [];

        // Fill with grass
        for (let y = 0; y < this.mapHeight; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                this.map[y][x] = 0;
            }
        }

        // Roads - Based on real Beecroft geography

        // Beecroft Road - Main north-south arterial (4 tiles wide)
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 198; x <= 201; x++) {
                this.map[y][x] = 3;
            }
        }

        // Hannah Street - Main east-west shopping strip (4 tiles wide)
        for (let x = 80; x < 320; x++) {
            for (let y = 188; y <= 191; y++) {
                this.map[y][x] = 3;
            }
        }

        // Chapman Avenue - East-west north of station (4 tiles wide)
        for (let x = 100; x < 300; x++) {
            for (let y = 173; y <= 176; y++) {
                this.map[y][x] = 3;
            }
        }

        // Copeland Road - East-west south of station (4 tiles wide)
        for (let x = 120; x < 280; x++) {
            for (let y = 213; y <= 216; y++) {
                this.map[y][x] = 3;
            }
        }

        // Wongala Crescent - Curved road through eastern shopping area (3 tiles wide)
        for (let i = 0; i < 50; i++) {
            const x = 220 + Math.floor(i * 0.6);
            const y = 180 + Math.floor(Math.sin(i * 0.15) * 15);
            if (x < this.mapWidth && y < this.mapHeight) {
                for (let w = 0; w < 3; w++) {
                    if (this.map[y] && this.map[y][x + w]) {
                        this.map[y][x + w] = 3;
                    }
                }
            }
        }

        // Sutherland Road - Diagonal southeast from station (3 tiles wide)
        for (let i = 0; i < 80; i++) {
            const x = 210 + Math.floor(i * 0.7);
            const y = 200 + Math.floor(i * 0.5);
            if (x < this.mapWidth && y < this.mapHeight) {
                for (let w = 0; w < 3; w++) {
                    if (this.map[y + w] && this.map[y + w][x]) {
                        this.map[y + w][x] = 3;
                    }
                }
            }
        }

        // Malton Road - East from station (3 tiles wide)
        for (let x = 200; x < 260; x++) {
            for (let y = 195; y <= 197; y++) {
                this.map[y][x] = 3;
            }
        }

        // Local streets network (2-3 tiles wide)
        // Eastern residential streets
        for (let x = 250; x < 320; x++) {
            for (let y = 165; y <= 167; y++) {
                this.map[y][x] = 3;
            }
        }

        // Western residential streets
        for (let x = 60; x < 180; x++) {
            for (let y = 130; y <= 132; y++) {
                this.map[y][x] = 3;
            }
        }

        // North-south connector roads
        for (let y = 130; y < 220; y++) {
            for (let x = 150; x <= 152; x++) {
                this.map[y][x] = 3;
            }
        }

        for (let y = 160; y < 230; y++) {
            for (let x = 250; x <= 252; x++) {
                this.map[y][x] = 3;
            }
        }

        // Railway tracks - East-west through station (2 tiles wide)
        for (let x = 50; x < 350; x++) {
            this.map[194][x] = 8;
            this.map[195][x] = 8;
        }

        this.addTreeClusters();
        this.addParks();
    }

    addTreeClusters() {
        const treeAreas = [
            // Western Beecroft - Dense Blue Gum forest areas
            { x: 10, y: 240, width: 120, height: 90, density: 0.85 }, // SW forest
            { x: 20, y: 140, width: 100, height: 80, density: 0.75 }, // W forest
            { x: 15, y: 50, width: 110, height: 70, density: 0.7 }, // NW forest

            // Fearnley Park area - Very dense
            { x: 40, y: 160, width: 80, height: 50, density: 0.9 },

            // Northern residential - Street trees
            { x: 140, y: 20, width: 150, height: 60, density: 0.5 },
            { x: 300, y: 40, width: 80, height: 80, density: 0.6 },

            // Eastern residential areas - Medium density
            { x: 260, y: 140, width: 100, height: 80, density: 0.6 },
            { x: 280, y: 220, width: 90, height: 70, density: 0.65 },
            { x: 320, y: 160, width: 60, height: 100, density: 0.5 },

            // Southern areas
            { x: 150, y: 260, width: 120, height: 80, density: 0.7 },
            { x: 250, y: 280, width: 100, height: 80, density: 0.65 },
            { x: 50, y: 330, width: 140, height: 50, density: 0.75 },

            // Between roads - Street tree clusters
            { x: 160, y: 140, width: 30, height: 25, density: 0.7 },
            { x: 210, y: 155, width: 40, height: 30, density: 0.6 },
            { x: 155, y: 200, width: 35, height: 35, density: 0.65 },

            // Around schools - Leafy surroundings
            { x: 165, y: 210, width: 45, height: 40, density: 0.7 }, // Near Beecroft Public
            { x: 180, y: 150, width: 50, height: 35, density: 0.6 }, // Near Arden
            { x: 265, y: 155, width: 45, height: 40, density: 0.65 }, // Near Roselea

            // Central pockets between buildings
            { x: 205, y: 170, width: 30, height: 25, density: 0.5 },
            { x: 220, y: 200, width: 25, height: 30, density: 0.55 },

            // Northeast corner
            { x: 330, y: 80, width: 50, height: 90, density: 0.6 },

            // Far western edge
            { x: 5, y: 10, width: 40, height: 30, density: 0.7 }
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
    }

    addParks() {
        const parks = [
            // Railway Gardens Playground - North of station
            { x: 195, y: 185, width: 10, height: 8 },

            // Village Green - West of shopping area
            { x: 170, y: 185, width: 15, height: 12 },

            // Fearnley Park - Western area, surrounded by Blue Gum forest
            { x: 45, y: 165, width: 25, height: 18 },

            // Chilworth Reserve - Northeast area
            { x: 290, y: 150, width: 18, height: 12 },

            // Booth Park - Southeast area
            { x: 260, y: 250, width: 20, height: 15 },

            // Small local parks scattered throughout
            { x: 140, y: 145, width: 12, height: 8 },
            { x: 225, y: 220, width: 10, height: 8 }
        ];

        parks.forEach(park => {
            for (let y = park.y; y < park.y + park.height; y++) {
                for (let x = park.x; x < park.x + park.width; x++) {
                    this.map[y][x] = 9;
                }
            }
        });
    }

    // ===== BUILDING INITIALIZATION =====
    initBuildings() {
        this.buildings = [
            // === CENTRAL STATION AREA (200, 195) ===
            {
                name: "Beecroft Railway Station",
                x: 196, y: 192,
                width: 12, height: 8,
                type: "station",
                emoji: "🚂",
                color: "#8B4513",
                hasInterior: true,
                canEnter: true
            },
            {
                name: "Railway Gardens Playground",
                x: 195, y: 185,
                width: 8, height: 6,
                type: "playground",
                emoji: "🎪",
                color: "#FFE082",
                hasInterior: false
            },

            // === HANNAH ST & BEECROFT RD SHOPPING AREA ===
            {
                name: "Woolworths Beecroft",
                x: 208, y: 182,
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
                name: "Hannah's Beecroft",
                x: 218, y: 182,
                width: 6, height: 4,
                type: "restaurant",
                emoji: "🍽️",
                color: "#FFCCBC",
                hasInterior: true,
                canEnter: true,
                isRestaurant: true,
                hasJobs: true
            },
            {
                name: "The Beehive Cafe",
                x: 203, y: 185,
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
                name: "Beecroft Medical Centre",
                x: 195, y: 192,
                width: 6, height: 4,
                type: "clinic",
                emoji: "🏥",
                color: "#E1F5FE",
                hasInterior: true,
                canEnter: true,
                hasDoctor: true
            },
            {
                name: "HerGP Medical Clinic",
                x: 193, y: 177,
                width: 5, height: 4,
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
                x: 215, y: 179,
                width: 5, height: 4,
                type: "vet",
                emoji: "🐾",
                color: "#E0F7FA",
                hasInterior: true,
                canEnter: true
            },
            {
                name: "Vintage Cellars Beecroft",
                x: 197, y: 200,
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
                name: "Snap Fitness 24/7",
                x: 210, y: 186,
                width: 6, height: 5,
                type: "gym",
                emoji: "💪",
                color: "#CFD8DC",
                hasInterior: true,
                canEnter: true,
                hasJobs: true
            },
            {
                name: "Beecroft Malaysian Restaurant",
                x: 220, y: 186,
                width: 5, height: 4,
                type: "restaurant",
                emoji: "🍜",
                color: "#FFF9C4",
                hasInterior: true,
                canEnter: true,
                isRestaurant: true
            },

            // === CHAPMAN AVENUE AREA ===
            {
                name: "Ross Tours",
                x: 188, y: 170,
                width: 5, height: 3,
                type: "business",
                emoji: "🚌",
                color: "#E3F2FD",
                hasInterior: true,
                canEnter: true
            },

            // === MALTON ROAD AREA ===
            {
                name: "The Malton Hotel",
                x: 230, y: 193,
                width: 8, height: 6,
                type: "pub",
                emoji: "🍺",
                color: "#D7CCC8",
                hasInterior: true,
                canEnter: true,
                isRestaurant: true
            },

            // === SCHOOLS ===
            {
                name: "Beecroft Public School (Est. 1897)",
                x: 178, y: 218,
                width: 12, height: 10,
                type: "school",
                emoji: "🏫",
                color: "#FFF9C4",
                hasInterior: true,
                canEnter: true,
                hasJobs: true
            },
            {
                name: "The Verandah Beecroft",
                x: 175, y: 215,
                width: 4, height: 3,
                type: "cafe",
                emoji: "☕",
                color: "#FFCCBC",
                hasInterior: true,
                canEnter: true,
                isRestaurant: true
            },
            {
                name: "Arden Anglican School",
                x: 192, y: 158,
                width: 11, height: 9,
                type: "school",
                emoji: "🏫",
                color: "#E0F2F1",
                hasInterior: true,
                canEnter: true,
                hasJobs: true
            },
            {
                name: "Roselea Public School",
                x: 268, y: 168,
                width: 12, height: 9,
                type: "school",
                emoji: "🏫",
                color: "#FCE4EC",
                hasInterior: true,
                canEnter: true,
                hasJobs: true
            },

            // === PARKS & RECREATION ===
            {
                name: "Village Green",
                x: 170, y: 185,
                width: 8, height: 6,
                type: "park",
                emoji: "🌳",
                color: "#F1F8E9",
                hasInterior: false
            },
            {
                name: "Fearnley Park",
                x: 45, y: 165,
                width: 10, height: 8,
                type: "park",
                emoji: "🌲",
                color: "#E8F5E9",
                hasInterior: false
            },
            {
                name: "Chilworth Reserve",
                x: 290, y: 150,
                width: 9, height: 7,
                type: "park",
                emoji: "🏞️",
                color: "#F1F8E9",
                hasInterior: false
            },
            {
                name: "Booth Park",
                x: 260, y: 250,
                width: 10, height: 8,
                type: "park",
                emoji: "⚽",
                color: "#E8F5E9",
                hasInterior: false
            },

            // === OTHER FACILITIES ===
            {
                name: "Beecroft Club (Bowling)",
                x: 245, y: 200,
                width: 8, height: 6,
                type: "recreation",
                emoji: "🎳",
                color: "#D1C4E9",
                hasInterior: true,
                canEnter: true
            },
            {
                name: "Tennis Club",
                x: 255, y: 210,
                width: 7, height: 6,
                type: "recreation",
                emoji: "🎾",
                color: "#C5CAE9",
                hasInterior: true,
                canEnter: true
            },

            // === RESIDENTIAL ===
            {
                name: "Your Farm House",
                x: 80, y: 130,
                width: 6, height: 6,
                type: "home",
                emoji: "🏡",
                color: "#FFEBEE",
                hasInterior: true,
                canEnter: true,
                isPlayerHome: true
            },
            {
                name: "Community Garden",
                x: 120, y: 145,
                width: 7, height: 6,
                type: "garden",
                emoji: "🌻",
                color: "#F1F8E9",
                hasInterior: false
            },

            // === AUTO & SERVICES ===
            {
                name: "Beecroft Auto Sales",
                x: 235, y: 185,
                width: 8, height: 6,
                type: "cardealer",
                emoji: "🚗",
                color: "#B3E5FC",
                hasInterior: true,
                canEnter: true,
                isCarDealer: true
            }
        ];

        // Mark building tiles
        this.buildings.forEach(building => {
            for (let y = building.y; y < building.y + building.height; y++) {
                for (let x = building.x; x < building.x + building.width; x++) {
                    if (x < this.mapWidth && y < this.mapHeight) {
                        this.map[y][x] = 6;
                    }
                }
            }
        });
    }

    // ===== NPC INITIALIZATION =====
    initNPCs() {
        this.npcs = [
            // === CENTRAL SHOPPING AREA ===
            {
                name: "Mrs. Chen", x: 205, y: 187, emoji: "👵",
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
                baseX: 205,
                baseY: 187
            },
            {
                name: "Emma", x: 212, y: 185, emoji: "👩",
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
                baseX: 212,
                baseY: 185
            },
            {
                name: "Hannah", x: 220, y: 184, emoji: "👩‍🍳",
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
                baseX: 220,
                baseY: 184
            },
            {
                name: "Marcus", x: 199, y: 202, emoji: "🍷",
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
                baseX: 199,
                baseY: 202
            },
            {
                name: "Jade", x: 212, y: 188, emoji: "💪",
                role: "fitness trainer",
                greeting: "Ready to get fit? Join Snap Fitness!",
                dialogues: [
                    "We're open 24/7 for your convenience!",
                    "New to fitness? I can help!",
                    "Personal training sessions available.",
                    "Fitness is a lifestyle, not a phase."
                ],
                offersJob: true,
                jobType: "trainer",
                jobPay: 20,
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 212,
                baseY: 188
            },
            {
                name: "Wei", x: 222, y: 188, emoji: "👨‍🍳",
                role: "restaurant chef",
                greeting: "Best Malaysian food in Sydney! Come try!",
                dialogues: [
                    "Our laksa is legendary!",
                    "Made with authentic Malaysian spices.",
                    "Family recipes passed down generations.",
                    "Spicy or mild, we do it all!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 222,
                baseY: 188
            },

            // === MEDICAL FACILITIES ===
            {
                name: "Dr. Shin Li", x: 195, y: 179, emoji: "👩‍⚕️",
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
                baseX: 195,
                baseY: 179
            },
            {
                name: "Dr. Patel", x: 197, y: 194, emoji: "👨‍⚕️",
                role: "doctor",
                greeting: "Stay healthy! Don't forget to rest.",
                dialogues: [
                    "Rest is important for recovery.",
                    "Make sure to eat well!",
                    "Exercise keeps you healthy.",
                    "I can help if you're feeling unwell."
                ],
                isDoctor: true,
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 197,
                baseY: 194
            },
            {
                name: "Dr. Emily", x: 217, y: 181, emoji: "👩‍⚕️",
                role: "veterinarian",
                greeting: "Bringing your furry friend for a checkup?",
                dialogues: [
                    "Pets are family too!",
                    "Regular vet visits keep pets healthy.",
                    "We treat all domestic animals.",
                    "Emergency services available 24/7."
                ],
                isDoctor: true,
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 217,
                baseY: 181
            },

            // === STATION AREA ===
            {
                name: "Tom", x: 200, y: 196, emoji: "🧑‍💼",
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
                baseX: 200,
                baseY: 196
            },
            {
                name: "Olivia", x: 198, y: 187, emoji: "👧",
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
                baseX: 198,
                baseY: 187
            },

            // === SCHOOLS ===
            {
                name: "Sarah", x: 182, y: 222, emoji: "👩‍🏫",
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
                baseX: 182,
                baseY: 222
            },
            {
                name: "Principal Roberts", x: 184, y: 220, emoji: "👨‍🏫",
                role: "school principal",
                greeting: "Welcome to Beecroft Public School!",
                dialogues: [
                    "Excellence in education since 1897.",
                    "Our heritage is our pride.",
                    "Community is important to us.",
                    "Proud to serve Beecroft families."
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 184,
                baseY: 220
            },
            {
                name: "David", x: 196, y: 162, emoji: "👨‍🏫",
                role: "principal",
                greeting: "Welcome to Arden Anglican School!",
                dialogues: [
                    "Faith and learning together.",
                    "Our school has great facilities.",
                    "Building character and knowledge.",
                    "A caring Christian community."
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 196,
                baseY: 162
            },
            {
                name: "Ms. Thompson", x: 272, y: 172, emoji: "👩‍🏫",
                role: "teacher",
                greeting: "Roselea Public is a wonderful school!",
                dialogues: [
                    "We're in the heart of East Beecroft.",
                    "Small school, big heart!",
                    "Every child matters here.",
                    "Join our school community!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 272,
                baseY: 172
            },

            // === PUBS & RESTAURANTS ===
            {
                name: "Barry", x: 234, y: 196, emoji: "🍺",
                role: "publican",
                greeting: "Welcome to The Malton! Pull up a stool!",
                dialogues: [
                    "The Malton has been here since 1888!",
                    "Best pub meals in Beecroft.",
                    "Great spot to watch the footy.",
                    "Cold beer, warm welcome!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 234,
                baseY: 196
            },
            {
                name: "Claire", x: 177, y: 217, emoji: "☕",
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
                baseX: 177,
                baseY: 217
            },

            // === RECREATION ===
            {
                name: "Lisa", x: 248, y: 203, emoji: "👱‍♀️",
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
                baseX: 248,
                baseY: 203
            },
            {
                name: "Mike", x: 258, y: 213, emoji: "🎾",
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
                baseX: 258,
                baseY: 213
            },

            // === PARKS & NATURE ===
            {
                name: "Grace", x: 50, y: 170, emoji: "👩",
                role: "park ranger",
                greeting: "Enjoying Fearnley Park's beautiful bushland?",
                dialogues: [
                    "Please stay on the trails!",
                    "Blue Gums are precious.",
                    "Native wildlife lives here.",
                    "Respect nature and it respects you."
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 50,
                baseY: 170
            },
            {
                name: "Jack", x: 122, y: 148, emoji: "🧑‍🌾",
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
                baseX: 122,
                baseY: 148
            },

            // === SERVICES ===
            {
                name: "Ross", x: 190, y: 172, emoji: "🚌",
                role: "tour operator",
                greeting: "Ross Tours - we'll take you anywhere!",
                dialogues: [
                    "Family business for 40 years.",
                    "Wine tours are our specialty.",
                    "Group bookings welcome!",
                    "See Australia in comfort!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 190,
                baseY: 172
            },
            {
                name: "Steve", x: 238, y: 188, emoji: "🚗",
                role: "car salesman",
                greeting: "Looking for a reliable car? We've got you covered!",
                dialogues: [
                    "Best deals in Sydney!",
                    "Trade-ins welcome.",
                    "Family cars our specialty.",
                    "Drive away today!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 238,
                baseY: 188
            },

            // === RESIDENTIAL ===
            {
                name: "Ben", x: 85, y: 135, emoji: "🧑",
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
                baseX: 85,
                baseY: 135
            },
            {
                name: "James", x: 175, y: 190, emoji: "👨",
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
                baseX: 175,
                baseY: 190
            },
            {
                name: "Sophie", x: 265, y: 255, emoji: "👧",
                role: "local kid",
                greeting: "Want to play at Booth Park?",
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
                baseX: 265,
                baseY: 255
            },
            {
                name: "Margaret", x: 295, y: 155, emoji: "👵",
                role: "retired teacher",
                greeting: "I walk through Chilworth Reserve every day!",
                dialogues: [
                    "Beecroft has changed so much.",
                    "The trees keep us cool.",
                    "I taught here for 40 years.",
                    "Best suburb in Sydney!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 295,
                baseY: 155
            },
            {
                name: "Alex", x: 270, y: 170, emoji: "🧑",
                role: "parent",
                greeting: "Just picking up the kids from school!",
                dialogues: [
                    "Roselea Public is excellent.",
                    "Great teachers here.",
                    "Safe, friendly community.",
                    "Perfect for families!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 270,
                baseY: 170
            },
            {
                name: "Lucy", x: 210, y: 195, emoji: "👩",
                role: "commuter",
                greeting: "Catching the train to work!",
                dialogues: [
                    "Quick commute to the city.",
                    "Beecroft Station is so reliable.",
                    "Love living here, working there.",
                    "Best of both worlds!"
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 210,
                baseY: 195
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

    initAnimals() {
        // Generate animal sprites
        const animalTypes = ['kookaburra', 'lorikeet', 'lizard', 'magpie', 'cat', 'dog', 'possum'];
        this.animalSprites = {};

        animalTypes.forEach(type => {
            const spriteData = this.spriteGenerator.generateAnimalSprite(24, 24, type);
            this.animalSprites[type] = new SpriteSheet(spriteData, 24, 24);
        });

        // Add animals to the world
        this.addAnimalToWorld('kookaburra', 200, 170, 30);  // Near railway gardens
        this.addAnimalToWorld('kookaburra', 180, 220, 20);  // Near Beecroft Public School
        this.addAnimalToWorld('lorikeet', 195, 186, 40);    // Village green
        this.addAnimalToWorld('lorikeet', 290, 152, 35);    // Chilworth Reserve
        this.addAnimalToWorld('lorikeet', 50, 170, 30);     // Fearnley Park
        this.addAnimalToWorld('magpie', 170, 187, 45);      // Village green
        this.addAnimalToWorld('magpie', 260, 255, 40);      // Booth Park
        this.addAnimalToWorld('lizard', 190, 175, 15);      // Near paths
        this.addAnimalToWorld('lizard', 215, 195, 12);      // Near paths
        this.addAnimalToWorld('cat', 85, 135, 25);          // Residential area (west)
        this.addAnimalToWorld('cat', 160, 150, 20);         // Residential area
        this.addAnimalToWorld('dog', 90, 140, 30);          // Residential area (west)
        this.addAnimalToWorld('dog', 155, 145, 25);         // Residential area
        this.addAnimalToWorld('possum', 45, 168, 20);       // Fearnley Park (forest)
        this.addAnimalToWorld('possum', 30, 160, 18);       // Western forest
    }

    addAnimalToWorld(type, x, y, wanderRadius) {
        this.animals.push({
            type,
            x,
            y,
            baseX: x,
            baseY: y,
            wanderRadius,
            targetX: x,
            targetY: y,
            speed: type === 'lorikeet' ? 0.08 : type === 'lizard' ? 0.03 : 0.05,
            moveTimer: 0,
            standTimer: Math.random() * 3000,
            frame: 0,
            frameTimer: 0,
            sprite: this.animalSprites[type]
        });
    }

    // ===== INTERIOR MAPS =====
    initInteriors() {
        // Create simple interior layouts for buildings
        this.interiorMaps = {
            "The Beehive Cafe": {
                width: 15,
                height: 12,
                tiles: this.createCafeInterior(),
                exitX: 7,
                exitY: 11,
                spawnX: 7,
                spawnY: 10
            },
            "Beecroft Place (Woolworths)": {
                width: 20,
                height: 15,
                tiles: this.createShopInterior(),
                exitX: 10,
                exitY: 14,
                spawnX: 10,
                spawnY: 13
            },
            "Your Farm House": {
                width: 12,
                height: 10,
                tiles: this.createHomeInterior(),
                exitX: 6,
                exitY: 9,
                spawnX: 6,
                spawnY: 8
            },
            "HerGP Medical Clinic": {
                width: 10,
                height: 8,
                tiles: this.createClinicInterior(),
                exitX: 5,
                exitY: 7,
                spawnX: 5,
                spawnY: 6
            },
            "Beecroft Auto Sales": {
                width: 18,
                height: 12,
                tiles: this.createCarDealerInterior(),
                exitX: 9,
                exitY: 11,
                spawnX: 9,
                spawnY: 10
            }
        };
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

            // Talk to NPCs / Enter buildings
            if (e.key === ' ') {
                if (this.currentMap === 'overworld') {
                    const building = this.getNearbyBuilding();
                    if (building && building.canEnter) {
                        this.enterBuilding(building);
                    } else {
                        this.talkToNearbyNPC();
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
        if (building.isRestaurant) {
            this.showRestaurantMenu(building);
        } else if (building.isShop) {
            this.showShopMenu(building);
        } else if (building.isCarDealer) {
            this.showCarDealer();
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
            { name: 'Seeds', price: 10, emoji: '🌱', type: 'seed' },
            { name: 'Watering Can Refill', price: 5, emoji: '💧', type: 'consumable' },
            { name: 'Apple', price: 3, energy: 15, emoji: '🍎', type: 'food' },
            { name: 'Bread', price: 4, energy: 20, emoji: '🍞', type: 'food' },
            { name: 'Fertilizer', price: 8, emoji: '💩', type: 'tool' },
            { name: 'Gift Box', price: 20, emoji: '🎁', type: 'gift' }
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
            if (this.currentMap === 'overworld' && this.map[tileY][tileX] === 0) {
                this.map[tileY][tileX] = 4;
                this.player.energy = Math.max(0, this.player.energy - 2);
                this.updateHUD();
            }
        } else if (this.currentTool === 'axe') {
            this.chopTree();
        } else if (this.currentTool === 'water') {
            this.showMessage('Watering...');
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
            map: this.map
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
            this.quests = data.quests || [];
            this.completedQuests = data.completedQuests || [];
            if (data.trees) this.trees = data.trees;
            if (data.map) this.map = data.map;

            this.updateHUD();
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

        // Collision detection
        const tileX = Math.floor(this.player.x);
        const tileY = Math.floor(this.player.y);

        const currentMapData = this.getCurrentMapData();
        if (currentMapData[tileY] && (currentMapData[tileY][tileX] === 2 || currentMapData[tileY][tileX] === 6)) {
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
        // Clear canvas with sky color
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const currentMapData = this.getCurrentMapData();

        // Calculate visible tile range (generous bounds for isometric)
        const viewRange = 25;
        const startX = Math.max(0, Math.floor(this.camera.x - viewRange));
        const startY = Math.max(0, Math.floor(this.camera.y - viewRange));
        const endX = Math.min(this.getCurrentMapWidth(), Math.ceil(this.camera.x + viewRange));
        const endY = Math.min(this.getCurrentMapHeight(), Math.ceil(this.camera.y + viewRange));

        // Render tiles (isometric diamonds)
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (!currentMapData[y] || currentMapData[y][x] === undefined) continue;

                const tile = currentMapData[y][x];
                const screen = this.worldToScreenWithCamera(x, y, 0);

                let color;
                let height = 0;
                let useTexture = false;
                let textureName = null;

                switch (tile) {
                    case 0: // Grass
                        textureName = 'grass';
                        useTexture = true;
                        break;
                    case 1: // Dirt
                        textureName = 'path';
                        useTexture = true;
                        break;
                    case 2: // Water
                        textureName = 'water';
                        useTexture = true;
                        height = -5; // Water slightly lower
                        break;
                    case 3: // Road
                        textureName = 'road';
                        useTexture = true;
                        height = -2; // Roads slightly recessed
                        break;
                    case 4: // Farmland
                        color = '#6b4423';
                        break;
                    case 6: // Building (will be drawn separately)
                        color = '#d4a373';
                        break;
                    case 7: // Floor
                        color = '#f5deb3';
                        break;
                    case 8: // Rails
                        textureName = 'railway';
                        useTexture = true;
                        break;
                    case 9: // Flowers
                        textureName = 'park';
                        useTexture = true;
                        break;
                    default:
                        textureName = 'grass';
                        useTexture = true;
                }

                // Adjust screen position for height
                const finalScreen = this.worldToScreenWithCamera(x, y, height);

                if (useTexture && this.tileSprites && this.tileSprites[textureName]) {
                    // Draw textured tile
                    this.drawIsometricTexturedTile(finalScreen.x, finalScreen.y, this.tileSprites[textureName]);
                } else {
                    // Fallback to solid color
                    this.drawIsometricTile(finalScreen.x, finalScreen.y, color || this.getSeasonalGrassColor());
                }
            }
        }

        // Collect all entities for depth sorting
        const entities = [];

        // Add trees (only on overworld)
        if (this.currentMap === 'overworld') {
            this.trees.forEach(tree => {
                if (tree.x >= startX && tree.x < endX && tree.y >= startY && tree.y < endY) {
                    entities.push({ type: 'tree', data: tree, sortY: tree.y, sortX: tree.x });
                }
            });

            // Add buildings
            this.buildings.forEach(building => {
                if (building.x < endX && building.x + building.width > startX &&
                    building.y < endY && building.y + building.height > startY) {
                    // Sort by bottom of building
                    entities.push({
                        type: 'building',
                        data: building,
                        sortY: building.y + building.height,
                        sortX: building.x
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
            } else if (entity.type === 'building') {
                this.renderIsometricBuilding(entity.data);
            } else if (entity.type === 'npc') {
                this.renderIsometricNPC(entity.data);
            } else if (entity.type === 'animal') {
                this.renderIsometricAnimal(entity.data);
            } else if (entity.type === 'player') {
                this.renderIsometricPlayer(entity.data);
            }
        });

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

    renderIsometricBuilding(building) {
        const buildingHeight = building.height * 20; // Height multiplier
        const screen = this.worldToScreenWithCamera(building.x, building.y, 0);

        // Building shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        const shadowWidth = building.width * this.tileWidth / 2;
        const shadowHeight = building.height * this.tileHeight / 2;
        this.ctx.beginPath();
        this.ctx.ellipse(screen.x, screen.y + 10, shadowWidth * 0.8, shadowHeight * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw building base (floor)
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

        // Draw walls (vertical sides to create height)
        const frontScreen = this.worldToScreenWithCamera(
            building.x + building.width / 2,
            building.y + building.height,
            0
        );

        // Left wall
        this.ctx.fillStyle = this.darkenColor(building.color || '#d4a373', 0.7);
        this.ctx.beginPath();
        this.ctx.moveTo(frontScreen.x - building.width * this.tileWidth / 4, frontScreen.y);
        this.ctx.lineTo(frontScreen.x - building.width * this.tileWidth / 4, frontScreen.y - buildingHeight);
        this.ctx.lineTo(frontScreen.x, frontScreen.y - buildingHeight - building.height * this.tileHeight / 4);
        this.ctx.lineTo(frontScreen.x, frontScreen.y - building.height * this.tileHeight / 4);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Right wall
        this.ctx.fillStyle = this.darkenColor(building.color || '#d4a373', 0.85);
        this.ctx.beginPath();
        this.ctx.moveTo(frontScreen.x, frontScreen.y - building.height * this.tileHeight / 4);
        this.ctx.lineTo(frontScreen.x, frontScreen.y - buildingHeight - building.height * this.tileHeight / 4);
        this.ctx.lineTo(frontScreen.x + building.width * this.tileWidth / 4, frontScreen.y - buildingHeight);
        this.ctx.lineTo(frontScreen.x + building.width * this.tileWidth / 4, frontScreen.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Roof (top of building)
        const roofScreen = this.worldToScreenWithCamera(
            building.x + building.width / 2,
            building.y + building.height / 2,
            buildingHeight
        );
        this.ctx.fillStyle = this.darkenColor(building.color || '#d4a373', 1.1);
        this.ctx.beginPath();
        this.ctx.moveTo(roofScreen.x, roofScreen.y - building.height * this.tileHeight / 2);
        this.ctx.lineTo(roofScreen.x + building.width * this.tileWidth / 2, roofScreen.y);
        this.ctx.lineTo(roofScreen.x, roofScreen.y + building.height * this.tileHeight / 2);
        this.ctx.lineTo(roofScreen.x - building.width * this.tileWidth / 2, roofScreen.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Emoji and name
        this.ctx.font = '24px Arial';
        this.ctx.fillText(building.emoji, frontScreen.x - 12, frontScreen.y - buildingHeight / 2);
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(building.name, frontScreen.x - building.name.length * 2.5, frontScreen.y - buildingHeight - 10);
    }

    renderIsometricNPC(npc) {
        const screen = this.worldToScreenWithCamera(npc.x, npc.y, 0);

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

    renderIsometricPlayer(player) {
        const screen = this.worldToScreenWithCamera(player.x, player.y, 0);

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

        const screen = this.worldToScreenWithCamera(animal.x, animal.y, 0);

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
        const miniMapSize = 150;
        const miniMapX = this.canvas.width - miniMapSize - 10;
        const miniMapY = 10;
        const scale = miniMapSize / this.mapWidth;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);

        // Border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize);

        // Draw major roads on mini-map
        this.ctx.fillStyle = '#888';
        // Beecroft Road (vertical)
        this.ctx.fillRect(miniMapX + 198 * scale, miniMapY, 4 * scale, miniMapSize);
        // Hannah Street (horizontal)
        this.ctx.fillRect(miniMapX, miniMapY + 188 * scale, miniMapSize, 4 * scale);

        // Draw player position
        const playerMapX = miniMapX + this.player.x * scale;
        const playerMapY = miniMapY + this.player.y * scale;
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(playerMapX, playerMapY, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw major landmarks
        this.ctx.fillStyle = '#00ff00';
        this.buildings.forEach(building => {
            if (building.type === 'station' || building.type === 'school') {
                const bx = miniMapX + (building.x + building.width / 2) * scale;
                const by = miniMapY + (building.y + building.height / 2) * scale;
                this.ctx.fillRect(bx - 1, by - 1, 2, 2);
            }
        });

        // Label
        this.ctx.font = 'bold 10px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('MAP', miniMapX + 5, miniMapY + 15);
    }

    renderLocationIndicator() {
        // Find nearest building
        let nearestBuilding = null;
        let nearestDistance = Infinity;

        this.buildings.forEach(building => {
            const centerX = building.x + building.width / 2;
            const centerY = building.y + building.height / 2;
            const dx = this.player.x - centerX;
            const dy = this.player.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < nearestDistance && distance < 15) {
                nearestDistance = distance;
                nearestBuilding = building;
            }
        });

        // Display location name
        if (nearestBuilding) {
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
            this.ctx.fillText(`📍 ${nearestBuilding.name}`, this.canvas.width / 2, boxY + 25);
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
});
