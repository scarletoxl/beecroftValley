// Beecroft Valley - Main Game Engine

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;
        this.mapWidth = 25;
        this.mapHeight = 19;

        // Game state
        this.player = {
            x: 5,
            y: 5,
            speed: 1,
            energy: 100,
            gold: 100
        };

        this.keys = {};
        this.currentTool = 'hoe';
        this.day = 1;

        // Initialize game map
        this.initMap();
        this.setupEventListeners();
        this.gameLoop();
    }

    initMap() {
        // Create a simple tile map
        // 0 = grass, 1 = dirt, 2 = water, 3 = path, 4 = farmland
        this.map = [];
        for (let y = 0; y < this.mapHeight; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                if (y === 0 || y === this.mapHeight - 1 || x === 0 || x === this.mapWidth - 1) {
                    this.map[y][x] = 3; // Border path
                } else if (y > 15 && x > 3 && x < 8) {
                    this.map[y][x] = 2; // Small pond
                } else if ((x === 5 || x === 10 || x === 15) && y > 3 && y < 15) {
                    this.map[y][x] = 3; // Paths
                } else {
                    this.map[y][x] = 0; // Grass
                }
            }
        }

        // Farmland patches
        this.farmland = [];
    }

    setupEventListeners() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // Tool usage
            if (e.key === 'e' || e.key === 'E') {
                this.useTool();
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

    update() {
        // Player movement
        const prevX = this.player.x;
        const prevY = this.player.y;

        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.player.y = Math.max(1, this.player.y - 0.1);
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.player.y = Math.min(this.mapHeight - 2, this.player.y + 0.1);
        }
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.x = Math.max(1, this.player.x - 0.1);
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.x = Math.min(this.mapWidth - 2, this.player.x + 0.1);
        }

        // Check collision with water
        const tileX = Math.floor(this.player.x);
        const tileY = Math.floor(this.player.y);
        if (this.map[tileY] && this.map[tileY][tileX] === 2) {
            // Revert movement if walking into water
            this.player.x = prevX;
            this.player.y = prevY;
        }
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

        // Render map
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tile = this.map[y][x];
                const screenX = x * this.tileSize;
                const screenY = y * this.tileSize;

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
                    case 3: // Path
                        this.ctx.fillStyle = '#d4a574';
                        break;
                    case 4: // Farmland
                        this.ctx.fillStyle = '#6b4423';
                        break;
                }

                this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

                // Tile border
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
            }
        }

        // Render player
        const playerScreenX = this.player.x * this.tileSize;
        const playerScreenY = this.player.y * this.tileSize;

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

        // Player character (simple circle for now)
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
