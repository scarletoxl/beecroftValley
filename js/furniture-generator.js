// Procedural Furniture Generator for Beecroft Valley
// Generates cute, detailed isometric furniture with realistic textures

class ProceduralFurnitureGenerator {
    constructor() {
        this.furnitureCache = new Map();
        this.TILE_WIDTH = 32;
        this.TILE_HEIGHT = 16;
    }

    /**
     * Generate furniture sprite based on type and configuration
     * @param {string} type - Furniture type
     * @param {Object} config - Configuration options
     * @returns {Object} - Canvas and metadata for the furniture
     */
    generateFurniture(type, config = {}) {
        const cacheKey = `${type}_${JSON.stringify(config)}`;

        if (this.furnitureCache.has(cacheKey)) {
            return this.furnitureCache.get(cacheKey);
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size based on furniture type
        const size = this.getFurnitureSize(type, config);
        canvas.width = size.width;
        canvas.height = size.height;

        let furnitureData = {};

        // Generate based on type
        switch(type) {
            // Bedroom furniture
            case 'bed':
                furnitureData = this.generateBed(ctx, canvas.width/2, canvas.height - 10, config);
                break;
            case 'wardrobe':
            case 'dresser':
                furnitureData = this.generateWardrobe(ctx, canvas.width/2, canvas.height - 10, config);
                break;
            case 'desk':
                furnitureData = this.generateDesk(ctx, canvas.width/2, canvas.height - 10, config);
                break;
            case 'bookshelf':
                furnitureData = this.generateBookshelf(ctx, canvas.width/2, canvas.height - 10, config);
                break;

            // Living room furniture
            case 'couch':
                furnitureData = this.generateCouch(ctx, canvas.width/2, canvas.height - 10, config);
                break;
            case 'tv':
                furnitureData = this.generateTV(ctx, canvas.width/2, canvas.height - 10, config);
                break;
            case 'coffee_table':
            case 'table':
                furnitureData = this.generateCoffeeTable(ctx, canvas.width/2, canvas.height - 10, config);
                break;
            case 'lamp':
                furnitureData = this.generateLamp(ctx, canvas.width/2, canvas.height - 10, config);
                break;
            case 'rug':
                furnitureData = this.generateRug(ctx, canvas.width/2, canvas.height - 10, config);
                break;

            // Kitchen furniture
            case 'counter':
            case 'kitchen_counter':
                furnitureData = this.generateKitchenCounter(ctx, canvas.width/2, canvas.height - 10, config);
                break;
            case 'stove':
                furnitureData = this.generateStove(ctx, canvas.width/2, canvas.height - 10, config);
                break;
            case 'fridge':
                furnitureData = this.generateFridge(ctx, canvas.width/2, canvas.height - 10, config);
                break;
            case 'dining_table':
                furnitureData = this.generateDiningTable(ctx, canvas.width/2, canvas.height - 10, config);
                break;
            case 'chair':
                furnitureData = this.generateChair(ctx, canvas.width/2, canvas.height - 10, config);
                break;

            // Office furniture
            case 'computer':
            case 'office_desk':
                furnitureData = this.generateOfficeDesk(ctx, canvas.width/2, canvas.height - 10, config);
                break;

            // Decorative
            case 'plant':
                furnitureData = this.generatePlant(ctx, canvas.width/2, canvas.height - 10, config);
                break;

            default:
                furnitureData = this.generateGenericFurniture(ctx, canvas.width/2, canvas.height - 10, type, config);
        }

        const result = {
            canvas: canvas,
            dataUrl: canvas.toDataURL(),
            width: canvas.width,
            height: canvas.height,
            ...furnitureData
        };

        this.furnitureCache.set(cacheKey, result);
        return result;
    }

    /**
     * Get appropriate canvas size for furniture type
     */
    getFurnitureSize(type, config) {
        const sizes = {
            bed: { width: 80, height: 100 },
            wardrobe: { width: 60, height: 90 },
            dresser: { width: 60, height: 80 },
            desk: { width: 70, height: 80 },
            bookshelf: { width: 60, height: 100 },
            couch: { width: 90, height: 70 },
            tv: { width: 60, height: 70 },
            coffee_table: { width: 60, height: 50 },
            table: { width: 60, height: 50 },
            lamp: { width: 40, height: 70 },
            rug: { width: 80, height: 60 },
            counter: { width: 70, height: 80 },
            kitchen_counter: { width: 70, height: 80 },
            stove: { width: 60, height: 80 },
            fridge: { width: 60, height: 100 },
            dining_table: { width: 80, height: 70 },
            chair: { width: 40, height: 60 },
            computer: { width: 70, height: 80 },
            office_desk: { width: 70, height: 80 },
            plant: { width: 40, height: 60 }
        };

        return sizes[type] || { width: 60, height: 80 };
    }

    // ===== BEDROOM FURNITURE =====

    /**
     * Generate bed sprite
     */
    generateBed(ctx, x, y, config = {}) {
        const size = config.size || 'double';
        const woodType = config.woodType || 'oak';
        const beddingColor = config.beddingColor || '#BBDEFB';
        const pillowColors = config.pillowColors || ['#FFFFFF', '#E3F2FD'];

        const width = size === 'single' ? 40 : 60;
        const depth = 50;
        const height = 20;

        // Bed frame (isometric box)
        const frameColor = this.getWoodColor(woodType);
        this.drawIsometricBox(ctx, x, y, width, depth, height, frameColor);

        // Mattress
        const mattressColor = this.lightenColor(beddingColor, 0.9);
        this.drawIsometricBox(ctx, x, y - height, width - 4, depth - 4, 8, mattressColor);

        // Bedding (blanket)
        this.drawIsometricBox(ctx, x, y - height - 6, width - 6, depth - 10, 4, beddingColor);

        // Pillows
        const pillowY = y - height - 8;
        const pillowSpacing = width / (pillowColors.length + 1);
        pillowColors.forEach((color, i) => {
            const pillowX = x - width/2 + pillowSpacing * (i + 1);
            this.drawPillow(ctx, pillowX, pillowY - depth/3, 12, 8, color);
        });

        // Headboard
        ctx.fillStyle = this.darkenColor(frameColor, 0.8);
        ctx.fillRect(x - width/2, y - height - depth/2 - 25, width, 20);

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.2);

        return { furnitureHeight: height + depth/2 + 25 };
    }

