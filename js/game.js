// Beecroft Valley - Main Game Engine
// A realistic recreation of Beecroft, NSW with full game features

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;
        this.mapWidth = 250;
        this.mapHeight = 250;

        // Camera for scrolling
        this.camera = { x: 0, y: 0 };

        // Game state - Initialize with defaults
        this.player = {
            x: 125, y: 125,
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

        // Initialize game
        this.initMap();
        this.initNPCs();
        this.initBuildings();
        this.initInteriors();
        this.createUI();
        this.setupEventListeners();
        this.gameLoop();

        // Start time progression
        this.startTimeCycle();
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

        // Roads
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 123; x <= 127; x++) {
                this.map[y][x] = 3;
            }
        }

        for (let x = 60; x < 180; x++) {
            for (let y = 128; y <= 132; y++) {
                this.map[y][x] = 3;
            }
        }

        for (let x = 50; x < 200; x++) {
            for (let y = 145; y <= 148; y++) {
                this.map[y][x] = 3;
            }
        }

        for (let x = 135; x < 175; x++) {
            this.map[135][x] = 3;
            this.map[136][x] = 3;
        }

        for (let i = 0; i < 60; i++) {
            const x = 140 + i;
            const y = 150 + Math.floor(i * 0.8);
            if (x < this.mapWidth && y < this.mapHeight) {
                this.map[y][x] = 3;
                this.map[y][x + 1] = 3;
            }
        }

        // Railway tracks
        for (let x = 30; x < 220; x++) {
            this.map[115][x] = 8;
            this.map[116][x] = 8;
        }

        this.addTreeClusters();
        this.addParks();
    }

    addTreeClusters() {
        const treeAreas = [
            { x: 10, y: 170, width: 90, height: 70, density: 0.8 },
            { x: 150, y: 20, width: 80, height: 60, density: 0.7 },
            { x: 30, y: 40, width: 80, height: 60, density: 0.5 },
            { x: 20, y: 110, width: 90, height: 50, density: 0.5 },
            { x: 140, y: 50, width: 90, height: 50, density: 0.5 },
            { x: 150, y: 140, width: 80, height: 40, density: 0.5 },
            { x: 70, y: 135, width: 35, height: 30, density: 0.8 },
            { x: 85, y: 60, width: 30, height: 25, density: 0.6 },
            { x: 160, y: 100, width: 35, height: 30, density: 0.6 },
            { x: 110, y: 30, width: 50, height: 20, density: 0.3 },
            { x: 130, y: 180, width: 40, height: 30, density: 0.4 }
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
            { x: 115, y: 108, width: 7, height: 5 },
            { x: 108, y: 133, width: 10, height: 7 },
            { x: 75, y: 138, width: 20, height: 10 }
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
            // Updated with different visual styles
            {
                name: "Beecroft Railway Station",
                x: 120, y: 117,
                width: 8, height: 6,
                type: "station",
                emoji: "🚂",
                color: "#8B4513",
                hasInterior: true,
                canEnter: true
            },
            {
                name: "HerGP Medical Clinic",
                x: 132, y: 18, // Across from station at x:29, y:18
                width: 3, height: 2,
                type: "clinic",
                emoji: "👩‍⚕️",
                color: "#E8F5E9",
                hasInterior: true,
                canEnter: true,
                hasDoctor: true,
                owner: "Dr. Shin Li"
            },
            {
                name: "Railway Gardens Playground",
                x: 115, y: 108,
                width: 4, height: 4,
                type: "playground",
                emoji: "🎪",
                color: "#FFE082",
                hasInterior: false
            },
            {
                name: "Beecroft Place (Woolworths)",
                x: 138, y: 133,
                width: 8, height: 6,
                type: "shop",
                emoji: "🏪",
                color: "#C8E6C9",
                hasInterior: true,
                canEnter: true,
                isShop: true,
                shopType: "grocery"
            },
            {
                name: "The Beehive Cafe",
                x: 120, y: 130,
                width: 4, height: 3,
                type: "cafe",
                emoji: "☕",
                color: "#FFCCBC",
                hasInterior: true,
                canEnter: true,
                isRestaurant: true,
                hasJobs: true,
                owner: "Mrs. Chen"
            },
            {
                name: "Beecroft Medical Centre",
                x: 125, y: 128,
                width: 5, height: 3,
                type: "clinic",
                emoji: "🏥",
                color: "#E1F5FE",
                hasInterior: true,
                canEnter: true,
                hasDoctor: true
            },
            {
                name: "Beecroft General Practice",
                x: 148, y: 130,
                width: 5, height: 3,
                type: "clinic",
                emoji: "🏥",
                color: "#F3E5F5",
                hasInterior: true,
                canEnter: true,
                hasDoctor: true
            },
            {
                name: "Beecroft Public School",
                x: 90, y: 65,
                width: 10, height: 8,
                type: "school",
                emoji: "🏫",
                color: "#FFF9C4",
                hasInterior: true,
                canEnter: true,
                hasJobs: true
            },
            {
                name: "Arden Anglican School",
                x: 108, y: 95,
                width: 9, height: 7,
                type: "school",
                emoji: "🏫",
                color: "#E0F2F1",
                hasInterior: true,
                canEnter: true,
                hasJobs: true
            },
            {
                name: "Roselea Public School",
                x: 165, y: 105,
                width: 10, height: 7,
                type: "school",
                emoji: "🏫",
                color: "#FCE4EC",
                hasInterior: true,
                canEnter: true,
                hasJobs: true
            },
            {
                name: "Beecroft Club (Bowling)",
                x: 160, y: 155,
                width: 7, height: 5,
                type: "recreation",
                emoji: "🎳",
                color: "#D1C4E9",
                hasInterior: true,
                canEnter: true
            },
            {
                name: "Tennis Club",
                x: 175, y: 165,
                width: 6, height: 5,
                type: "recreation",
                emoji: "🎾",
                color: "#C5CAE9",
                hasInterior: true,
                canEnter: true
            },
            {
                name: "Your Farm House",
                x: 50, y: 80,
                width: 5, height: 5,
                type: "home",
                emoji: "🏡",
                color: "#FFEBEE",
                hasInterior: true,
                canEnter: true,
                isPlayerHome: true
            },
            {
                name: "Community Garden",
                x: 78, y: 140,
                width: 6, height: 5,
                type: "garden",
                emoji: "🌻",
                color: "#F1F8E9",
                hasInterior: false
            },
            {
                name: "Beecroft Auto Sales",
                x: 155, y: 145,
                width: 7, height: 5,
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
            {
                name: "Mrs. Chen", x: 122, y: 131, emoji: "👵",
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
                baseX: 122,
                baseY: 131
            },
            {
                name: "Emma", x: 142, y: 136, emoji: "👩",
                role: "shopkeeper",
                greeting: "Fresh produce just arrived!",
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
                baseX: 142,
                baseY: 136
            },
            {
                name: "Dr. Shin Li", x: 133, y: 19, emoji: "👩‍⚕️",
                role: "HerGP clinic owner",
                greeting: "Welcome to HerGP! We're here to care for you and your family. Stay well!",
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
                baseX: 133,
                baseY: 19
            },
            {
                name: "Dr. Patel", x: 127, y: 129, emoji: "👨‍⚕️",
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
                baseX: 127,
                baseY: 129
            },
            {
                name: "Tom", x: 124, y: 120, emoji: "🧑‍💼",
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
                baseX: 124,
                baseY: 120
            },
            {
                name: "Sarah", x: 95, y: 68, emoji: "👩‍🏫",
                role: "teacher",
                greeting: "Education is the key to success!",
                dialogues: [
                    "Our students are wonderful!",
                    "Teaching is my passion.",
                    "We need more classroom assistants.",
                    "Knowledge is power!"
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
                baseX: 95,
                baseY: 68
            },
            {
                name: "David", x: 169, y: 108, emoji: "👨‍🏫",
                role: "principal",
                greeting: "Welcome to our school community!",
                dialogues: [
                    "Excellence in education since 1900.",
                    "Our school has great facilities.",
                    "Community is important to us.",
                    "Proud to serve Beecroft families."
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 169,
                baseY: 108
            },
            {
                name: "Jack", x: 82, y: 142, emoji: "🧑‍🌾",
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
                baseX: 82,
                baseY: 142
            },
            {
                name: "Lisa", x: 163, y: 157, emoji: "👱‍♀️",
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
                baseX: 163,
                baseY: 157
            },
            {
                name: "Mike", x: 178, y: 167, emoji: "🧑",
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
                baseX: 178,
                baseY: 167
            },
            {
                name: "Olivia", x: 117, y: 110, emoji: "👧",
                role: "playground kid",
                greeting: "This playground is so fun!",
                dialogues: [
                    "Want to play on the swings?",
                    "I love this playground!",
                    "My friends come here every day!",
                    "The slide is my favorite!"
                ],
                canMarry: false,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 117,
                baseY: 110
            },
            {
                name: "Grace", x: 45, y: 195, emoji: "👩",
                role: "park ranger",
                greeting: "Enjoying our beautiful bushland?",
                dialogues: [
                    "Please stay on the trails!",
                    "Native wildlife lives here.",
                    "The bush is precious.",
                    "Respect nature and it respects you."
                ],
                canMarry: true,
                isSick: false,
                targetX: null,
                targetY: null,
                wanderTimer: 0,
                standTimer: 0,
                baseX: 45,
                baseY: 195
            },
            {
                name: "Ben", x: 53, y: 83, emoji: "🧑",
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
                baseX: 53,
                baseY: 83
            },
            {
                name: "Sophie", x: 155, y: 145, emoji: "👧",
                role: "local kid",
                greeting: "Want to play? I love this suburb!",
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
                baseX: 155,
                baseY: 145
            },
            {
                name: "James", x: 110, y: 135, emoji: "👨",
                role: "resident",
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
                baseX: 110,
                baseY: 135
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
        // Player movement
        const prevX = this.player.x;
        const prevY = this.player.y;

        const moveSpeed = this.player.inCar ? this.player.carType.speed * 0.15 : 0.15;

        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.player.y = Math.max(0, this.player.y - moveSpeed);
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.player.y = Math.min(this.getCurrentMapHeight() - 1, this.player.y + moveSpeed);
        }
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.x = Math.max(0, this.player.x - moveSpeed);
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.x = Math.min(this.getCurrentMapWidth() - 1, this.player.x + moveSpeed);
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

        // Update camera
        const canvasTilesX = this.canvas.width / this.tileSize;
        const canvasTilesY = this.canvas.height / this.tileSize;

        this.camera.x = this.player.x - canvasTilesX / 2;
        this.camera.y = this.player.y - canvasTilesY / 2;

        this.camera.x = Math.max(0, Math.min(this.getCurrentMapWidth() - canvasTilesX, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.getCurrentMapHeight() - canvasTilesY, this.camera.y));

        // Update NPCs
        this.updateNPCs();
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
        // Clear canvas
        this.ctx.fillStyle = this.getSeasonalGrassColor();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const currentMapData = this.getCurrentMapData();
        const startX = Math.floor(this.camera.x);
        const startY = Math.floor(this.camera.y);
        const endX = Math.min(this.getCurrentMapWidth(), Math.ceil(this.camera.x + this.canvas.width / this.tileSize));
        const endY = Math.min(this.getCurrentMapHeight(), Math.ceil(this.camera.y + this.canvas.height / this.tileSize));

        // Render tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = currentMapData[y][x];
                const screenX = (x - this.camera.x) * this.tileSize;
                const screenY = (y - this.camera.y) * this.tileSize;

                switch (tile) {
                    case 0: // Grass
                        this.ctx.fillStyle = this.getSeasonalGrassColor();
                        break;
                    case 1: // Dirt
                        this.ctx.fillStyle = '#8b7355';
                        break;
                    case 2: // Water
                        this.ctx.fillStyle = '#4fc3f7';
                        break;
                    case 3: // Road
                        this.ctx.fillStyle = '#757575';
                        break;
                    case 4: // Farmland
                        this.ctx.fillStyle = '#6b4423';
                        break;
                    case 6: // Building
                        this.ctx.fillStyle = '#d4a373';
                        break;
                    case 7: // Floor
                        this.ctx.fillStyle = '#f5deb3';
                        break;
                    case 8: // Rails
                        this.ctx.fillStyle = '#424242';
                        break;
                    case 9: // Flowers
                        this.ctx.fillStyle = this.getSeasonalFlowerColor();
                        break;
                }

                this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

                // Tile border
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
            }
        }

        // Render trees (only on overworld)
        if (this.currentMap === 'overworld') {
            this.trees.forEach(tree => {
                if (tree.x >= startX && tree.x < endX && tree.y >= startY && tree.y < endY) {
                    const screenX = (tree.x - this.camera.x) * this.tileSize;
                    const screenY = (tree.y - this.camera.y) * this.tileSize;

                    // Tree trunk
                    this.ctx.fillStyle = '#6b4423';
                    this.ctx.fillRect(screenX + 12, screenY + 16, 8, 12);

                    // Tree foliage
                    const treeColors = this.getSeasonalTreeColors();
                    this.ctx.fillStyle = treeColors[tree.type % treeColors.length];
                    this.ctx.beginPath();
                    this.ctx.arc(screenX + 16, screenY + 14, 12, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.beginPath();
                    this.ctx.arc(screenX + 12, screenY + 10, 10, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.beginPath();
                    this.ctx.arc(screenX + 20, screenY + 10, 10, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });

            // Render buildings
            this.buildings.forEach(building => {
                if (building.x < endX && building.x + building.width > startX &&
                    building.y < endY && building.y + building.height > startY) {
                    const screenX = (building.x - this.camera.x) * this.tileSize;
                    const screenY = (building.y - this.camera.y) * this.tileSize;
                    const width = building.width * this.tileSize;
                    const height = building.height * this.tileSize;

                    // Building background with color
                    this.ctx.fillStyle = building.color || '#d4a373';
                    this.ctx.fillRect(screenX, screenY, width, height);

                    // Building outline
                    this.ctx.strokeStyle = '#8B4513';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(screenX, screenY, width, height);

                    // Emoji
                    this.ctx.font = '24px Arial';
                    this.ctx.fillText(building.emoji, screenX + 5, screenY + 25);

                    // Name
                    this.ctx.font = '10px Arial';
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillText(building.name, screenX + 2, screenY - 3);
                }
            });

            // Render NPCs
            this.npcs.forEach(npc => {
                if (npc.x >= startX && npc.x < endX && npc.y >= startY && npc.y < endY) {
                    const screenX = (npc.x - this.camera.x) * this.tileSize;
                    const screenY = (npc.y - this.camera.y) * this.tileSize;

                    // Shadow
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    this.ctx.beginPath();
                    this.ctx.ellipse(screenX + this.tileSize / 2, screenY + this.tileSize - 2,
                        this.tileSize / 3, this.tileSize / 7, 0, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Emoji
                    this.ctx.font = '20px Arial';
                    this.ctx.fillText(npc.emoji, screenX + 6, screenY + 22);

                    // Sick indicator
                    if (npc.isSick) {
                        this.ctx.font = '16px Arial';
                        this.ctx.fillText('🤢', screenX + 16, screenY - 5);
                    }

                    // Name
                    this.ctx.font = '8px Arial';
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillText(npc.name, screenX, screenY - 2);
                }
            });
        }

        // Render player
        const playerScreenX = (this.player.x - this.camera.x) * this.tileSize;
        const playerScreenY = (this.player.y - this.camera.y) * this.tileSize;

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(playerScreenX + this.tileSize / 2, playerScreenY + this.tileSize - 4,
            this.tileSize / 3, this.tileSize / 6, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Player character (or car)
        if (this.player.inCar && this.player.carType) {
            this.ctx.font = '28px Arial';
            this.ctx.fillText(this.player.carType.emoji, playerScreenX + 2, playerScreenY + 26);
        } else {
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.arc(playerScreenX + this.tileSize / 2, playerScreenY + this.tileSize / 2,
                this.tileSize / 2.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Face
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(playerScreenX + this.tileSize / 2 - 5, playerScreenY + this.tileSize / 2 - 3, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(playerScreenX + this.tileSize / 2 + 5, playerScreenY + this.tileSize / 2 - 3, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Name
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#000';
        this.ctx.fillText('You', playerScreenX + 8, playerScreenY - 2);

        // Apply day/night overlay
        this.applyDayNightOverlay();
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
