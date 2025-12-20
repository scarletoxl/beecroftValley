// Beecroft Valley - Main Game Engine
// A realistic recreation of Beecroft, NSW

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;
        this.mapWidth = 250;  // Massive map for realistic Beecroft!
        this.mapHeight = 250;

        // Camera for scrolling
        this.camera = {
            x: 0,
            y: 0
        };

        // Game state
        this.player = {
            x: 125,  // Start near station (center of map)
            y: 125,
            speed: 1,
            energy: 100,
            gold: 100,
            name: "You"
        };

        this.keys = {};
        this.currentTool = 'hoe';
        this.day = 1;

        // Initialize game map
        this.initMap();
        this.initNPCs();
        this.initBuildings();
        this.setupEventListeners();
        this.gameLoop();
    }

    initMap() {
        // Tile types:
        // 0 = grass, 1 = dirt, 2 = water, 3 = path/road, 4 = farmland
        // 5 = tree, 6 = building wall, 7 = building floor, 8 = rail, 9 = flowers

        this.map = [];
        this.trees = [];
        this.buildings = [];

        // Fill with grass initially
        for (let y = 0; y < this.mapHeight; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                this.map[y][x] = 0; // Grass everywhere
            }
        }

        // Beecroft Road (main north-south road through entire map)
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 123; x <= 127; x++) {
                this.map[y][x] = 3; // Road
            }
        }

        // Hannah Street (east-west shopping strip)
        for (let x = 60; x < 180; x++) {
            for (let y = 128; y <= 132; y++) {
                this.map[y][x] = 3; // Road
            }
        }

        // Copeland Road (east-west, south of station)
        for (let x = 50; x < 200; x++) {
            for (let y = 145; y <= 148; y++) {
                this.map[y][x] = 3; // Road
            }
        }

        // Wongala Crescent (curves near shopping area)
        for (let x = 135; x < 175; x++) {
            this.map[135][x] = 3;
            this.map[136][x] = 3;
        }

        // Sutherland Road (runs southeast)
        for (let i = 0; i < 60; i++) {
            const x = 140 + i;
            const y = 150 + Math.floor(i * 0.8);
            if (x < this.mapWidth && y < this.mapHeight) {
                this.map[y][x] = 3;
                this.map[y][x + 1] = 3;
            }
        }

        // Railway tracks (horizontal through middle)
        for (let x = 30; x < 220; x++) {
            this.map[115][x] = 8; // Rails
            this.map[116][x] = 8;
        }

        // Add LOTS of trees (Beecroft is very leafy!)
        this.addTreeClusters();

        // Add parks with flowers
        this.addParks();
    }

    addTreeClusters() {
        // Trees scattered throughout residential areas - Beecroft is VERY leafy!
        const treeAreas = [
            // Lane Cove National Park area (southwest - large bushland)
            { x: 10, y: 170, width: 90, height: 70, density: 0.8 },
            // Chilworth Reserve (north-east)
            { x: 150, y: 20, width: 80, height: 60, density: 0.7 },
            // Residential streets west of Beecroft Road
            { x: 30, y: 40, width: 80, height: 60, density: 0.5 },
            { x: 20, y: 110, width: 90, height: 50, density: 0.5 },
            // Residential streets east of Beecroft Road
            { x: 140, y: 50, width: 90, height: 50, density: 0.5 },
            { x: 150, y: 140, width: 80, height: 40, density: 0.5 },
            // Fearnley Park (west of shopping area)
            { x: 70, y: 135, width: 35, height: 30, density: 0.8 },
            // Around schools (heavily treed)
            { x: 85, y: 60, width: 30, height: 25, density: 0.6 },
            { x: 160, y: 100, width: 35, height: 30, density: 0.6 },
            // Street trees along roads
            { x: 110, y: 30, width: 50, height: 20, density: 0.3 },
            { x: 130, y: 180, width: 40, height: 30, density: 0.4 }
        ];

        treeAreas.forEach(area => {
            for (let y = area.y; y < area.y + area.height; y++) {
                for (let x = area.x; x < area.x + area.width; x++) {
                    if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
                        if (Math.random() < area.density && this.map[y][x] === 0) {
                            this.trees.push({ x, y, type: Math.floor(Math.random() * 3) });
                        }
                    }
                }
            }
        });
    }

    addParks() {
        // Railway Station Gardens (with playground)
        for (let y = 108; y < 113; y++) {
            for (let x = 115; x < 122; x++) {
                this.map[y][x] = 9; // Flowers
            }
        }

        // Village Green (near shopping area)
        for (let y = 133; y < 140; y++) {
            for (let x = 108; x < 118; x++) {
                this.map[y][x] = 9; // Flowers
            }
        }

        // Fearnley Park (large western park)
        for (let y = 138; y < 148; y++) {
            for (let x = 75; x < 95; x++) {
                this.map[y][x] = 9; // Flowers
            }
        }
    }

    initBuildings() {
        // Real Beecroft buildings with geographically accurate positions!
        this.buildings = [
            // Central area - Railway Station and surrounding
            { name: "Beecroft Railway Station", x: 120, y: 117, width: 8, height: 6, type: "station", emoji: "🚂" },
            { name: "HerGP Medical Clinic", x: 105, y: 118, width: 5, height: 4, type: "clinic", emoji: "🏥" },
            { name: "Railway Gardens Playground", x: 115, y: 108, width: 4, height: 4, type: "playground", emoji: "🎪" },

            // Shopping area (Hannah Street / Wongala area)
            { name: "Beecroft Place (Woolworths)", x: 138, y: 133, width: 8, height: 6, type: "shop", emoji: "🏪" },
            { name: "The Beehive Cafe", x: 120, y: 130, width: 4, height: 3, type: "cafe", emoji: "☕" },
            { name: "Beecroft Medical Centre", x: 125, y: 128, width: 5, height: 3, type: "clinic", emoji: "🏥" },
            { name: "Beecroft General Practice", x: 148, y: 130, width: 5, height: 3, type: "clinic", emoji: "🏥" },

            // Schools (spread across suburb)
            { name: "Beecroft Public School", x: 90, y: 65, width: 10, height: 8, type: "school", emoji: "🏫" },
            { name: "Arden Anglican School", x: 108, y: 95, width: 9, height: 7, type: "school", emoji: "🏫" },
            { name: "Roselea Public School", x: 165, y: 105, width: 10, height: 7, type: "school", emoji: "🏫" },

            // Recreation facilities
            { name: "Beecroft Club (Bowling)", x: 160, y: 155, width: 7, height: 5, type: "recreation", emoji: "🎳" },
            { name: "Tennis Club", x: 175, y: 165, width: 6, height: 5, type: "recreation", emoji: "🎾" },

            // Residential
            { name: "Your Farm House", x: 50, y: 80, width: 5, height: 5, type: "home", emoji: "🏡" },
            { name: "Community Garden", x: 78, y: 140, width: 6, height: 5, type: "garden", emoji: "🌻" }
        ];

        // Mark building tiles
        this.buildings.forEach(building => {
            for (let y = building.y; y < building.y + building.height; y++) {
                for (let x = building.x; x < building.x + building.width; x++) {
                    if (x < this.mapWidth && y < this.mapHeight) {
                        this.map[y][x] = 6; // Building
                    }
                }
            }
        });
    }

    initNPCs() {
        // Lots of friendly Beecroft residents spread across the suburb!
        this.npcs = [
            // Near cafe and shops
            { name: "Mrs. Chen", x: 122, y: 131, emoji: "👵", role: "cafe owner", greeting: "Welcome to The Beehive! Best coffee in Beecroft!" },
            { name: "Emma", x: 142, y: 136, emoji: "👩", role: "shopkeeper", greeting: "Fresh produce just arrived!" },

            // Medical clinics
            { name: "Dr. Shin Li", x: 107, y: 120, emoji: "👩‍⚕️", role: "HerGP clinic owner", greeting: "Welcome to HerGP! We're here to care for you and your family. Stay well!" },
            { name: "Dr. Patel", x: 127, y: 129, emoji: "👨‍⚕️", role: "doctor", greeting: "Stay healthy! Don't forget to rest." },

            // Railway station
            { name: "Tom", x: 124, y: 120, emoji: "🧑‍💼", role: "station master", greeting: "All trains running on time today!" },

            // Schools
            { name: "Sarah", x: 95, y: 68, emoji: "👩‍🏫", role: "teacher", greeting: "Education is the key to success!" },
            { name: "David", x: 169, y: 108, emoji: "👨‍🏫", role: "principal", greeting: "Welcome to our school community!" },

            // Parks and recreation
            { name: "Jack", x: 82, y: 142, emoji: "🧑‍🌾", role: "gardener", greeting: "Nothing beats growing your own veggies!" },
            { name: "Lisa", x: 163, y: 157, emoji: "👱‍♀️", role: "bowls player", greeting: "Come join us for a game sometime!" },
            { name: "Mike", x: 178, y: 167, emoji: "🧑", role: "tennis coach", greeting: "Want to improve your backhand?" },
            { name: "Olivia", x: 117, y: 110, emoji: "👧", role: "playground kid", greeting: "This playground is so fun!" },

            // Residential areas
            { name: "Grace", x: 45, y: 195, emoji: "👩", role: "park ranger", greeting: "Enjoying our beautiful bushland?" },
            { name: "Ben", x: 53, y: 83, emoji: "🧑", role: "neighbor", greeting: "G'day neighbor! Lovely weather today!" },
            { name: "Sophie", x: 155, y: 145, emoji: "👧", role: "local kid", greeting: "Want to play? I love this suburb!" },
            { name: "James", x: 110, y: 135, emoji: "👨", role: "resident", greeting: "Beecroft is such a great place to live!" }
        ];
    }

    setupEventListeners() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // Tool usage
            if (e.key === 'e' || e.key === 'E') {
                this.useTool();
            }

            // Talk to NPCs
            if (e.key === ' ') {
                this.talkToNearbyNPC();
            }

            // Prevent default scrolling
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
    }

    talkToNearbyNPC() {
        const talkDistance = 1.5;
        for (let npc of this.npcs) {
            const dx = this.player.x - npc.x;
            const dy = this.player.y - npc.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < talkDistance) {
                this.showDialog(npc);
                return;
            }
        }

        // Check if near a building
        const building = this.getNearbyBuilding();
        if (building) {
            this.showDialog({ name: building.name, greeting: `Welcome to ${building.name}!`, emoji: building.emoji });
        }
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

    showDialog(character) {
        const footer = document.querySelector('footer p');
        footer.textContent = `${character.emoji} ${character.name}: "${character.greeting}"`;
        setTimeout(() => {
            footer.textContent = "Welcome to Beecroft Valley! Use arrow keys to explore.";
        }, 4000);
    }

    update() {
        // Player movement
        const prevX = this.player.x;
        const prevY = this.player.y;

        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.player.y = Math.max(0, this.player.y - 0.15);
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.player.y = Math.min(this.mapHeight - 1, this.player.y + 0.15);
        }
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.x = Math.max(0, this.player.x - 0.15);
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.x = Math.min(this.mapWidth - 1, this.player.x + 0.15);
        }

        // Check collision
        const tileX = Math.floor(this.player.x);
        const tileY = Math.floor(this.player.y);

        // Collision with water, buildings, and trees
        if (this.map[tileY] && (this.map[tileY][tileX] === 2 || this.map[tileY][tileX] === 6)) {
            this.player.x = prevX;
            this.player.y = prevY;
        }

        // Check tree collision
        for (let tree of this.trees) {
            const dx = this.player.x - tree.x;
            const dy = this.player.y - tree.y;
            if (Math.abs(dx) < 0.6 && Math.abs(dy) < 0.6) {
                this.player.x = prevX;
                this.player.y = prevY;
                break;
            }
        }

        // Update camera to follow player
        const canvasTilesX = this.canvas.width / this.tileSize;
        const canvasTilesY = this.canvas.height / this.tileSize;

        this.camera.x = this.player.x - canvasTilesX / 2;
        this.camera.y = this.player.y - canvasTilesY / 2;

        // Keep camera in bounds
        this.camera.x = Math.max(0, Math.min(this.mapWidth - canvasTilesX, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.mapHeight - canvasTilesY, this.camera.y));
    }

    useTool() {
        const tileX = Math.floor(this.player.x);
        const tileY = Math.floor(this.player.y);

        if (this.currentTool === 'hoe') {
            // Till the soil
            if (this.map[tileY][tileX] === 0) {
                this.map[tileY][tileX] = 4;
                this.player.energy = Math.max(0, this.player.energy - 2);
                this.updateHUD();
            }
        } else if (this.currentTool === 'water') {
            // Water crops (placeholder)
            console.log('Watering...');
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#8fbc8f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate visible tiles
        const startX = Math.floor(this.camera.x);
        const startY = Math.floor(this.camera.y);
        const endX = Math.min(this.mapWidth, Math.ceil(this.camera.x + this.canvas.width / this.tileSize));
        const endY = Math.min(this.mapHeight, Math.ceil(this.camera.y + this.canvas.height / this.tileSize));

        // Render map tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = this.map[y][x];
                const screenX = (x - this.camera.x) * this.tileSize;
                const screenY = (y - this.camera.y) * this.tileSize;

                switch (tile) {
                    case 0: // Grass
                        this.ctx.fillStyle = '#7cb342';
                        break;
                    case 1: // Dirt
                        this.ctx.fillStyle = '#8b7355';
                        break;
                    case 2: // Water
                        this.ctx.fillStyle = '#4fc3f7';
                        break;
                    case 3: // Path/Road
                        this.ctx.fillStyle = '#757575';
                        break;
                    case 4: // Farmland
                        this.ctx.fillStyle = '#6b4423';
                        break;
                    case 6: // Building
                        this.ctx.fillStyle = '#d4a373';
                        break;
                    case 8: // Rails
                        this.ctx.fillStyle = '#424242';
                        break;
                    case 9: // Flowers
                        this.ctx.fillStyle = '#ffeb3b';
                        break;
                }

                this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

                // Tile border
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
            }
        }

        // Render trees
        this.trees.forEach(tree => {
            if (tree.x >= startX && tree.x < endX && tree.y >= startY && tree.y < endY) {
                const screenX = (tree.x - this.camera.x) * this.tileSize;
                const screenY = (tree.y - this.camera.y) * this.tileSize;

                // Tree trunk
                this.ctx.fillStyle = '#6b4423';
                this.ctx.fillRect(screenX + 12, screenY + 16, 8, 12);

                // Tree foliage (native Australian trees - eucalyptus style)
                this.ctx.fillStyle = tree.type === 0 ? '#2e7d32' : tree.type === 1 ? '#388e3c' : '#43a047';
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

        // Render buildings with labels
        this.buildings.forEach(building => {
            if (building.x < endX && building.x + building.width > startX &&
                building.y < endY && building.y + building.height > startY) {
                const screenX = (building.x - this.camera.x) * this.tileSize;
                const screenY = (building.y - this.camera.y) * this.tileSize;

                // Building emoji/icon
                this.ctx.font = '24px Arial';
                this.ctx.fillText(building.emoji, screenX + 5, screenY + 25);

                // Building name
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

                // NPC shadow
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                this.ctx.beginPath();
                this.ctx.ellipse(
                    screenX + this.tileSize / 2,
                    screenY + this.tileSize - 2,
                    this.tileSize / 3,
                    this.tileSize / 7,
                    0, 0, Math.PI * 2
                );
                this.ctx.fill();

                // NPC emoji
                this.ctx.font = '20px Arial';
                this.ctx.fillText(npc.emoji, screenX + 6, screenY + 22);

                // NPC name
                this.ctx.font = '8px Arial';
                this.ctx.fillStyle = '#000';
                this.ctx.fillText(npc.name, screenX, screenY - 2);
            }
        });

        // Render player
        const playerScreenX = (this.player.x - this.camera.x) * this.tileSize;
        const playerScreenY = (this.player.y - this.camera.y) * this.tileSize;

        // Player shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(
            playerScreenX + this.tileSize / 2,
            playerScreenY + this.tileSize - 4,
            this.tileSize / 3,
            this.tileSize / 6,
            0, 0, Math.PI * 2
        );
        this.ctx.fill();

        // Player character
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(
            playerScreenX + this.tileSize / 2,
            playerScreenY + this.tileSize / 2,
            this.tileSize / 2.5,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Player face
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(playerScreenX + this.tileSize / 2 - 5, playerScreenY + this.tileSize / 2 - 3, 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(playerScreenX + this.tileSize / 2 + 5, playerScreenY + this.tileSize / 2 - 3, 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Player name
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = '#000';
        this.ctx.fillText('You', playerScreenX + 8, playerScreenY - 2);
    }

    updateHUD() {
        document.getElementById('gold').textContent = Math.floor(this.player.gold);
        document.getElementById('energy').textContent = Math.floor(this.player.energy);
        document.getElementById('day').textContent = this.day;
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});