    /**
     * Generate wardrobe/dresser sprite
     */
    generateWardrobe(ctx, x, y, config = {}) {
        const woodType = config.woodType || 'oak';
        const doorCount = config.doorCount || 2;

        const width = 45;
        const depth = 25;
        const height = 60;

        const woodColor = this.getWoodColor(woodType);

        // Main body
        this.drawIsometricBox(ctx, x, y, width, depth, height, woodColor);

        // Doors (front face)
        ctx.strokeStyle = this.darkenColor(woodColor, 0.7);
        ctx.lineWidth = 2;

        if (doorCount === 2) {
            // Two doors with center divider
            ctx.beginPath();
            ctx.moveTo(x, y - height);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Door handles
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x - 8, y - height/2, 2, 0, Math.PI * 2);
            ctx.arc(x + 8, y - height/2, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add wood texture
        this.addWoodGrain(ctx, x - width/4, y - height, width/2, height, 'vertical');

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.2);

        return { furnitureHeight: height };
    }

    /**
     * Generate desk sprite
     */
    generateDesk(ctx, x, y, config = {}) {
        const woodType = config.woodType || 'oak';
        const hasComputer = config.hasComputer !== false;

        const width = 50;
        const depth = 30;
        const height = 35;

        const woodColor = this.getWoodColor(woodType);

        // Desktop
        this.drawIsometricBox(ctx, x, y - height, width, depth, 3, woodColor);

        // Legs
        const legWidth = 4;
        const legColor = this.darkenColor(woodColor, 0.8);

        // Front legs
        ctx.fillStyle = legColor;
        ctx.fillRect(x - width/4, y - height, legWidth, height);
        ctx.fillRect(x + width/4 - legWidth, y - height, legWidth, height);

        // Drawer
        ctx.fillStyle = woodColor;
        ctx.fillRect(x - width/4, y - 20, width/2, 12);
        ctx.strokeStyle = this.darkenColor(woodColor, 0.7);
        ctx.lineWidth = 1;
        ctx.strokeRect(x - width/4, y - 20, width/2, 12);

        // Handle
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x - 6, y - 14, 12, 2);

