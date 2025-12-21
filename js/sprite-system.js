// Sprite System for Beecroft Valley
// Handles sprite sheets, animations, and rendering

class SpriteSheet {
    constructor(imagePath, frameWidth, frameHeight) {
        this.image = new Image();
        this.imagePath = imagePath;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.loaded = false;

        this.image.onload = () => {
            this.loaded = true;
            this.cols = Math.floor(this.image.width / frameWidth);
            this.rows = Math.floor(this.image.height / frameHeight);
        };

        this.image.src = imagePath;
    }

    // Draw a specific frame from the sprite sheet
    drawFrame(ctx, frameX, frameY, x, y, width = null, height = null) {
        if (!this.loaded) return;

        const w = width || this.frameWidth;
        const h = height || this.frameHeight;

        ctx.drawImage(
            this.image,
            frameX * this.frameWidth,
            frameY * this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            x - w / 2,
            y - h / 2,
            w,
            h
        );
    }
}

class Animation {
    constructor(spriteSheet, frames, frameRate = 8) {
        this.spriteSheet = spriteSheet;
        this.frames = frames; // Array of {x, y} frame coordinates
        this.frameRate = frameRate; // Frames per second
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.loop = true;
    }

    update(deltaTime) {
        this.frameTimer += deltaTime;
        const frameDuration = 1000 / this.frameRate;

        if (this.frameTimer >= frameDuration) {
            this.frameTimer -= frameDuration;
            this.currentFrame++;

            if (this.currentFrame >= this.frames.length) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.frames.length - 1;
                }
            }
        }
    }

    draw(ctx, x, y, width = null, height = null) {
        const frame = this.frames[this.currentFrame];
        this.spriteSheet.drawFrame(ctx, frame.x, frame.y, x, y, width, height);
    }

    reset() {
        this.currentFrame = 0;
        this.frameTimer = 0;
    }
}

class AnimatedSprite {
    constructor(spriteSheet, frameWidth, frameHeight) {
        this.spriteSheet = spriteSheet;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.animations = {};
        this.currentAnimation = null;
        this.direction = 'down';
        this.isMoving = false;
    }

    addAnimation(name, frames, frameRate = 8) {
        this.animations[name] = new Animation(this.spriteSheet, frames, frameRate);
    }

    // Set up standard 4-directional character animations
    setup4DirectionalAnimations(idleFrames, walkFrames) {
        // Idle animations
        this.addAnimation('idle_down', [idleFrames.down], 1);
        this.addAnimation('idle_left', [idleFrames.left], 1);
        this.addAnimation('idle_right', [idleFrames.right], 1);
        this.addAnimation('idle_up', [idleFrames.up], 1);

        // Walking animations
        this.addAnimation('walk_down', walkFrames.down, 8);
        this.addAnimation('walk_left', walkFrames.left, 8);
        this.addAnimation('walk_right', walkFrames.right, 8);
        this.addAnimation('walk_up', walkFrames.up, 8);

        // Set default animation
        this.currentAnimation = 'idle_down';
    }

    setDirection(direction, isMoving) {
        this.direction = direction;
        this.isMoving = isMoving;

        const animName = isMoving ? `walk_${direction}` : `idle_${direction}`;

        if (this.currentAnimation !== animName) {
            this.currentAnimation = animName;
            if (this.animations[animName]) {
                this.animations[animName].reset();
            }
        }
    }

    update(deltaTime) {
        if (this.animations[this.currentAnimation]) {
            this.animations[this.currentAnimation].update(deltaTime);
        }
    }

    draw(ctx, x, y, width = null, height = null) {
        if (this.animations[this.currentAnimation]) {
            this.animations[this.currentAnimation].draw(ctx, x, y, width, height);
        }
    }
}

// Sprite Manager - handles loading and caching sprites
class SpriteManager {
    constructor() {
        this.sprites = {};
        this.loadingQueue = [];
        this.onAllLoaded = null;
    }

