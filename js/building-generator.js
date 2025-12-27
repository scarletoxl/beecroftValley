// Procedural Building Generator for Beecroft Valley
// Generates cute, detailed isometric buildings with Stardew Valley aesthetic

class ProceduralBuildingGenerator {
    constructor() {
        this.buildingCache = new Map();
    }

    /**
     * Generate a complete building sprite based on type and configuration
     * @param {string} type - Building type (residential, cafe, shop, etc.)
     * @param {number} tileWidth - Width in tiles
     * @param {number} tileHeight - Height in tiles
     * @param {Object} config - Building style configuration
     * @returns {Object} - Canvas and metadata for the building
     */
    generateBuilding(type, tileWidth, tileHeight, config = {}) {
        const cacheKey = `${type}_${tileWidth}_${tileHeight}_${JSON.stringify(config)}`;

        if (this.buildingCache.has(cacheKey)) {
            return this.buildingCache.get(cacheKey);
        }

        // Create canvas for this building
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate canvas size (isometric projection needs extra space)
        const TILE_WIDTH = 32;
        const TILE_HEIGHT = 16;
        const buildingHeight = 60; // Base height for buildings

        canvas.width = (tileWidth + tileHeight) * TILE_WIDTH + 40;
        canvas.height = ((tileWidth + tileHeight) * TILE_HEIGHT / 2) + buildingHeight + 40;

        // Center the building on canvas
        const centerX = canvas.width / 2;
        const centerY = canvas.height - 20;

        // Generate based on type
        let buildingData;
        switch(type) {
            case 'residential':
            case 'home':
                buildingData = this.generateResidentialHome(ctx, centerX, centerY, tileWidth, tileHeight, config);
                break;
            case 'station':
                buildingData = this.generateRailwayStation(ctx, centerX, centerY, tileWidth, tileHeight, config);
                break;
            case 'cafe':
                buildingData = this.generateCafe(ctx, centerX, centerY, tileWidth, tileHeight, config);
                break;
            case 'restaurant':
                buildingData = this.generateRestaurant(ctx, centerX, centerY, tileWidth, tileHeight, config);
                break;
            case 'shop':
                buildingData = this.generateShop(ctx, centerX, centerY, tileWidth, tileHeight, config);
                break;
            case 'school':
                buildingData = this.generateSchool(ctx, centerX, centerY, tileWidth, tileHeight, config);
                break;
            case 'clinic':
            case 'vet':
                buildingData = this.generateMedicalClinic(ctx, centerX, centerY, tileWidth, tileHeight, config);
                break;
            case 'church':
                buildingData = this.generateChurch(ctx, centerX, centerY, tileWidth, tileHeight, config);
                break;
            case 'community':
                buildingData = this.generateCommunityBuilding(ctx, centerX, centerY, tileWidth, tileHeight, config);
                break;
            default:
                buildingData = this.generateGenericBuilding(ctx, centerX, centerY, tileWidth, tileHeight, config);
        }

        const result = {
            canvas: canvas,
            dataUrl: canvas.toDataURL(),
            width: canvas.width,
            height: canvas.height,
            centerX: centerX,
            centerY: centerY,
            ...buildingData
        };

        this.buildingCache.set(cacheKey, result);
        return result;
    }

    /**
     * Generate a residential home with cute details
     */
    generateResidentialHome(ctx, centerX, centerY, tileWidth, tileHeight, config) {
        const width = tileWidth * 32;
        const height = tileHeight * 16;
        const buildingHeight = 50;

        // Defaults for residential
        const wallColor = config.wallColor || '#E8D5C4';
        const roofColor = config.roofColor || '#B84545';
        const windowCount = config.windowCount || 2;
        const hasChimney = config.hasChimney !== false;
        const hasGarden = config.hasGarden !== false;

        // Draw base (foundation)
        this.drawIsometricBase(ctx, centerX, centerY, width, height, '#9E9E9E');

        // Draw walls
        this.drawBrickWall(ctx, centerX, centerY - 25, width, buildingHeight, wallColor);

        // Draw roof
        this.drawSlopedRoof(ctx, centerX, centerY - buildingHeight - 25, width, height, roofColor, 'shingles');

        // Draw windows
        const windowY = centerY - 40;
        if (windowCount >= 2) {
            this.drawWindow(ctx, centerX - 20, windowY, 16, 20, true, true);
            this.drawWindow(ctx, centerX + 20, windowY, 16, 20, true, false);
        } else if (windowCount === 1) {
            this.drawWindow(ctx, centerX, windowY, 16, 20, true, true);
        }

        // Draw door
        this.drawDoor(ctx, centerX, centerY - 15, 16, 24, 'residential', '#8B4513');

        // Draw chimney if configured
        if (hasChimney) {
            this.drawChimney(ctx, centerX + width/3, centerY - buildingHeight - 40, 8, 20, false);
        }

        // Draw small garden
        if (hasGarden) {
            this.drawGarden(ctx, centerX - 25, centerY + 5, 20, 10);
        }

        return {
            buildingHeight: buildingHeight,
            hasChimney: hasChimney,
            hasGarden: hasGarden
        };
    }