        // Computer if enabled
        if (hasComputer) {
            this.drawComputer(ctx, x + 5, y - height - 3, 18);
        }

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.2);

        return { furnitureHeight: height };
    }

    /**
     * Generate bookshelf sprite
     */
    generateBookshelf(ctx, x, y, config = {}) {
        const woodType = config.woodType || 'oak';
        const shelfCount = config.shelfCount || 4;

        const width = 45;
        const depth = 20;
        const height = 70;

        const woodColor = this.getWoodColor(woodType);

        // Main frame
        this.drawIsometricBox(ctx, x, y, width, depth, height, woodColor);

        // Shelves
        const shelfSpacing = height / (shelfCount + 1);
        for (let i = 1; i <= shelfCount; i++) {
            const shelfY = y - (shelfSpacing * i);
            ctx.strokeStyle = this.darkenColor(woodColor, 0.7);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - width/4, shelfY);
            ctx.lineTo(x + width/4, shelfY);
            ctx.stroke();

            // Add books on each shelf
            this.drawBooks(ctx, x, shelfY, width - 10, 8);
        }

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.2);

        return { furnitureHeight: height };
    }

    // ===== LIVING ROOM FURNITURE =====

    /**
     * Generate couch sprite
     */
    generateCouch(ctx, x, y, config = {}) {
        const fabricColor = config.fabricColor || '#8D6E63';
        const size = config.size || 'medium';

        const width = size === 'large' ? 70 : 55;
        const depth = 30;
        const height = 25;

        // Seat
        this.drawIsometricBox(ctx, x, y - 8, width, depth, 8, fabricColor);

        // Back cushions
        const backColor = this.darkenColor(fabricColor, 0.9);
        this.drawIsometricBox(ctx, x, y - height, width - 6, 8, height - 8, backColor);

        // Armrests
        const armColor = this.darkenColor(fabricColor, 0.85);
        this.drawIsometricBox(ctx, x - width/2 + 4, y - 15, 8, depth, 15, armColor);
        this.drawIsometricBox(ctx, x + width/2 - 4, y - 15, 8, depth, 15, armColor);

        // Seat cushions (subtle lines)
        ctx.strokeStyle = this.darkenColor(fabricColor, 0.8);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 8);
        ctx.lineTo(x - 10, y);
        ctx.moveTo(x + 10, y - 8);
        ctx.lineTo(x + 10, y);
        ctx.stroke();

        // Add fabric texture
        this.addFabricTexture(ctx, x - width/4, y - height, width/2, height, fabricColor);

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.25);

        return { furnitureHeight: height };
    }

    /**
     * Generate TV sprite
     */
    generateTV(ctx, x, y, config = {}) {
        const size = config.size || 'medium';
        const isOn = config.isOn !== false;

        const tvWidth = size === 'large' ? 45 : 35;
        const tvHeight = size === 'large' ? 28 : 22;
        const standHeight = 8;

        // TV screen
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x - tvWidth/2, y - standHeight - tvHeight, tvWidth, tvHeight);

        // Frame
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - tvWidth/2, y - standHeight - tvHeight, tvWidth, tvHeight);

        // Screen content if on
        if (isOn) {
            // Blue glow
            ctx.fillStyle = '#4FC3F7';
            ctx.fillRect(x - tvWidth/2 + 3, y - standHeight - tvHeight + 3, tvWidth - 6, tvHeight - 6);

            // Reflection
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x - tvWidth/2 + 5, y - standHeight - tvHeight + 5, tvWidth/3, tvHeight/3);
        } else {
            // Reflection when off
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(x - tvWidth/2 + 5, y - standHeight - tvHeight + 5, tvWidth/3, tvHeight/3);
        }

        // Stand
        ctx.fillStyle = '#424242';
        ctx.fillRect(x - 12, y - standHeight, 24, standHeight);
        ctx.fillRect(x - 4, y - standHeight - 2, 8, 2);

        // Add shadow
        this.addShadow(ctx, x, y, tvWidth, 20, 0.15);

        return { furnitureHeight: standHeight + tvHeight };
    }

    /**
     * Generate coffee table sprite
     */
    generateCoffeeTable(ctx, x, y, config = {}) {
        const woodType = config.woodType || 'oak';
        const shape = config.shape || 'rectangle';

        const width = 40;
        const depth = 30;
        const height = 15;

        const woodColor = this.getWoodColor(woodType);

        // Tabletop
        if (shape === 'round') {
            // Draw isometric ellipse for round table
            ctx.fillStyle = woodColor;
            ctx.beginPath();
            ctx.ellipse(x, y - height, width/2, depth/4, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            this.drawIsometricBox(ctx, x, y - height, width, depth, 3, woodColor);
        }

        // Legs
        const legWidth = 3;
        const legColor = this.darkenColor(woodColor, 0.8);
        ctx.fillStyle = legColor;

        const legOffset = width/2 - 8;
        ctx.fillRect(x - legOffset, y - height, legWidth, height);
        ctx.fillRect(x + legOffset - legWidth, y - height, legWidth, height);

        // Items on table (optional)
        if (config.hasItems !== false) {
            // Small book stack
            ctx.fillStyle = '#D32F2F';
            ctx.fillRect(x - 10, y - height - 3, 12, 3);

            // Coffee cup
            ctx.fillStyle = '#8D6E63';
            ctx.beginPath();
            ctx.arc(x + 10, y - height - 1, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.2);

        return { furnitureHeight: height };
    }

    /**
     * Generate lamp sprite
     */
    generateLamp(ctx, x, y, config = {}) {
        const isOn = config.isOn !== false;
        const style = config.style || 'table';

        const height = style === 'floor' ? 50 : 30;

        // Base
        ctx.fillStyle = '#8D6E63';
        if (style === 'floor') {
            ctx.fillRect(x - 6, y, 12, 3);
            // Pole
            ctx.fillRect(x - 2, y - height, 4, height);
        } else {
            ctx.fillRect(x - 5, y, 10, 3);
            ctx.fillRect(x - 2, y - height, 4, height);
        }

        // Lampshade
        const shadeColor = isOn ? '#FFF9C4' : '#F5F5DC';
        ctx.fillStyle = shadeColor;
        ctx.beginPath();
        ctx.moveTo(x - 12, y - height);
        ctx.lineTo(x - 8, y - height - 12);
        ctx.lineTo(x + 8, y - height - 12);
        ctx.lineTo(x + 12, y - height);
        ctx.closePath();
        ctx.fill();

        // Shade outline
        ctx.strokeStyle = this.darkenColor(shadeColor, 0.7);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Light glow if on
        if (isOn) {
            ctx.fillStyle = 'rgba(255, 249, 196, 0.5)';
            ctx.beginPath();
            ctx.ellipse(x, y - height/2, 20, 15, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        return { furnitureHeight: height + 12 };
    }

    /**
     * Generate rug sprite
     */
    generateRug(ctx, x, y, config = {}) {
        const color = config.color || '#B71C1C';
        const pattern = config.pattern || 'persian';

        const width = 60;
        const depth = 40;

        // Rug base (flat on ground)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - width/2, y - depth/4);
        ctx.lineTo(x, y - depth/2);
        ctx.lineTo(x + width/2, y - depth/4);
        ctx.closePath();
        ctx.fill();

        // Pattern
        if (pattern === 'persian') {
            const accentColor = this.lightenColor(color, 1.3);
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 2;

            // Border
            ctx.beginPath();
            ctx.moveTo(x - width/2 + 5, y - depth/4 + 2);
            ctx.lineTo(x - 5, y - depth/2 + 2);
            ctx.lineTo(x + width/2 - 5, y - depth/4 + 2);
            ctx.stroke();

            // Geometric pattern
            for (let i = 0; i < 3; i++) {
                const py = y - (depth/2) + (i * 6);
                ctx.fillStyle = accentColor;
                ctx.fillRect(x - 4, py, 8, 4);
            }
        }

        // Fringe
        ctx.strokeStyle = this.darkenColor(color, 0.7);
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 4) {
            ctx.beginPath();
            ctx.moveTo(x - width/2 + i, y - depth/4 - (i * depth/(width*2)));
            ctx.lineTo(x - width/2 + i, y - depth/4 - (i * depth/(width*2)) + 3);
            ctx.stroke();
        }

        return { furnitureHeight: 0 };
    }

    // ===== KITCHEN FURNITURE =====

    /**
     * Generate kitchen counter sprite
     */
    generateKitchenCounter(ctx, x, y, config = {}) {
        const cabinetColor = config.cabinetColor || '#FFFFFF';
        const countertopColor = config.countertopColor || '#B0BEC5';

        const width = 50;
        const depth = 25;
        const height = 35;
        const counterHeight = 3;

        // Base cabinets
        this.drawIsometricBox(ctx, x, y, width, depth, height, cabinetColor);

        // Cabinet doors
        ctx.strokeStyle = this.darkenColor(cabinetColor, 0.8);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - height);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Handles
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x - 12, y - height/2, 8, 2);
        ctx.fillRect(x + 4, y - height/2, 8, 2);

        // Countertop
        this.drawIsometricBox(ctx, x, y - height, width + 2, depth + 2, counterHeight, countertopColor);

        // Countertop edge shine
        ctx.fillStyle = this.lightenColor(countertopColor, 1.2);
        ctx.fillRect(x - width/4 - 1, y - height - counterHeight, width/2 + 2, 1);

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.2);

        return { furnitureHeight: height + counterHeight };
    }

    /**
     * Generate stove sprite
     */
    generateStove(ctx, x, y, config = {}) {
        const type = config.type || 'electric';
        const isOn = config.isOn || false;

        const width = 45;
        const depth = 25;
        const height = 35;

        // Stove body
        const stoveColor = '#E0E0E0';
        this.drawIsometricBox(ctx, x, y, width, depth, height, stoveColor);

        // Stovetop
        ctx.fillStyle = '#424242';
        this.drawIsometricBox(ctx, x, y - height, width, depth, 2, '#424242');

        // Burners
        const burnerColor = isOn ? '#FF5722' : '#212121';
        const burnerSize = 6;

        // 4 burners
        ctx.fillStyle = burnerColor;
        ctx.beginPath();
        ctx.arc(x - 12, y - height, burnerSize, 0, Math.PI * 2);
        ctx.arc(x + 12, y - height, burnerSize, 0, Math.PI * 2);
        ctx.arc(x - 12, y - height - depth/4, burnerSize, 0, Math.PI * 2);
        ctx.arc(x + 12, y - height - depth/4, burnerSize, 0, Math.PI * 2);
        ctx.fill();

        // Glow if on
        if (isOn) {
            ctx.fillStyle = 'rgba(255, 87, 34, 0.5)';
            ctx.beginPath();
            ctx.arc(x - 12, y - height, burnerSize + 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Oven door
        ctx.strokeStyle = '#757575';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - width/4, y - height + 10, width/2, 20);

        // Oven window
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - width/4 + 3, y - height + 13, width/2 - 6, 8);

        // Control knobs
        ctx.fillStyle = '#616161';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(x - 15 + i * 10, y - height + 5, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.2);

        return { furnitureHeight: height };
    }

    /**
     * Generate fridge sprite
     */
    generateFridge(ctx, x, y, config = {}) {
        const color = config.color || '#FFFFFF';
        const type = config.type || 'top-freezer';

        const width = 40;
        const depth = 30;
        const height = 65;

        // Fridge body
        this.drawIsometricBox(ctx, x, y, width, depth, height, color);

        // Metal shine
        this.addMetalShine(ctx, x - width/4, y - height, width/2, height);

        // Freezer section (top third)
        ctx.strokeStyle = this.darkenColor(color, 0.9);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - width/4, y - height + height/3);
        ctx.lineTo(x + width/4, y - height + height/3);
        ctx.stroke();

        // Handles
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + width/4 - 3, y - height + height/6, 2, 12);
        ctx.fillRect(x + width/4 - 3, y - height + height/2, 2, 18);

        // Magnets/notes (decorative)
        if (config.hasDecor !== false) {
            const magnetColors = ['#FF5722', '#4CAF50', '#2196F3', '#FFC107'];
            magnetColors.forEach((magColor, i) => {
                ctx.fillStyle = magColor;
                ctx.fillRect(
                    x - width/4 + 5 + (i % 2) * 15,
                    y - height + 15 + Math.floor(i / 2) * 10,
                    6, 6
                );
            });
        }

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.25);

        return { furnitureHeight: height };
    }

    /**
     * Generate dining table sprite
     */
    generateDiningTable(ctx, x, y, config = {}) {
        const woodType = config.woodType || 'oak';
        const size = config.size || 'medium';

        const width = size === 'large' ? 60 : 50;
        const depth = 40;
        const height = 30;

        const woodColor = this.getWoodColor(woodType);

        // Tabletop
        this.drawIsometricBox(ctx, x, y - height, width, depth, 3, woodColor);

        // Wood grain on top
        this.addWoodGrain(ctx, x - width/4, y - height - 3, width/2, 3, 'horizontal');

        // Legs
        const legWidth = 4;
        const legColor = this.darkenColor(woodColor, 0.8);
        ctx.fillStyle = legColor;

        // Four legs
        const legOffset = width/2 - 6;
        ctx.fillRect(x - legOffset, y - height, legWidth, height);
        ctx.fillRect(x + legOffset - legWidth, y - height, legWidth, height);

        // Optional table settings
        if (config.hasSettings) {
            // Plates
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x - 15, y - height - 1, 6, 0, Math.PI * 2);
            ctx.arc(x + 15, y - height - 1, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.2);

        return { furnitureHeight: height };
    }

    /**
     * Generate chair sprite
     */
    generateChair(ctx, x, y, config = {}) {
        const woodType = config.woodType || 'oak';
        const style = config.style || 'dining';

        const width = 20;
        const depth = 20;
        const seatHeight = 18;
        const backHeight = 15;

        const woodColor = this.getWoodColor(woodType);

        // Seat
        this.drawIsometricBox(ctx, x, y - seatHeight, width, depth, 3, woodColor);

        // Backrest
        ctx.fillStyle = woodColor;
        ctx.fillRect(x - width/4, y - seatHeight - backHeight, width/2, backHeight);

        // Back slats
        ctx.strokeStyle = this.darkenColor(woodColor, 0.7);
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x - width/4 + 5 + i * 7, y - seatHeight - backHeight + 2);
            ctx.lineTo(x - width/4 + 5 + i * 7, y - seatHeight - 3);
            ctx.stroke();
        }

        // Legs
        const legWidth = 3;
        const legColor = this.darkenColor(woodColor, 0.8);
        ctx.fillStyle = legColor;

        ctx.fillRect(x - width/4, y - seatHeight, legWidth, seatHeight);
        ctx.fillRect(x + width/4 - legWidth, y - seatHeight, legWidth, seatHeight);

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.15);

        return { furnitureHeight: seatHeight + backHeight };
    }

    // ===== OFFICE FURNITURE =====

    /**
     * Generate office desk with computer
     */
    generateOfficeDesk(ctx, x, y, config = {}) {
        const woodType = config.woodType || 'oak';
        const hasComputer = config.hasComputer !== false;

        const width = 55;
        const depth = 30;
        const height = 35;

        const woodColor = this.getWoodColor(woodType);

        // Desktop
        this.drawIsometricBox(ctx, x, y - height, width, depth, 3, woodColor);

        // Drawer unit on right
        this.drawIsometricBox(ctx, x + 15, y - height + 3, 18, depth, height - 3, woodColor);

        // Drawer lines
        ctx.strokeStyle = this.darkenColor(woodColor, 0.7);
        ctx.lineWidth = 1;
        const drawerHeight = (height - 3) / 3;
        for (let i = 1; i < 3; i++) {
            ctx.strokeRect(x + 6, y - height + 3 + (drawerHeight * i), 18, 1);
        }

        // Left leg
        ctx.fillStyle = this.darkenColor(woodColor, 0.8);
        ctx.fillRect(x - width/4, y - height, 4, height);

        // Computer setup
        if (hasComputer) {
            this.drawComputer(ctx, x - 5, y - height - 3, 22);

            // Keyboard
            ctx.fillStyle = '#424242';
            ctx.fillRect(x - 8, y - height - 1, 16, 6);

            // Mouse
            ctx.fillStyle = '#616161';
            ctx.beginPath();
            ctx.ellipse(x + 12, y - height - 1, 3, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.2);

        return { furnitureHeight: height };
    }

    // ===== DECORATIVE ITEMS =====

    /**
     * Generate plant sprite
     */
    generatePlant(ctx, x, y, config = {}) {
        const type = config.type || 'potted';
        const size = config.size || 'medium';

        const potSize = size === 'large' ? 16 : 12;
        const plantHeight = size === 'large' ? 30 : 20;

        // Pot
        ctx.fillStyle = '#8D6E63';
        ctx.beginPath();
        ctx.moveTo(x - potSize/2, y);
        ctx.lineTo(x - potSize/2 + 2, y - potSize);
        ctx.lineTo(x + potSize/2 - 2, y - potSize);
        ctx.lineTo(x + potSize/2, y);
        ctx.closePath();
        ctx.fill();

        // Soil
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x - potSize/2 + 2, y - potSize, potSize - 4, 2);

        // Plant leaves
        const leafColor = '#4CAF50';
        ctx.fillStyle = leafColor;

        if (type === 'potted') {
            // Multiple leaves spreading out
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const leafX = x + Math.cos(angle) * 8;
                const leafY = y - potSize - plantHeight/2 + Math.sin(angle) * 8;

                ctx.beginPath();
                ctx.ellipse(leafX, leafY, 6, 10, angle, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Stem
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - potSize);
        ctx.lineTo(x, y - potSize - plantHeight);
        ctx.stroke();

        return { furnitureHeight: potSize + plantHeight };
    }

    /**
     * Generate generic furniture (fallback)
     */
    generateGenericFurniture(ctx, x, y, type, config = {}) {
        const color = config.color || '#8D6E63';
        const width = 40;
        const depth = 30;
        const height = 30;

        // Simple box furniture
        this.drawIsometricBox(ctx, x, y, width, depth, height, color);

        // Add label
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(type, x, y - height - 5);

        // Add shadow
        this.addShadow(ctx, x, y, width, depth, 0.2);

        return { furnitureHeight: height };
    }

    // ===== HELPER DRAWING METHODS =====

    /**
     * Draw isometric box
     */
    drawIsometricBox(ctx, x, y, width, depth, height, color) {
        ctx.save();

        // Top face
        ctx.fillStyle = this.lightenColor(color, 1.1);
        ctx.beginPath();
        ctx.moveTo(x, y - height);
        ctx.lineTo(x - width/2, y - height - depth/4);
        ctx.lineTo(x, y - height - depth/2);
        ctx.lineTo(x + width/2, y - height - depth/4);
        ctx.closePath();
        ctx.fill();

        // Left face
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - width/2, y - depth/4);
        ctx.lineTo(x - width/2, y - height - depth/4);
        ctx.lineTo(x, y - height - depth/2);
        ctx.lineTo(x, y - depth/2);
        ctx.closePath();
        ctx.fill();

        // Right face (darker)
        ctx.fillStyle = this.darkenColor(color, 0.8);
        ctx.beginPath();
        ctx.moveTo(x + width/2, y - depth/4);
        ctx.lineTo(x + width/2, y - height - depth/4);
        ctx.lineTo(x, y - height - depth/2);
        ctx.lineTo(x, y - depth/2);
        ctx.closePath();
        ctx.fill();

        // Front face
        ctx.fillStyle = this.darkenColor(color, 0.9);
        ctx.fillRect(x - width/4, y - height, width/2, height);

        ctx.restore();
    }

    /**
     * Draw pillow
     */
    drawPillow(ctx, x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = this.lightenColor(color, 1.3);
        ctx.beginPath();
        ctx.ellipse(x - 2, y - 2, width/3, height/3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw computer monitor
     */
    drawComputer(ctx, x, y, width) {
        const height = width * 0.6;

        // Monitor
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x - width/2, y - height, width, height);

        // Frame
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - width/2, y - height, width, height);

        // Screen glow
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(x - width/2 + 2, y - height + 2, width - 4, height - 4);

        // Reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x - width/2 + 4, y - height + 4, width/3, height/4);

        // Stand
        ctx.fillStyle = '#424242';
        ctx.fillRect(x - 6, y, 12, 3);
        ctx.fillRect(x - 2, y - 3, 4, 3);
    }

    /**
     * Draw books on shelf
     */
    drawBooks(ctx, x, y, width, height) {
        const bookColors = ['#D32F2F', '#1976D2', '#388E3C', '#F57C00', '#7B1FA2', '#0097A7'];
        const bookCount = 6;
        const bookWidth = width / bookCount;

        for (let i = 0; i < bookCount; i++) {
            const bookX = x - width/2 + (i * bookWidth);
            const bookHeight = height + Math.random() * 4;

            ctx.fillStyle = bookColors[i % bookColors.length];
            ctx.fillRect(bookX, y - bookHeight, bookWidth - 1, bookHeight);

            // Book spine
            ctx.strokeStyle = this.darkenColor(bookColors[i % bookColors.length], 0.7);
            ctx.lineWidth = 1;
            ctx.strokeRect(bookX, y - bookHeight, bookWidth - 1, bookHeight);
        }
    }

    /**
     * Add shadow
     */
    addShadow(ctx, x, y, width, depth, opacity) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.beginPath();
        ctx.ellipse(x, y + 2, width/2, depth/4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /**
     * Add wood grain texture
     */
    addWoodGrain(ctx, x, y, width, height, direction) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;

        if (direction === 'vertical') {
            for (let i = 0; i < width; i += 5) {
                ctx.globalAlpha = 0.1 + Math.random() * 0.1;
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i, y + height);
                ctx.stroke();
            }
        } else {
            for (let i = 0; i < height; i += 5) {
                ctx.globalAlpha = 0.1 + Math.random() * 0.1;
                ctx.beginPath();
                ctx.moveTo(x, y + i);
                ctx.lineTo(x + width, y + i);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    /**
     * Add fabric texture
     */
    addFabricTexture(ctx, x, y, width, height, baseColor) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';

        // Subtle weave pattern
        for (let i = 0; i < 15; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;
            ctx.fillRect(px, py, 1, 1);
        }

        ctx.restore();
    }

    /**
     * Add metal shine effect
     */
    addMetalShine(ctx, x, y, width, height) {
        ctx.save();

        // Vertical shine
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);

        ctx.restore();
    }

    /**
     * Get wood color based on wood type
     */
    getWoodColor(woodType) {
        const colors = {
            oak: '#D4A373',
            pine: '#E8D5A2',
            walnut: '#5C4033',
            cherry: '#8B4513',
            painted: '#FFFFFF',
            mahogany: '#7B3F00'
        };
        return colors[woodType] || colors.oak;
    }

    /**
     * Darken a color
     */
    darkenColor(color, factor) {
        if (color.startsWith('rgba')) {
            return color; // Don't modify rgba colors
        }

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
        if (color.startsWith('rgba')) {
            return color;
        }

        const hex = color.replace('#', '');
        const r = Math.min(255, Math.floor(parseInt(hex.substr(0, 2), 16) * factor));
        const g = Math.min(255, Math.floor(parseInt(hex.substr(2, 2), 16) * factor));
        const b = Math.min(255, Math.floor(parseInt(hex.substr(4, 2), 16) * factor));
        return `rgb(${r},${g},${b})`;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.furnitureCache.clear();
    }
}