    loadSprite(name, path, frameWidth, frameHeight) {
        const spriteSheet = new SpriteSheet(path, frameWidth, frameHeight);
        this.sprites[name] = spriteSheet;
        this.loadingQueue.push(spriteSheet);
        return spriteSheet;
    }

    getSprite(name) {
        return this.sprites[name];
    }

    allLoaded() {
        return this.loadingQueue.every(sprite => sprite.loaded);
    }

    waitForAll(callback) {
        const checkLoaded = () => {
            if (this.allLoaded()) {
                callback();
            } else {
                setTimeout(checkLoaded, 50);
            }
        };
        checkLoaded();
    }
}

// Procedural sprite generator - Creates pixel-art style RPG sprites
class ProceduralSpriteGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        // Disable image smoothing for crisp pixel art
        this.ctx.imageSmoothingEnabled = false;
    }

    // Helper to draw a pixel at scaled position
    pixel(x, y, color, scale = 3) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * scale, y * scale, scale, scale);
    }

    // Darken a color for shading
    darken(color, amount = 0.2) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
        return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
    }

    // Lighten a color for highlights
    lighten(color, amount = 0.2) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) * (1 + amount));
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) * (1 + amount));
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) * (1 + amount));
        return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
    }

    // Generate a pixel-art character sprite sheet (16x16 base, scaled to 48x48)
    generateCharacterSpriteSheet(width, height, colors) {
        const scale = 3; // 16 * 3 = 48
        const baseW = 16;
        const baseH = 16;

        this.canvas.width = width * 4;
        this.canvas.height = height * 4;
        this.ctx.imageSmoothingEnabled = false;

        const { hair, skin, outfit, accent } = colors;
        const outfitDark = this.darken(outfit, 0.3);
        const hairDark = this.darken(hair, 0.3);
        const skinDark = this.darken(skin, 0.15);
        const outline = '#2a1f1d';

        // Generate all frames - dir: 0=down, 1=left, 2=right, 3=up
        for (let dir = 0; dir < 4; dir++) {
            for (let frame = 0; frame < 4; frame++) {
                const offsetX = frame * width;
                const offsetY = dir * height;

                // Clear frame
                this.ctx.clearRect(offsetX, offsetY, width, height);

                // Walking animation offset
                const walkOffset = (frame === 1 || frame === 3) ? 1 : 0;
                const armSwing = (frame === 1) ? -1 : (frame === 3) ? 1 : 0;

                // Draw pixel art character
                const px = (x, y, c) => {
                    this.ctx.fillStyle = c;
                    this.ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
                };

                // === HAIR (top of head) ===
                if (dir === 3) { // up - show back of hair
                    px(6, 2, hair); px(7, 2, hair); px(8, 2, hair); px(9, 2, hair);
                    px(5, 3, hair); px(6, 3, hair); px(7, 3, hair); px(8, 3, hair); px(9, 3, hair); px(10, 3, hair);
                    px(5, 4, hair); px(6, 4, hair); px(7, 4, hair); px(8, 4, hair); px(9, 4, hair); px(10, 4, hair);
                    px(5, 5, hairDark); px(6, 5, hair); px(7, 5, hair); px(8, 5, hair); px(9, 5, hair); px(10, 5, hairDark);
                } else {
                    // Hair top
                    px(6, 1, hairDark); px(7, 1, hair); px(8, 1, hair); px(9, 1, hairDark);
                    px(5, 2, hairDark); px(6, 2, hair); px(7, 2, hair); px(8, 2, hair); px(9, 2, hair); px(10, 2, hairDark);
                    px(5, 3, hair); px(6, 3, hair); px(7, 3, hair); px(8, 3, hair); px(9, 3, hair); px(10, 3, hair);
                    // Hair sides
                    if (dir === 1) { // left - more hair on right
                        px(10, 4, hair); px(10, 5, hairDark);
                    } else if (dir === 2) { // right - more hair on left
                        px(5, 4, hair); px(5, 5, hairDark);
                    } else { // down - hair on both sides
                        px(5, 4, hair); px(10, 4, hair);
                    }
                }

                // === FACE ===
                // Head shape
                px(6, 4, skin); px(7, 4, skin); px(8, 4, skin); px(9, 4, skin);
                px(6, 5, skin); px(7, 5, skin); px(8, 5, skin); px(9, 5, skin);
                px(6, 6, skinDark); px(7, 6, skin); px(8, 6, skin); px(9, 6, skinDark);

                // Eyes based on direction
                if (dir === 0) { // down - two eyes
                    px(6, 5, '#000'); px(9, 5, '#000');
                    // Eye highlights
                    px(6, 4, '#fff'); px(9, 4, '#fff');
                } else if (dir === 1) { // left - one eye on left
                    px(6, 5, '#000'); px(6, 4, '#fff');
                } else if (dir === 2) { // right - one eye on right
                    px(9, 5, '#000'); px(9, 4, '#fff');
                }
                // dir === 3 (up) - no eyes visible

                // Accent (bow/headband)
                if (accent && dir !== 3) {
                    px(7, 2, accent); px(8, 2, accent);
                }

                // === BODY/OUTFIT ===
                // Torso
                px(6, 7, outfit); px(7, 7, outfit); px(8, 7, outfit); px(9, 7, outfit);
                px(6, 8, outfit); px(7, 8, outfit); px(8, 8, outfit); px(9, 8, outfit);
                px(6, 9, outfitDark); px(7, 9, outfit); px(8, 9, outfit); px(9, 9, outfitDark);

                // Skirt/lower body
                px(5, 10, outfit); px(6, 10, outfit); px(7, 10, outfit); px(8, 10, outfit); px(9, 10, outfit); px(10, 10, outfit);
                px(5, 11, outfitDark); px(6, 11, outfit); px(7, 11, outfit); px(8, 11, outfit); px(9, 11, outfit); px(10, 11, outfitDark);

                // === ARMS ===
                if (dir === 1) { // left
                    px(10, 7 + armSwing, skin); px(10, 8, skin);
                } else if (dir === 2) { // right
                    px(5, 7 + armSwing, skin); px(5, 8, skin);
                } else {
                    // Arms on both sides
                    px(5, 7 + armSwing, skin); px(5, 8, skin);
                    px(10, 7 - armSwing, skin); px(10, 8, skin);
                }

                // === LEGS (with walking animation) ===
                if (frame === 0 || frame === 2) { // standing/neutral
                    px(6, 12, skinDark); px(7, 12, skin);
                    px(8, 12, skin); px(9, 12, skinDark);
                    px(6, 13, outline); px(7, 13, skin);
                    px(8, 13, skin); px(9, 13, outline);
                    // Feet
                    px(6, 14, outline); px(7, 14, outline);
                    px(8, 14, outline); px(9, 14, outline);
                } else if (frame === 1) { // left leg forward
                    px(5, 12, skinDark); px(6, 12, skin);
                    px(9, 12, skin); px(10, 12, skinDark);
                    px(5, 13, outline); px(6, 13, skin);
                    px(9, 13, skin);
                    px(5, 14, outline); px(6, 14, outline);
                    px(9, 14, outline); px(10, 14, outline);
                } else { // frame === 3, right leg forward
                    px(6, 12, skinDark); px(7, 12, skin);
                    px(9, 12, skin); px(10, 12, skinDark);
                    px(7, 13, skin);
                    px(10, 13, outline); px(9, 13, skin);
                    px(6, 14, outline); px(7, 14, outline);
                    px(9, 14, outline); px(10, 14, outline);
                }
            }
        }

        return this.canvas.toDataURL();
    }

    // Generate NPC sprite with pixel art style
    generateNPCSprite(width, height, config) {
        const scale = 3;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, width, height);

        const { bodyColor, hairColor, skinColor, accessory, age } = config;
        const bodyDark = this.darken(bodyColor, 0.3);
        const hairDark = this.darken(hairColor, 0.3);
        const skinDark = this.darken(skinColor, 0.15);
        const outline = '#2a1f1d';

        // Scale factor for children
        const yOffset = age === 'child' ? 3 : 0;

        const px = (x, y, c) => {
            this.ctx.fillStyle = c;
            this.ctx.fillRect(x * scale, (y + yOffset) * scale, scale, scale);
        };

        // Hair
        px(6, 1, hairDark); px(7, 1, hairColor); px(8, 1, hairColor); px(9, 1, hairDark);
        px(5, 2, hairDark); px(6, 2, hairColor); px(7, 2, hairColor); px(8, 2, hairColor); px(9, 2, hairColor); px(10, 2, hairDark);
        px(5, 3, hairColor); px(6, 3, hairColor); px(7, 3, hairColor); px(8, 3, hairColor); px(9, 3, hairColor); px(10, 3, hairColor);
        px(5, 4, hairColor); px(10, 4, hairColor);

        // Face
        px(6, 4, skinColor); px(7, 4, skinColor); px(8, 4, skinColor); px(9, 4, skinColor);
        px(6, 5, skinColor); px(7, 5, skinColor); px(8, 5, skinColor); px(9, 5, skinColor);
        px(6, 6, skinDark); px(7, 6, skinColor); px(8, 6, skinColor); px(9, 6, skinDark);

        // Eyes
        px(6, 5, '#000'); px(9, 5, '#000');
        px(6, 4, '#fff'); px(9, 4, '#fff');

        // Body
        if (accessory === 'medcoat') {
            // Doctor's coat
            const coatColor = '#E8F4F8';
            const coatDark = '#C5D9E0';
            px(5, 7, coatColor); px(6, 7, coatColor); px(7, 7, coatColor); px(8, 7, coatColor); px(9, 7, coatColor); px(10, 7, coatColor);
            px(5, 8, coatColor); px(6, 8, coatColor); px(7, 8, coatColor); px(8, 8, coatColor); px(9, 8, coatColor); px(10, 8, coatColor);
            px(5, 9, coatDark); px(6, 9, coatColor); px(7, 9, coatColor); px(8, 9, coatColor); px(9, 9, coatColor); px(10, 9, coatDark);
            px(5, 10, coatDark); px(6, 10, coatColor); px(7, 10, coatColor); px(8, 10, coatColor); px(9, 10, coatColor); px(10, 10, coatDark);
            px(5, 11, coatDark); px(6, 11, coatColor); px(10, 11, coatDark); px(9, 11, coatColor);
        } else if (accessory === 'apron') {
            // Outfit with apron
            px(6, 7, bodyColor); px(7, 7, bodyColor); px(8, 7, bodyColor); px(9, 7, bodyColor);
            px(6, 8, '#FFFFFF'); px(7, 8, '#FFFFFF'); px(8, 8, '#FFFFFF'); px(9, 8, '#FFFFFF');
            px(6, 9, '#FFFFFF'); px(7, 9, '#FFFFFF'); px(8, 9, '#FFFFFF'); px(9, 9, '#FFFFFF');
            px(5, 10, bodyColor); px(6, 10, '#FFFFFF'); px(7, 10, '#FFFFFF'); px(8, 10, '#FFFFFF'); px(9, 10, '#FFFFFF'); px(10, 10, bodyColor);
            px(5, 11, bodyDark); px(6, 11, '#EEEEEE'); px(7, 11, '#FFFFFF'); px(8, 11, '#FFFFFF'); px(9, 11, '#EEEEEE'); px(10, 11, bodyDark);
        } else {
            // Normal outfit
            px(6, 7, bodyColor); px(7, 7, bodyColor); px(8, 7, bodyColor); px(9, 7, bodyColor);
            px(6, 8, bodyColor); px(7, 8, bodyColor); px(8, 8, bodyColor); px(9, 8, bodyColor);
            px(6, 9, bodyDark); px(7, 9, bodyColor); px(8, 9, bodyColor); px(9, 9, bodyDark);
            px(5, 10, bodyColor); px(6, 10, bodyColor); px(7, 10, bodyColor); px(8, 10, bodyColor); px(9, 10, bodyColor); px(10, 10, bodyColor);
            px(5, 11, bodyDark); px(6, 11, bodyColor); px(7, 11, bodyColor); px(8, 11, bodyColor); px(9, 11, bodyColor); px(10, 11, bodyDark);
        }

        // Arms
        px(5, 7, skinColor); px(5, 8, skinColor);
        px(10, 7, skinColor); px(10, 8, skinColor);

        // Legs
        px(6, 12, skinDark); px(7, 12, skinColor);
        px(8, 12, skinColor); px(9, 12, skinDark);
        px(6, 13, outline); px(7, 13, skinColor);
        px(8, 13, skinColor); px(9, 13, outline);
        // Feet
        px(6, 14, outline); px(7, 14, outline);
        px(8, 14, outline); px(9, 14, outline);

        // Glasses accessory
        if (accessory === 'glasses') {
            px(5, 5, '#333'); px(6, 5, '#333');
            px(7, 5, '#333');
            px(8, 5, '#333'); px(9, 5, '#333'); px(10, 5, '#333');
        }

        return this.canvas.toDataURL();
    }

    // Generate pixel-art animal sprite
    generateAnimalSprite(width, height, type) {
        this.canvas.width = width * 4; // 4 frames
        this.canvas.height = height;
        this.ctx.imageSmoothingEnabled = false;

        for (let frame = 0; frame < 4; frame++) {
            this.drawAnimalFrame(frame * width, 0, width, height, type, frame);
        }

        return this.canvas.toDataURL();
    }

    drawAnimalFrame(x, y, w, h, type, frame) {
        this.ctx.clearRect(x, y, w, h);
        const scale = 2; // 12x12 base scaled to 24x24

        // Helper for pixel drawing
        const px = (px_x, px_y, c) => {
            this.ctx.fillStyle = c;
            this.ctx.fillRect(x + px_x * scale, y + px_y * scale, scale, scale);
        };

        const wingFlap = frame % 2 === 0 ? 0 : 1;

        if (type === 'kookaburra') {
            const brown = '#8B7355';
            const cream = '#F5DEB3';
            const dark = '#5D4037';
            // Body
            px(4, 6, brown); px(5, 6, brown); px(6, 6, brown); px(7, 6, brown);
            px(4, 7, brown); px(5, 7, cream); px(6, 7, cream); px(7, 7, brown);
            px(4, 8, dark); px(5, 8, brown); px(6, 8, brown); px(7, 8, dark);
            // Head
            px(5, 3, cream); px(6, 3, cream);
            px(4, 4, cream); px(5, 4, cream); px(6, 4, cream); px(7, 4, cream);
            px(5, 5, cream); px(6, 5, cream);
            // Eye
            px(6, 4, '#000');
            // Beak
            px(8, 4, dark); px(9, 4, dark); px(10, 4 + wingFlap, '#000');
            // Tail
            px(2, 7, dark); px(3, 7, brown); px(2, 8, dark);
        } else if (type === 'lorikeet') {
            const red = '#FF3333';
            const green = '#00AA00';
            const blue = '#3366FF';
            const yellow = '#FFCC00';
            // Body
            px(5, 5, green); px(6, 5, green);
            px(4, 6, green); px(5, 6, blue); px(6, 6, blue); px(7, 6, green);
            px(5, 7, green); px(6, 7, green);
            // Head
            px(5, 3, red); px(6, 3, red);
            px(4, 4, red); px(5, 4, red); px(6, 4, red); px(7, 4, red);
            // Eye
            px(6, 4, '#000');
            // Beak
            px(8, 4, yellow);
            // Wings (animated)
            px(3, 5 - wingFlap, blue); px(3, 6, green);
            px(8, 5 - wingFlap, blue); px(8, 6, green);
        } else if (type === 'lizard') {
            const gray = '#7A7A7A';
            const dark = '#5A5A5A';
            // Body (horizontal)
            px(3, 6, gray); px(4, 6, gray); px(5, 6, gray); px(6, 6, gray); px(7, 6, gray);
            px(4, 7, dark); px(5, 7, dark); px(6, 7, dark);
            // Head
            px(8, 5, gray); px(9, 5, gray);
            px(8, 6, gray); px(9, 6, gray);
            // Eye
            px(9, 5, '#000');
            // Tail
            px(2, 6, dark); px(1, 5, dark);
            // Legs
            px(4, 8, gray); px(6, 8, gray);
            // Tongue (occasionally)
            if (frame === 2) {
                px(10, 6, '#4169E1'); px(11, 6, '#4169E1');
            }
        } else if (type === 'magpie') {
            const black = '#1a1a1a';
            const white = '#FFFFFF';
            // Body
            px(5, 6, black); px(6, 6, black);
            px(4, 7, black); px(5, 7, white); px(6, 7, white); px(7, 7, black);
            px(5, 8, black); px(6, 8, black);
            // Head
            px(5, 4, black); px(6, 4, black);
            px(4, 5, black); px(5, 5, black); px(6, 5, black); px(7, 5, black);
            // Eye
            px(6, 4, '#FFD700');
            // Beak
            px(8, 5, '#666');
            // Wings
            px(3, 6 - wingFlap, black); px(8, 6 - wingFlap, black);
        } else if (type === 'cat') {
            const orange = '#FF8C42';
            const dark = '#CC6B30';
            // Body
            px(5, 7, orange); px(6, 7, orange);
            px(4, 8, orange); px(5, 8, orange); px(6, 8, orange); px(7, 8, orange);
            px(5, 9, dark); px(6, 9, dark);
            // Head
            px(5, 5, orange); px(6, 5, orange);
            px(4, 6, orange); px(5, 6, orange); px(6, 6, orange); px(7, 6, orange);
            // Ears
            px(4, 4, orange); px(7, 4, orange);
            // Eyes
            px(5, 5, '#32CD32'); px(6, 5, '#32CD32');
            // Nose
            px(5, 6, '#FFB6C1');
            // Tail (animated)
            px(8, 7, orange); px(9, 6 + wingFlap, orange);
            // Legs
            px(4, 10, dark); px(7, 10, dark);
        } else if (type === 'dog') {
            const brown = '#8B5A2B';
            const dark = '#5D3A1A';
            const tan = '#D2B48C';
            // Body
            px(5, 7, brown); px(6, 7, brown);
            px(4, 8, brown); px(5, 8, tan); px(6, 8, tan); px(7, 8, brown);
            px(5, 9, brown); px(6, 9, brown);
            // Head
            px(5, 4, brown); px(6, 4, brown);
            px(4, 5, brown); px(5, 5, brown); px(6, 5, brown); px(7, 5, brown);
            px(5, 6, tan); px(6, 6, tan);
            // Ears (floppy)
            px(3, 5, dark); px(3, 6, dark);
            px(8, 5, dark); px(8, 6, dark);
            // Eyes
            px(5, 4, '#000'); px(6, 4, '#000');
            // Nose
            px(5, 5, '#000');
            // Tail (animated)
            px(8, 7, brown); px(9, 6 - wingFlap, brown);
            // Legs
            px(4, 10, dark); px(7, 10, dark);
        } else if (type === 'possum') {
            const gray = '#808080';
            const dark = '#505050';
            const pink = '#FFB6C1';
            // Body
            px(5, 7, gray); px(6, 7, gray);
            px(4, 8, gray); px(5, 8, gray); px(6, 8, gray); px(7, 8, gray);
            px(5, 9, dark); px(6, 9, dark);
            // Head
            px(5, 4, gray); px(6, 4, gray);
            px(4, 5, gray); px(5, 5, gray); px(6, 5, gray); px(7, 5, gray);
            px(5, 6, gray); px(6, 6, gray);
            // Big ears
            px(3, 3, pink); px(4, 3, gray); px(7, 3, gray); px(8, 3, pink);
            px(4, 4, gray); px(7, 4, gray);
            // Eyes (big and cute)
            px(5, 5, '#000'); px(6, 5, '#000');
            // Nose
            px(5, 6, pink);
            // Tail (curled)
            px(8, 8, gray); px(9, 7, gray); px(9, 6, dark);
            // Legs
            px(4, 10, dark); px(7, 10, dark);
        }
    }

    // Generate textured tile
    generateTile(width, height, type) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.clearRect(0, 0, width, height);

        if (type === 'grass') {
            // Base grass
            this.ctx.fillStyle = '#7CB342';
            this.ctx.fillRect(0, 0, width, height);
            // Add texture
            for (let i = 0; i < 20; i++) {
                this.ctx.fillStyle = Math.random() > 0.5 ? '#8BC34A' : '#689F38';
                this.ctx.fillRect(
                    Math.random() * width,
                    Math.random() * height,
                    2, 2
                );
            }
            // Occasional flowers
            if (Math.random() > 0.7) {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else if (type === 'path') {
            // Dirt path
            this.ctx.fillStyle = '#8D6E63';
            this.ctx.fillRect(0, 0, width, height);
            // Texture
            for (let i = 0; i < 15; i++) {
                this.ctx.fillStyle = Math.random() > 0.5 ? '#A1887F' : '#795548';
                this.ctx.fillRect(
                    Math.random() * width,
                    Math.random() * height,
                    3, 3
                );
            }
        } else if (type === 'road') {
            // Asphalt
            this.ctx.fillStyle = '#424242';
            this.ctx.fillRect(0, 0, width, height);
            // Road texture
            for (let i = 0; i < 10; i++) {
                this.ctx.fillStyle = Math.random() > 0.5 ? '#616161' : '#212121';
                this.ctx.fillRect(
                    Math.random() * width,
                    Math.random() * height,
                    2, 2
                );
            }
        } else if (type === 'water') {
            // Blue water
            this.ctx.fillStyle = '#42A5F5';
            this.ctx.fillRect(0, 0, width, height);
            // Shimmer
            for (let i = 0; i < 8; i++) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.fillRect(
                    Math.random() * width,
                    Math.random() * height,
                    3, 1
                );
            }
        } else if (type === 'park') {
            // Lighter grass for parks
            this.ctx.fillStyle = '#9CCC65';
            this.ctx.fillRect(0, 0, width, height);
            // More flowers
            for (let i = 0; i < 5; i++) {
                const colors = ['#FF6B6B', '#FFD93D', '#FF69B4', '#9B59B6'];
                this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                this.ctx.beginPath();
                this.ctx.arc(Math.random() * width, Math.random() * height, 1.5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else if (type === 'railway') {
            // Railway tracks
            this.ctx.fillStyle = '#5D4037';
            this.ctx.fillRect(0, 0, width, height);
            // Rails
            this.ctx.fillStyle = '#9E9E9E';
            this.ctx.fillRect(width * 0.2, 0, 3, height);
            this.ctx.fillRect(width * 0.8 - 3, 0, 3, height);
            // Sleepers
            this.ctx.fillStyle = '#3E2723';
            for (let y = 0; y < height; y += 8) {
                this.ctx.fillRect(0, y, width, 3);
            }
        }

        return this.canvas.toDataURL();
    }
}

// Export for use in game (both Node.js and browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SpriteSheet,
        Animation,
        AnimatedSprite,
        SpriteManager,
        ProceduralSpriteGenerator
    };
} else if (typeof window !== 'undefined') {
    // Browser global exports
    window.SpriteSheet = SpriteSheet;
    window.Animation = Animation;
    window.AnimatedSprite = AnimatedSprite;
    window.SpriteManager = SpriteManager;
    window.ProceduralSpriteGenerator = ProceduralSpriteGenerator;
}