    /**
     * Generate railway station
     */
    generateRailwayStation(ctx, centerX, centerY, tileWidth, tileHeight, config) {
        const width = tileWidth * 32;
        const height = tileHeight * 16;
        const buildingHeight = 65;

        const wallColor = config.wallColor || '#F5E6D3';
        const roofColor = config.roofColor || '#2E7D32';
        const awningColor = config.awningColor || '#4CAF50';

        // Draw base
        this.drawIsometricBase(ctx, centerX, centerY, width, height, '#8D6E63');

        // Draw main building walls (colonial style)
        this.drawStuccoWall(ctx, centerX, centerY - 30, width, buildingHeight, wallColor);

        // Draw heritage roof
        this.drawSlopedRoof(ctx, centerX, centerY - buildingHeight - 30, width, height, roofColor, 'metal');

        // Draw platform awning
        this.drawAwning(ctx, centerX - width/4, centerY - 20, width/2, awningColor, false);

        // Draw large station windows
        this.drawWindow(ctx, centerX - 30, centerY - 50, 20, 28, false, false);
        this.drawWindow(ctx, centerX + 30, centerY - 50, 20, 28, false, false);

        // Draw station clock
        this.drawStationClock(ctx, centerX, centerY - buildingHeight - 15);

        // Draw door
        this.drawDoor(ctx, centerX, centerY - 20, 20, 32, 'commercial', '#6D4C41');

        // Draw "Beecroft" sign
        this.drawSign(ctx, centerX, centerY - buildingHeight - 35, 'BEECROFT', '🚂', 'heritage');

        return {
            buildingHeight: buildingHeight,
            hasAwning: true,
            hasClock: true
        };
    }

    /**
     * Generate cafe building
     */
    generateCafe(ctx, centerX, centerY, tileWidth, tileHeight, config) {
        const width = tileWidth * 32;
        const height = tileHeight * 16;
        const buildingHeight = 48;

        const wallColor = config.wallColor || '#FFF8DC';
        const roofColor = config.roofColor || '#8B4513';
        const awningColor = config.awningColor || '#FF6347';
        const awningStriped = config.awningStriped !== false;
        const hasOutdoorSeating = config.hasOutdoorSeating !== false;

        // Draw base
        this.drawIsometricBase(ctx, centerX, centerY, width, height, '#B0B0B0');

        // Draw painted walls
        this.drawPaintedWall(ctx, centerX, centerY - 25, width, buildingHeight, wallColor);

        // Draw sloped roof
        this.drawSlopedRoof(ctx, centerX, centerY - buildingHeight - 25, width, height, roofColor, 'tiles');

        // Draw striped awning
        this.drawAwning(ctx, centerX, centerY - 20, width * 0.7, awningColor, awningStriped);

        // Draw display windows
        this.drawWindow(ctx, centerX - 25, centerY - 35, 24, 26, false, false);
        this.drawWindow(ctx, centerX + 25, centerY - 35, 24, 26, false, false);

        // Draw cafe door
        this.drawDoor(ctx, centerX, centerY - 18, 18, 28, 'commercial', '#8B4513');

        // Draw sign
        const signText = config.signText || 'CAFE';
        const signEmoji = config.signEmoji || '☕';
        this.drawSign(ctx, centerX, centerY - buildingHeight - 30, signText, signEmoji, 'modern');

        // Draw outdoor seating
        if (hasOutdoorSeating) {
            this.drawOutdoorFurniture(ctx, centerX - 40, centerY + 8, 'table');
            this.drawOutdoorFurniture(ctx, centerX + 40, centerY + 8, 'table');
        }

        return {
            buildingHeight: buildingHeight,
            hasAwning: true,
            hasOutdoorSeating: hasOutdoorSeating
        };
    }

