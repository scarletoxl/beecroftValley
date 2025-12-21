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

// Procedural sprite generator for placeholder graphics
class ProceduralSpriteGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    // Generate a simple character sprite sheet
    generateCharacterSpriteSheet(width, height, colors) {
        this.canvas.width = width * 4; // 4 frames per direction
        this.canvas.height = height * 4; // 4 directions

        const { hair, skin, outfit, accent } = colors;

        // Generate all frames
        for (let dir = 0; dir < 4; dir++) {
            for (let frame = 0; frame < 4; frame++) {
                this.drawCharacterFrame(
                    frame * width,
                    dir * height,
                    width,
                    height,
                    dir,
                    frame,
                    colors
                );
            }
        }

        return this.canvas.toDataURL();
    }

    drawCharacterFrame(x, y, w, h, direction, frame, colors) {
        const { hair, skin, outfit, accent } = colors;

        // Clear area
        this.ctx.clearRect(x, y, w, h);

        // Calculate animation offset for legs
        const legOffset = frame % 2 === 0 ? 0 : 1;

        // Direction: 0=down, 1=left, 2=right, 3=up

        // Body (centered)
        this.ctx.fillStyle = outfit;
        this.ctx.fillRect(x + w/3, y + h/2, w/3, h/2.5);

        // Head
        this.ctx.fillStyle = skin;
        this.ctx.beginPath();
        this.ctx.arc(x + w/2, y + h/3, w/4, 0, Math.PI * 2);
        this.ctx.fill();

        // Hair
        this.ctx.fillStyle = hair;
        this.ctx.beginPath();
        this.ctx.arc(x + w/2, y + h/3 - 2, w/3.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Hair accent (bow/headband)
        if (accent) {
            this.ctx.fillStyle = accent;
            this.ctx.fillRect(x + w/2 - 3, y + h/4, 6, 3);
        }

        // Legs (simple walking animation)
        this.ctx.fillStyle = skin;
        if (direction === 0 || direction === 3) { // down or up
            this.ctx.fillRect(x + w/3 + legOffset, y + h*0.75, 3, h/4);
            this.ctx.fillRect(x + w/3 + w/6 - legOffset, y + h*0.75, 3, h/4);
        } else { // left or right
            this.ctx.fillRect(x + w/2 - 2, y + h*0.75, 4, h/4);
        }

        // Eyes (direction dependent)
        this.ctx.fillStyle = '#000';
        if (direction === 0) { // down
            this.ctx.fillRect(x + w/2 - 4, y + h/3, 2, 2);
            this.ctx.fillRect(x + w/2 + 2, y + h/3, 2, 2);
        } else if (direction === 1) { // left
            this.ctx.fillRect(x + w/2 - 2, y + h/3, 2, 2);
        } else if (direction === 2) { // right
            this.ctx.fillRect(x + w/2, y + h/3, 2, 2);
        } else { // up - no eyes visible
            // Just show back of head
        }
    }

    // Generate NPC sprite
    generateNPCSprite(width, height, config) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.clearRect(0, 0, width, height);

        const { bodyColor, hairColor, skinColor, accessory, age } = config;

        // Scale based on age
        const scale = age === 'child' ? 0.8 : age === 'elderly' ? 0.9 : 1.0;
        const offsetY = age === 'child' ? height * 0.1 : 0;

        // Body
        this.ctx.fillStyle = bodyColor;
        this.ctx.fillRect(width/3, height/2 + offsetY, width/3, height/2.5 * scale);

        // Head
        this.ctx.fillStyle = skinColor;
        this.ctx.beginPath();
        this.ctx.arc(width/2, height/3 + offsetY, width/4 * scale, 0, Math.PI * 2);
        this.ctx.fill();

        // Hair
        this.ctx.fillStyle = hairColor;
        this.ctx.beginPath();
        this.ctx.arc(width/2, height/3 - 2 + offsetY, width/3.5 * scale, 0, Math.PI * 2);
        this.ctx.fill();

        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(width/2 - 4, height/3 + offsetY, 2, 2);
        this.ctx.fillRect(width/2 + 2, height/3 + offsetY, 2, 2);

        // Accessory (glasses, hat, etc.)
        if (accessory === 'glasses') {
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(width/2 - 6, height/3 - 2 + offsetY, 5, 4);
            this.ctx.strokeRect(width/2 + 1, height/3 - 2 + offsetY, 5, 4);
        } else if (accessory === 'apron') {
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(width/3, height/2 + offsetY, width/3, height/3 * scale);
        } else if (accessory === 'medcoat') {
            this.ctx.fillStyle = '#E0F0FF';
            this.ctx.fillRect(width/3 - 2, height/2 + offsetY, width/3 + 4, height/2.5 * scale);
        }

        return this.canvas.toDataURL();
    }

    // Generate simple animal sprite
    generateAnimalSprite(width, height, type) {
        this.canvas.width = width * 4; // 4 frames
        this.canvas.height = height;

        for (let frame = 0; frame < 4; frame++) {
            this.drawAnimalFrame(frame * width, 0, width, height, type, frame);
        }

        return this.canvas.toDataURL();
    }

    drawAnimalFrame(x, y, w, h, type, frame) {
        this.ctx.clearRect(x, y, w, h);

        const wingFlap = frame % 2 === 0 ? -2 : 2;

        if (type === 'kookaburra') {
            // Body
            this.ctx.fillStyle = '#8B7355';
            this.ctx.fillRect(x + w/4, y + h/3, w/2, h/2);
            // Head
            this.ctx.fillStyle = '#A0826D';
            this.ctx.beginPath();
            this.ctx.arc(x + w/2, y + h/4, w/4, 0, Math.PI * 2);
            this.ctx.fill();
            // Beak
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(x + w/2 + 3, y + h/4, 4, 2);
        } else if (type === 'lorikeet') {
            // Colorful bird
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.fillRect(x + w/4, y + h/3, w/2, h/3);
            this.ctx.fillStyle = '#4ECDC4';
            this.ctx.fillRect(x + w/4, y + h/2, w/2, h/4);
            // Wings
            this.ctx.fillStyle = '#95E1D3';
            this.ctx.fillRect(x + w/4 - 2, y + h/3 + wingFlap, 3, h/3);
            this.ctx.fillRect(x + w*0.75, y + h/3 + wingFlap, 3, h/3);
        } else if (type === 'lizard') {
            // Blue tongue lizard
            this.ctx.fillStyle = '#8B8680';
            this.ctx.fillRect(x + w/6, y + h/2, w*2/3, h/4);
            // Head
            this.ctx.fillRect(x + w*0.75, y + h/2, w/5, h/5);
            // Tongue (occasionally)
            if (frame === 2) {
                this.ctx.fillStyle = '#4169E1';
                this.ctx.fillRect(x + w*0.9, y + h/2 + 2, 4, 2);
            }
        } else if (type === 'magpie') {
            // Black and white bird
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(x + w/4, y + h/3, w/2, h/2);
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(x + w/3, y + h/2, w/3, h/6);
        } else if (type === 'cat') {
            // Simple cat
            this.ctx.fillStyle = '#FF8C69';
            this.ctx.fillRect(x + w/3, y + h/2, w/3, h/3);
            // Head
            this.ctx.beginPath();
            this.ctx.arc(x + w/2, y + h/3, w/4, 0, Math.PI * 2);
            this.ctx.fill();
            // Ears
            this.ctx.fillRect(x + w/3, y + h/6, 3, 6);
            this.ctx.fillRect(x + w*2/3 - 3, y + h/6, 3, 6);
        } else if (type === 'dog') {
            // Simple dog
            this.ctx.fillStyle = '#D2691E';
            this.ctx.fillRect(x + w/3, y + h/2, w/3, h/3);
            // Head
            this.ctx.beginPath();
            this.ctx.arc(x + w/2, y + h/3, w/3.5, 0, Math.PI * 2);
            this.ctx.fill();
            // Floppy ears
            this.ctx.fillRect(x + w/4, y + h/4, 4, h/4);
            this.ctx.fillRect(x + w*3/4 - 4, y + h/4, 4, h/4);
        } else if (type === 'possum') {
            // Gray possum
            this.ctx.fillStyle = '#A9A9A9';
            this.ctx.fillRect(x + w/3, y + h/2, w/3, h/3);
            // Head with big ears
            this.ctx.beginPath();
            this.ctx.arc(x + w/2, y + h/3, w/4, 0, Math.PI * 2);
            this.ctx.fill();
            // Large round ears
            this.ctx.beginPath();
            this.ctx.arc(x + w/3, y + h/4, w/6, 0, Math.PI * 2);
            this.ctx.arc(x + w*2/3, y + h/4, w/6, 0, Math.PI * 2);
            this.ctx.fill();
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

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SpriteSheet,
        Animation,
        AnimatedSprite,
        SpriteManager,
        ProceduralSpriteGenerator
    };
}
