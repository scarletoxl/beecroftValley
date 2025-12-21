// Beecroft Valley - Real Map System
// Renders OpenStreetMap tiles as the game background

class RealMapSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        // Tile settings
        this.tileSize = 256; // Standard OSM tile size
        this.zoom = 18; // High zoom for street-level detail

        // Center point: Beecroft Railway Station
        this.centerLat = -33.7497;
        this.centerLng = 151.0657;

        // Camera offset (in pixels from center)
        this.offsetX = 0;
        this.offsetY = 0;

        // Tile cache
        this.tileCache = new Map();
        this.loadingTiles = new Set();

        // OSM tile server (using standard OSM - for production use a proper tile server)
        this.tileServer = 'https://tile.openstreetmap.org';

        // Preload tiles around the center
        this.preloadTiles();
    }

    /**
     * Convert latitude/longitude to tile coordinates
     */
    latLngToTile(lat, lng, zoom) {
        const n = Math.pow(2, zoom);
        const x = Math.floor((lng + 180) / 360 * n);
        const latRad = lat * Math.PI / 180;
        const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
        return { x, y };
    }

    /**
     * Convert tile coordinates to latitude/longitude (top-left corner of tile)
     */
    tileToLatLng(x, y, zoom) {
        const n = Math.pow(2, zoom);
        const lng = x / n * 360 - 180;
        const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
        const lat = latRad * 180 / Math.PI;
        return { lat, lng };
    }

    /**
     * Convert latitude/longitude to pixel coordinates within a tile
     */
    latLngToPixel(lat, lng, zoom) {
        const n = Math.pow(2, zoom);
        const x = (lng + 180) / 360 * n * this.tileSize;
        const latRad = lat * Math.PI / 180;
        const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n * this.tileSize;
        return { x, y };
    }

    /**
     * Convert pixel coordinates to latitude/longitude
     */
    pixelToLatLng(px, py, zoom) {
        const n = Math.pow(2, zoom);
        const lng = px / (n * this.tileSize) * 360 - 180;
        const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * py / (n * this.tileSize))));
        const lat = latRad * 180 / Math.PI;
        return { lat, lng };
    }

    /**
     * Convert game coordinates to screen coordinates
     * Game coordinates are based on GPS with station at (250, 250)
     */
    gameToScreen(gameX, gameY, cameraX, cameraY, canvasWidth, canvasHeight) {
        // Convert game coords back to GPS
        const gps = BeeccroftPOIData.gameToGPS(gameX, gameY);

        // Convert GPS to world pixel coords
        const worldPixel = this.latLngToPixel(gps.lat, gps.lng, this.zoom);
        const centerPixel = this.latLngToPixel(this.centerLat, this.centerLng, this.zoom);

        // Calculate camera GPS position
        const cameraGPS = BeeccroftPOIData.gameToGPS(cameraX, cameraY);
        const cameraPixel = this.latLngToPixel(cameraGPS.lat, cameraGPS.lng, this.zoom);

        // Screen position relative to camera
        const screenX = canvasWidth / 2 + (worldPixel.x - cameraPixel.x);
        const screenY = canvasHeight / 2 + (worldPixel.y - cameraPixel.y);

        return { x: screenX, y: screenY };
    }

    /**
     * Convert screen coordinates to game coordinates
     */
    screenToGame(screenX, screenY, cameraX, cameraY, canvasWidth, canvasHeight) {
        // Get camera GPS position
        const cameraGPS = BeeccroftPOIData.gameToGPS(cameraX, cameraY);
        const cameraPixel = this.latLngToPixel(cameraGPS.lat, cameraGPS.lng, this.zoom);

        // Calculate world pixel position
        const worldPixelX = cameraPixel.x + (screenX - canvasWidth / 2);
        const worldPixelY = cameraPixel.y + (screenY - canvasHeight / 2);

        // Convert to GPS
        const gps = this.pixelToLatLng(worldPixelX, worldPixelY, this.zoom);

        // Convert GPS to game coordinates
        return BeeccroftPOIData.gpsToGame(gps.lat, gps.lng);
    }

    /**
     * Get tile URL
     */
    getTileUrl(x, y, zoom) {
        return `${this.tileServer}/${zoom}/${x}/${y}.png`;
    }

    /**
     * Load a tile image
     */
    loadTile(x, y, zoom) {
        const key = `${zoom}/${x}/${y}`;

        if (this.tileCache.has(key) || this.loadingTiles.has(key)) {
            return;
        }

        this.loadingTiles.add(key);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this.tileCache.set(key, img);
            this.loadingTiles.delete(key);
        };
        img.onerror = () => {
            this.loadingTiles.delete(key);
            console.warn(`Failed to load tile: ${key}`);
        };
        img.src = this.getTileUrl(x, y, zoom);
    }

    /**
     * Preload tiles around the center
     */
    preloadTiles() {
        const centerTile = this.latLngToTile(this.centerLat, this.centerLng, this.zoom);

        // Load tiles in a 5x5 grid around center
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                this.loadTile(centerTile.x + dx, centerTile.y + dy, this.zoom);
            }
        }
    }

    /**
     * Render the map tiles
     */
    render(cameraX, cameraY) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        // Get camera GPS position
        const cameraGPS = BeeccroftPOIData.gameToGPS(cameraX, cameraY);
        const cameraPixel = this.latLngToPixel(cameraGPS.lat, cameraGPS.lng, this.zoom);

        // Calculate which tiles are visible
        const topLeftPixelX = cameraPixel.x - canvasWidth / 2;
        const topLeftPixelY = cameraPixel.y - canvasHeight / 2;
        const bottomRightPixelX = cameraPixel.x + canvasWidth / 2;
        const bottomRightPixelY = cameraPixel.y + canvasHeight / 2;

        const startTileX = Math.floor(topLeftPixelX / this.tileSize);
        const startTileY = Math.floor(topLeftPixelY / this.tileSize);
        const endTileX = Math.ceil(bottomRightPixelX / this.tileSize);
        const endTileY = Math.ceil(bottomRightPixelY / this.tileSize);

        // Render visible tiles
        for (let ty = startTileY; ty <= endTileY; ty++) {
            for (let tx = startTileX; tx <= endTileX; tx++) {
                const key = `${this.zoom}/${tx}/${ty}`;

                // Calculate screen position for this tile
                const tilePixelX = tx * this.tileSize;
                const tilePixelY = ty * this.tileSize;
                const screenX = tilePixelX - cameraPixel.x + canvasWidth / 2;
                const screenY = tilePixelY - cameraPixel.y + canvasHeight / 2;

                if (this.tileCache.has(key)) {
                    // Draw cached tile
                    const img = this.tileCache.get(key);
                    this.ctx.drawImage(img, screenX, screenY, this.tileSize, this.tileSize);
                } else {
                    // Draw placeholder and load tile
                    this.ctx.fillStyle = '#e8e4e0';
                    this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                    this.ctx.strokeStyle = '#ccc';
                    this.ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);

                    // Show loading text
                    this.ctx.fillStyle = '#999';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('Loading...', screenX + this.tileSize / 2, screenY + this.tileSize / 2);

                    this.loadTile(tx, ty, this.zoom);
                }
            }
        }

        // Reset text align
        this.ctx.textAlign = 'left';
    }

    /**
     * Render minimap in corner
     */
    renderMinimap(cameraX, cameraY, playerX, playerY, markers) {
        const minimapSize = 150;
        const minimapX = this.canvas.width - minimapSize - 10;
        const minimapY = 10;
        const minimapZoom = 15; // Lower zoom for minimap

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(minimapX - 2, minimapY - 2, minimapSize + 4, minimapSize + 4);

        // Get player GPS
        const playerGPS = BeeccroftPOIData.gameToGPS(playerX, playerY);
        const playerPixel = this.latLngToPixel(playerGPS.lat, playerGPS.lng, minimapZoom);

        // Draw minimap tiles (simplified - just draw a colored background)
        this.ctx.fillStyle = '#c8e6c9';
        this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);

        // Draw markers on minimap
        if (markers) {
            markers.forEach(marker => {
                const markerGPS = { lat: marker.lat, lng: marker.lng };
                const markerPixel = this.latLngToPixel(markerGPS.lat, markerGPS.lng, minimapZoom);

                const mmX = minimapX + minimapSize / 2 + (markerPixel.x - playerPixel.x) * 0.5;
                const mmY = minimapY + minimapSize / 2 + (markerPixel.y - playerPixel.y) * 0.5;

                if (mmX >= minimapX && mmX <= minimapX + minimapSize &&
                    mmY >= minimapY && mmY <= minimapY + minimapSize) {
                    this.ctx.fillStyle = '#2196F3';
                    this.ctx.beginPath();
                    this.ctx.arc(mmX, mmY, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
        }

        // Draw player position (center)
        this.ctx.fillStyle = '#f44336';
        this.ctx.beginPath();
        this.ctx.arc(minimapX + minimapSize / 2, minimapY + minimapSize / 2, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);

        // Label
        this.ctx.font = 'bold 10px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('MAP', minimapX + 5, minimapY + 15);
    }
}