    /**
     * Generate restaurant building
     */
    generateRestaurant(ctx, centerX, centerY, tileWidth, tileHeight, config) {
        const width = tileWidth * 32;
        const height = tileHeight * 16;
        const buildingHeight = 52;

        const wallColor = config.wallColor || '#FFEBEE';
        const roofColor = config.roofColor || '#8B4513';
        const awningColor = config.awningColor || '#D32F2F';

        // Draw base
        this.drawIsometricBase(ctx, centerX, centerY, width, height, '#B0B0B0');

        // Draw walls
        this.drawPaintedWall(ctx, centerX, centerY - 26, width, buildingHeight, wallColor);

        // Draw roof
        this.drawSlopedRoof(ctx, centerX, centerY - buildingHeight - 26, width, height, roofColor, 'tiles');

        // Draw awning
        this.drawAwning(ctx, centerX, centerY - 22, width * 0.8, awningColor, true);

        // Draw windows
        this.drawWindow(ctx, centerX - 30, centerY - 38, 20, 24, false, false);
        this.drawWindow(ctx, centerX + 30, centerY - 38, 20, 24, false, false);

        // Draw door
        this.drawDoor(ctx, centerX, centerY - 20, 20, 30, 'commercial', '#6D4C41');

        // Draw sign
        const signText = config.signText || 'RESTAURANT';
        const signEmoji = config.signEmoji || '🍽️';
        this.drawSign(ctx, centerX, centerY - buildingHeight - 32, signText, signEmoji, 'modern');

        // Outdoor seating
        this.drawOutdoorFurniture(ctx, centerX - 45, centerY + 10, 'table');
        this.drawOutdoorFurniture(ctx, centerX + 45, centerY + 10, 'table');

        return {
            buildingHeight: buildingHeight,
            hasAwning: true,
            hasOutdoorSeating: true
        };
    }

    /**
     * Generate shop building (like Woolworths)
     */
    generateShop(ctx, centerX, centerY, tileWidth, tileHeight, config) {
        const width = tileWidth * 32;
        const height = tileHeight * 16;
        const buildingHeight = 60;

        const wallColor = config.wallColor || '#FFFFFF';
        const roofColor = config.roofColor || '#757575';
        const brandColor = config.brandColor || '#4CAF50';

        // Draw base
        this.drawIsometricBase(ctx, centerX, centerY, width, height, '#9E9E9E');

        // Draw modern walls
        this.drawModernWall(ctx, centerX, centerY - 30, width, buildingHeight, wallColor);

        // Draw flat roof
        this.drawFlatRoof(ctx, centerX, centerY - buildingHeight - 30, width, height, roofColor);

        // Draw large display windows
        this.drawWindow(ctx, centerX - 40, centerY - 40, 32, 36, false, false);
        this.drawWindow(ctx, centerX, centerY - 40, 32, 36, false, false);
        this.drawWindow(ctx, centerX + 40, centerY - 40, 32, 36, false, false);

        // Draw automatic doors
        this.drawAutomaticDoor(ctx, centerX, centerY - 22, 28, 34);

        // Draw shop sign with brand color
        const signText = config.signText || 'SHOP';
        const signEmoji = config.signEmoji || '🛒';
        this.drawSign(ctx, centerX, centerY - buildingHeight - 35, signText, signEmoji, 'modern');

        // Draw brand stripe
        ctx.fillStyle = brandColor;
        ctx.fillRect(centerX - width/2, centerY - buildingHeight - 25, width, 8);

        return {
            buildingHeight: buildingHeight,
            isModern: true,
            hasAutomaticDoor: true
        };
    }

    /**
     * Generate school building
     */
    generateSchool(ctx, centerX, centerY, tileWidth, tileHeight, config) {
        const width = tileWidth * 32;
        const height = tileHeight * 16;
        const buildingHeight = 70;

        const wallColor = config.wallColor || '#D84315';
        const roofColor = config.roofColor || '#5D4037';
        const isHeritage = config.isHeritage || false;

        // Draw base
        this.drawIsometricBase(ctx, centerX, centerY, width, height, '#795548');

        // Draw brick walls (classic school)
        this.drawBrickWall(ctx, centerX, centerY - 35, width, buildingHeight, wallColor);

        // Draw peaked roof
        this.drawSlopedRoof(ctx, centerX, centerY - buildingHeight - 35, width, height, roofColor, 'shingles');

        // Draw multiple windows (schools have many)
        const windowY = centerY - 50;
        this.drawWindow(ctx, centerX - 45, windowY, 16, 24, false, false);
        this.drawWindow(ctx, centerX - 20, windowY, 16, 24, false, false);
        this.drawWindow(ctx, centerX + 20, windowY, 16, 24, false, false);
        this.drawWindow(ctx, centerX + 45, windowY, 16, 24, false, false);

        // Draw door
        this.drawDoor(ctx, centerX, centerY - 25, 20, 32, 'institutional', '#6D4C41');

        // Draw flag pole if heritage school
        if (isHeritage) {
            this.drawFlagPole(ctx, centerX + width/2 + 15, centerY - buildingHeight - 60, 50);
        }

        return {
            buildingHeight: buildingHeight,
            isHeritage: isHeritage,
            hasFlagPole: isHeritage
        };
    }

    /**
     * Generate medical clinic
     */
    generateMedicalClinic(ctx, centerX, centerY, tileWidth, tileHeight, config) {
        const width = tileWidth * 32;
        const height = tileHeight * 16;
        const buildingHeight = 50;

        const wallColor = config.wallColor || '#E3F2FD';
        const roofColor = config.roofColor || '#90A4AE';

        // Draw base
        this.drawIsometricBase(ctx, centerX, centerY, width, height, '#B0BEC5');

        // Draw clean modern walls
        this.drawPaintedWall(ctx, centerX, centerY - 25, width, buildingHeight, wallColor);

        // Draw simple roof
        this.drawSlopedRoof(ctx, centerX, centerY - buildingHeight - 25, width, height, roofColor, 'modern');

        // Draw windows
        this.drawWindow(ctx, centerX - 25, centerY - 38, 20, 24, false, false);
        this.drawWindow(ctx, centerX + 25, centerY - 38, 20, 24, false, false);

        // Draw door
        this.drawDoor(ctx, centerX, centerY - 20, 18, 28, 'modern', '#FFFFFF');

        // Draw medical cross
        this.drawMedicalCross(ctx, centerX, centerY - buildingHeight - 28);

        // Draw sign
        const signText = config.signText || 'MEDICAL CLINIC';
        this.drawSign(ctx, centerX, centerY - buildingHeight - 38, signText, '🏥', 'modern');

        return {
            buildingHeight: buildingHeight,
            isMedical: true
        };
    }

    /**
     * Generate church building
     */
    generateChurch(ctx, centerX, centerY, tileWidth, tileHeight, config) {
        const width = tileWidth * 32;
        const height = tileHeight * 16;
        const buildingHeight = 65;

        const wallColor = config.wallColor || '#D7CCC8';
        const roofColor = config.roofColor || '#5D4037';

        // Draw base
        this.drawIsometricBase(ctx, centerX, centerY, width, height, '#8D6E63');

        // Draw stone walls
        this.drawStoneWall(ctx, centerX, centerY - 32, width, buildingHeight, wallColor);

        // Draw pointed roof
        this.drawSlopedRoof(ctx, centerX, centerY - buildingHeight - 32, width, height, roofColor, 'steep');

        // Draw arched windows
        this.drawArchedWindow(ctx, centerX - 25, centerY - 45, 18, 28);
        this.drawArchedWindow(ctx, centerX + 25, centerY - 45, 18, 28);

        // Draw church door
        this.drawDoor(ctx, centerX, centerY - 24, 20, 34, 'arched', '#4E342E');

        // Draw cross on top
        this.drawCross(ctx, centerX, centerY - buildingHeight - 50);

        return {
            buildingHeight: buildingHeight,
            isChurch: true,
            hasCross: true
        };
    }

    /**
     * Generate generic community building
     */
    generateCommunityBuilding(ctx, centerX, centerY, tileWidth, tileHeight, config) {
        const width = tileWidth * 32;
        const height = tileHeight * 16;
        const buildingHeight = 55;

        const wallColor = config.wallColor || '#ECEFF1';
        const roofColor = config.roofColor || '#607D8B';

        // Draw base
        this.drawIsometricBase(ctx, centerX, centerY, width, height, '#90A4AE');

        // Draw walls
        this.drawModernWall(ctx, centerX, centerY - 28, width, buildingHeight, wallColor);

        // Draw flat roof
        this.drawFlatRoof(ctx, centerX, centerY - buildingHeight - 28, width, height, roofColor);

        // Draw windows
        this.drawWindow(ctx, centerX - 30, centerY - 42, 22, 26, false, false);
        this.drawWindow(ctx, centerX + 30, centerY - 42, 22, 26, false, false);

        // Draw door
        this.drawDoor(ctx, centerX, centerY - 22, 20, 30, 'modern', '#546E7A');

        return {
            buildingHeight: buildingHeight,
            isModern: true
        };
    }

    /**
     * Generate generic/fallback building
     */
    generateGenericBuilding(ctx, centerX, centerY, tileWidth, tileHeight, config) {
        const width = tileWidth * 32;
        const height = tileHeight * 16;
        const buildingHeight = 45;

        const wallColor = config.wallColor || '#D4A373';
        const roofColor = config.roofColor || '#8B4513';

        // Draw base
        this.drawIsometricBase(ctx, centerX, centerY, width, height, '#A0826D');

        // Draw walls
        this.drawPaintedWall(ctx, centerX, centerY - 23, width, buildingHeight, wallColor);

        // Draw roof
        this.drawSlopedRoof(ctx, centerX, centerY - buildingHeight - 23, width, height, roofColor, 'tiles');

        // Draw windows
        this.drawWindow(ctx, centerX - 20, centerY - 35, 18, 22, false, false);
        this.drawWindow(ctx, centerX + 20, centerY - 35, 18, 22, false, false);

        // Draw door
        this.drawDoor(ctx, centerX, centerY - 18, 16, 26, 'simple', '#8B4513');

        return {
            buildingHeight: buildingHeight
        };
    }

    // ===== HELPER DRAWING METHODS =====

    /**
     * Draw isometric base/foundation
     */
    drawIsometricBase(ctx, x, y, width, depth, color) {
        ctx.save();
        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - width/2, y - depth/4);
        ctx.lineTo(x, y - depth/2);
        ctx.lineTo(x + width/2, y - depth/4);
        ctx.closePath();
        ctx.fill();

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width/2, y - depth/4);
        ctx.lineTo(x + width/2, y - depth/4 - 4);
        ctx.lineTo(x, y - 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw brick wall with texture
     */
    drawBrickWall(ctx, x, y, width, height, brickColor) {
        ctx.save();

        // Main wall shape (front face)
        ctx.fillStyle = brickColor;
        ctx.fillRect(x - width/4, y - height, width/2, height);

        // Side wall (darker)
        const sideColor = this.darkenColor(brickColor, 0.7);
        ctx.fillStyle = sideColor;
        ctx.beginPath();
        ctx.moveTo(x + width/4, y - height);
        ctx.lineTo(x + width/2, y - height - width/4);
        ctx.lineTo(x + width/2, y - width/4);
        ctx.lineTo(x + width/4, y);
        ctx.closePath();
        ctx.fill();

        // Draw brick pattern
        ctx.strokeStyle = this.darkenColor(brickColor, 0.5);
        ctx.lineWidth = 1;
        const brickHeight = 6;
        const brickWidth = 14;

        for (let by = 0; by < height; by += brickHeight) {
            const offset = (Math.floor(by / brickHeight) % 2) * (brickWidth / 2);
            for (let bx = -width/4; bx < width/4; bx += brickWidth) {
                ctx.strokeRect(x + bx + offset, y - height + by, brickWidth, brickHeight);
            }
        }

        ctx.restore();
    }

    /**
     * Draw wooden wall
     */
    drawWoodenWall(ctx, x, y, width, height, woodColor) {
        ctx.save();

        // Main wall
        ctx.fillStyle = woodColor;
        ctx.fillRect(x - width/4, y - height, width/2, height);

        // Side wall
        const sideColor = this.darkenColor(woodColor, 0.7);
        ctx.fillStyle = sideColor;
        ctx.beginPath();
        ctx.moveTo(x + width/4, y - height);
        ctx.lineTo(x + width/2, y - height - width/4);
        ctx.lineTo(x + width/2, y - width/4);
        ctx.lineTo(x + width/4, y);
        ctx.closePath();
        ctx.fill();

        // Wood planks
        ctx.strokeStyle = this.darkenColor(woodColor, 0.6);
        ctx.lineWidth = 1;
        for (let i = 0; i < height; i += 8) {
            ctx.beginPath();
            ctx.moveTo(x - width/4, y - height + i);
            ctx.lineTo(x + width/4, y - height + i);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw painted/stucco wall
     */
    drawPaintedWall(ctx, x, y, width, height, color) {
        ctx.save();

        // Main wall
        ctx.fillStyle = color;
        ctx.fillRect(x - width/4, y - height, width/2, height);

        // Side wall (darker)
        const sideColor = this.darkenColor(color, 0.75);
        ctx.fillStyle = sideColor;
        ctx.beginPath();
        ctx.moveTo(x + width/4, y - height);
        ctx.lineTo(x + width/2, y - height - width/4);
        ctx.lineTo(x + width/2, y - width/4);
        ctx.lineTo(x + width/4, y);
        ctx.closePath();
        ctx.fill();

        // Subtle texture
        ctx.fillStyle = 'rgba(0,0,0,0.03)';
        for (let i = 0; i < 20; i++) {
            const px = x - width/4 + Math.random() * width/2;
            const py = y - height + Math.random() * height;
            ctx.fillRect(px, py, 2, 2);
        }

        ctx.restore();
    }

    /**
     * Draw stucco wall
     */
    drawStuccoWall(ctx, x, y, width, height, color) {
        this.drawPaintedWall(ctx, x, y, width, height, color);
    }

    /**
     * Draw modern wall (clean, minimal)
     */
    drawModernWall(ctx, x, y, width, height, color) {
        ctx.save();

        // Main wall - very clean
        ctx.fillStyle = color;
        ctx.fillRect(x - width/4, y - height, width/2, height);

        // Side wall
        const sideColor = this.darkenColor(color, 0.8);
        ctx.fillStyle = sideColor;
        ctx.beginPath();
        ctx.moveTo(x + width/4, y - height);
        ctx.lineTo(x + width/2, y - height - width/4);
        ctx.lineTo(x + width/2, y - width/4);
        ctx.lineTo(x + width/4, y);
        ctx.closePath();
        ctx.fill();

        // Clean edge
        ctx.strokeStyle = this.darkenColor(color, 0.9);
        ctx.lineWidth = 1;
        ctx.strokeRect(x - width/4, y - height, width/2, height);

        ctx.restore();
    }

    /**
     * Draw stone wall (for church)
     */
    drawStoneWall(ctx, x, y, width, height, color) {
        ctx.save();

        // Main wall
        ctx.fillStyle = color;
        ctx.fillRect(x - width/4, y - height, width/2, height);

        // Side wall
        const sideColor = this.darkenColor(color, 0.7);
        ctx.fillStyle = sideColor;
        ctx.beginPath();
        ctx.moveTo(x + width/4, y - height);
        ctx.lineTo(x + width/2, y - height - width/4);
        ctx.lineTo(x + width/2, y - width/4);
        ctx.lineTo(x + width/4, y);
        ctx.closePath();
        ctx.fill();

        // Stone blocks
        ctx.strokeStyle = this.darkenColor(color, 0.6);
        ctx.lineWidth = 1;
        for (let by = 0; by < height; by += 10) {
            for (let bx = -width/4; bx < width/4; bx += 15) {
                const offset = (Math.floor(by / 10) % 2) * 7;
                ctx.strokeRect(x + bx + offset, y - height + by, 15, 10);
            }
        }

        ctx.restore();
    }

    /**
     * Draw sloped roof
     */
    drawSlopedRoof(ctx, x, y, width, depth, color, style = 'tiles') {
        ctx.save();

        const roofHeight = 25;

        // Left slope
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - width/2, y - depth/4);
        ctx.lineTo(x, y - roofHeight - depth/2);
        ctx.lineTo(x, y - depth/2);
        ctx.closePath();
        ctx.fill();

        // Right slope (darker)
        ctx.fillStyle = this.darkenColor(color, 0.7);
        ctx.beginPath();
        ctx.moveTo(x + width/2, y - depth/4);
        ctx.lineTo(x, y - roofHeight - depth/2);
        ctx.lineTo(x, y - depth/2);
        ctx.closePath();
        ctx.fill();

        // Add texture based on style
        if (style === 'shingles') {
            this.drawShingles(ctx, x, y, width, depth, roofHeight);
        } else if (style === 'tiles') {
            this.drawRoofTiles(ctx, x, y, width, depth, roofHeight);
        } else if (style === 'metal') {
            this.drawMetalRoof(ctx, x, y, width, depth, roofHeight);
        }

        ctx.restore();
    }

    /**
     * Draw flat roof
     */
    drawFlatRoof(ctx, x, y, width, depth, color) {
        ctx.save();

        // Top surface
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - width/2, y - depth/4);
        ctx.lineTo(x, y - depth/2);
        ctx.lineTo(x + width/2, y - depth/4);
        ctx.closePath();
        ctx.fill();

        // Edge highlight
        ctx.strokeStyle = this.lightenColor(color, 1.2);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draw shingles texture
     */
    drawShingles(ctx, x, y, width, depth, roofHeight) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;

        // Left slope shingles
        for (let i = 0; i < roofHeight; i += 4) {
            ctx.beginPath();
            ctx.moveTo(x - width/2 + (i / roofHeight) * width/2, y - depth/4 + (i / roofHeight) * (-roofHeight - depth/4));
            ctx.lineTo(x, y - i - depth/2);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw roof tiles
     */
    drawRoofTiles(ctx, x, y, width, depth, roofHeight) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1;

        for (let i = 0; i < roofHeight; i += 5) {
            ctx.beginPath();
            ctx.moveTo(x - width/2 + (i / roofHeight) * width/2, y - depth/4 + (i / roofHeight) * (-roofHeight - depth/4));
            ctx.lineTo(x + width/2 - (i / roofHeight) * width/2, y - depth/4 + (i / roofHeight) * (-roofHeight - depth/4));
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw metal roof (corrugated)
     */
    drawMetalRoof(ctx, x, y, width, depth, roofHeight) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;

        for (let i = 0; i < roofHeight; i += 3) {
            ctx.beginPath();
            ctx.moveTo(x - width/2 + (i / roofHeight) * width/2, y - depth/4 + (i / roofHeight) * (-roofHeight - depth/4));
            ctx.lineTo(x, y - i - depth/2);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw window
     */
    drawWindow(ctx, x, y, width, height, hasShutters, hasFlowerBox) {
        ctx.save();

        // Window frame
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - width/2, y - height, width, height);

        // Window panes
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - width/2, y - height, width, height);

        // Cross divider
        ctx.beginPath();
        ctx.moveTo(x, y - height);
        ctx.lineTo(x, y);
        ctx.moveTo(x - width/2, y - height/2);
        ctx.lineTo(x + width/2, y - height/2);
        ctx.stroke();

        // Glass reflection
        ctx.fillStyle = 'rgba(135,206,235,0.3)';
        ctx.fillRect(x - width/2 + 2, y - height + 2, width/2 - 2, height/2 - 2);

        // Shutters
        if (hasShutters) {
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(x - width/2 - 4, y - height, 3, height);
            ctx.fillRect(x + width/2 + 1, y - height, 3, height);
        }

        // Flower box
        if (hasFlowerBox) {
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(x - width/2 - 2, y, width + 4, 4);

            // Flowers
            ctx.fillStyle = '#FF69B4';
            ctx.beginPath();
            ctx.arc(x - width/3, y + 2, 2, 0, Math.PI * 2);
            ctx.arc(x, y + 2, 2, 0, Math.PI * 2);
            ctx.arc(x + width/3, y + 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draw arched window (for church)
     */
    drawArchedWindow(ctx, x, y, width, height) {
        ctx.save();

        // Window background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - width/2, y - height + width/2, width, height - width/2);

        // Arch top
        ctx.beginPath();
        ctx.arc(x, y - height + width/2, width/2, Math.PI, 0);
        ctx.fill();

        // Frame
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 2;
        ctx.fillRect(x - width/2, y - height + width/2, width, height - width/2);
        ctx.beginPath();
        ctx.arc(x, y - height + width/2, width/2, Math.PI, 0);
        ctx.stroke();

        // Stained glass effect
        ctx.fillStyle = 'rgba(138,43,226,0.3)';
        ctx.beginPath();
        ctx.arc(x, y - height + width/2, width/2, Math.PI, 0);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw door
     */
    drawDoor(ctx, x, y, width, height, style, color) {
        ctx.save();

        if (style === 'arched') {
            // Arched door (church)
            ctx.fillStyle = color;
            ctx.fillRect(x - width/2, y - height + width/2, width, height - width/2);
            ctx.beginPath();
            ctx.arc(x, y - height + width/2, width/2, Math.PI, 0);
            ctx.fill();

            // Frame
            ctx.strokeStyle = this.darkenColor(color, 0.7);
            ctx.lineWidth = 2;
            ctx.strokeRect(x - width/2, y - height + width/2, width, height - width/2);
            ctx.beginPath();
            ctx.arc(x, y - height + width/2, width/2, Math.PI, 0);
            ctx.stroke();
        } else {
            // Regular rectangular door
            ctx.fillStyle = color;
            ctx.fillRect(x - width/2, y - height, width, height);

            // Frame
            ctx.strokeStyle = this.darkenColor(color, 0.7);
            ctx.lineWidth = 2;
            ctx.strokeRect(x - width/2, y - height, width, height);

            // Door panels
            if (style === 'residential' || style === 'commercial') {
                ctx.strokeStyle = this.darkenColor(color, 0.8);
                ctx.lineWidth = 1;
                ctx.strokeRect(x - width/2 + 2, y - height + 2, width - 4, height/2 - 3);
                ctx.strokeRect(x - width/2 + 2, y - height/2 + 1, width - 4, height/2 - 3);
            }

            // Doorknob
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x + width/2 - 4, y - height/2, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draw automatic door (for shops)
     */
    drawAutomaticDoor(ctx, x, y, width, height) {
        ctx.save();

        // Glass doors
        ctx.fillStyle = 'rgba(135,206,235,0.5)';
        ctx.fillRect(x - width/2, y - height, width/2 - 1, height);
        ctx.fillRect(x + 1, y - height, width/2 - 1, height);

        // Frames
        ctx.strokeStyle = '#757575';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - width/2, y - height, width/2 - 1, height);
        ctx.strokeRect(x + 1, y - height, width/2 - 1, height);

        // Handles
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 4, y - height * 0.6);
        ctx.lineTo(x - 4, y - height * 0.4);
        ctx.moveTo(x + 4, y - height * 0.6);
        ctx.lineTo(x + 4, y - height * 0.4);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draw chimney
     */
    drawChimney(ctx, x, y, width, height, hasSmoke) {
        ctx.save();

        // Chimney body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - width/2, y - height, width, height);

        // Brick texture
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = 0; i < height; i += 4) {
            ctx.strokeRect(x - width/2, y - height + i, width, 4);
        }

        // Chimney cap
        ctx.fillStyle = '#654321';
        ctx.fillRect(x - width/2 - 2, y - height - 3, width + 4, 3);

        ctx.restore();
    }

    /**
     * Draw awning
     */
    drawAwning(ctx, x, y, width, color, striped) {
        ctx.save();

        const awningDepth = 15;
        const awningHeight = 12;

        if (striped) {
            // Striped awning
            const stripeWidth = 8;
            const stripeColor2 = '#FFFFFF';

            for (let i = -width/2; i < width/2; i += stripeWidth * 2) {
                ctx.fillStyle = color;
                ctx.fillRect(x + i, y - awningHeight, stripeWidth, awningHeight);
                ctx.fillStyle = stripeColor2;
                ctx.fillRect(x + i + stripeWidth, y - awningHeight, stripeWidth, awningHeight);
            }
        } else {
            // Solid awning
            ctx.fillStyle = color;
            ctx.fillRect(x - width/2, y - awningHeight, width, awningHeight);
        }

        // Awning front edge (darker)
        ctx.fillStyle = this.darkenColor(color, 0.7);
        ctx.fillRect(x - width/2, y, width, 3);

        // Support poles
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x - width/2 + 10, y, 3, 15);
        ctx.fillRect(x + width/2 - 13, y, 3, 15);

        ctx.restore();
    }

    /**
     * Draw sign
     */
    drawSign(ctx, x, y, text, emoji, style) {
        ctx.save();

        const signWidth = text.length * 8 + 20;
        const signHeight = 16;

        if (style === 'heritage') {
            // Heritage sign (station)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x - signWidth/2, y - signHeight/2, signWidth, signHeight);
            ctx.strokeStyle = '#2E7D32';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - signWidth/2, y - signHeight/2, signWidth, signHeight);

            ctx.fillStyle = '#2E7D32';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(text, x, y + 4);
        } else if (style === 'modern') {
            // Modern sign
            ctx.fillStyle = '#424242';
            ctx.fillRect(x - signWidth/2, y - signHeight/2, signWidth, signHeight);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(text, x - 8, y + 3);

            // Emoji
            ctx.font = '12px Arial';
            ctx.fillText(emoji, x + signWidth/2 - 10, y + 4);
        } else {
            // Simple sign
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(x - signWidth/2, y - signHeight/2, signWidth, signHeight);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(text, x, y + 3);
        }

        ctx.restore();
    }

    /**
     * Draw garden/flower bed
     */
    drawGarden(ctx, x, y, width, depth) {
        ctx.save();

        // Garden bed
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x, y, width, depth);

        // Soil
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x + 1, y + 1, width - 2, depth - 2);

        // Flowers
        const flowerColors = ['#FF69B4', '#FFD700', '#FF6347', '#9370DB'];
        for (let i = 0; i < 5; i++) {
            const fx = x + 3 + Math.random() * (width - 6);
            const fy = y + 3 + Math.random() * (depth - 6);
            ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            ctx.beginPath();
            ctx.arc(fx, fy, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draw outdoor furniture
     */
    drawOutdoorFurniture(ctx, x, y, type) {
        ctx.save();

        if (type === 'table') {
            // Table
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#BDBDBD';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Umbrella
            ctx.fillStyle = '#FF6347';
            ctx.beginPath();
            ctx.arc(x, y - 15, 8, 0, Math.PI, true);
            ctx.fill();

            // Umbrella pole
            ctx.strokeStyle = '#8D6E63';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y - 15);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (type === 'chair') {
            // Chair
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(x - 3, y - 4, 6, 4);
            ctx.fillRect(x - 3, y - 8, 6, 1);
        }

        ctx.restore();
    }

    /**
     * Draw station clock
     */
    drawStationClock(ctx, x, y) {
        ctx.save();

        // Clock face
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Clock border
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Clock hands (showing 3:15)
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 5, y);
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 3);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draw medical cross
     */
    drawMedicalCross(ctx, x, y) {
        ctx.save();

        // Red cross
        ctx.fillStyle = '#D32F2F';

        // Vertical bar
        ctx.fillRect(x - 3, y - 10, 6, 20);

        // Horizontal bar
        ctx.fillRect(x - 8, y - 3, 16, 6);

        ctx.restore();
    }

    /**
     * Draw cross (for church)
     */
    drawCross(ctx, x, y) {
        ctx.save();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;

        // Vertical
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 15);
        ctx.stroke();

        // Horizontal
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 10);
        ctx.lineTo(x + 5, y - 10);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draw flag pole
     */
    drawFlagPole(ctx, x, y, height) {
        ctx.save();

        // Pole
        ctx.strokeStyle = '#9E9E9E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - height);
        ctx.stroke();

        // Flag
        ctx.fillStyle = '#1976D2';
        ctx.fillRect(x, y - height, 15, 10);

        // Pole top
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y - height, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ===== UTILITY METHODS =====

    /**
     * Darken a color
     */
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
        const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
        const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
        return `rgb(${r},${g},${b})`;
    }

    /**
     * Lighten a color
     */
    lightenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.min(255, Math.floor(parseInt(hex.substr(0, 2), 16) * factor));
        const g = Math.min(255, Math.floor(parseInt(hex.substr(2, 2), 16) * factor));
        const b = Math.min(255, Math.floor(parseInt(hex.substr(4, 2), 16) * factor));
        return `rgb(${r},${g},${b})`;
    }

    /**
     * Clear cache (for testing/debugging)
     */
    clearCache() {
        this.buildingCache.clear();
    }
}
