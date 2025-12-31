// js/math-tutor/math-grid.js
// Visual number garden grid with animations

class MathGrid {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Grid dimensions
        this.rows = 10;
        this.cols = 10;
        this.cellSize = 50;
        this.padding = 20;

        // Resize canvas to fit grid
        this.canvas.width = this.cols * this.cellSize + this.padding * 2;
        this.canvas.height = this.rows * this.cellSize + this.padding * 2;

        // Row colors (flower garden theme)
        this.rowColors = [
            '#FFE4E1', // 0-9: Misty Rose
            '#FFFACD', // 10-19: Lemon Chiffon
            '#E0FFE0', // 20-29: Light Green
            '#E6E6FA', // 30-39: Lavender
            '#B0E0E6', // 40-49: Powder Blue
            '#FFE4B5', // 50-59: Moccasin
            '#DDA0DD', // 60-69: Plum
            '#98FB98', // 70-79: Pale Green
            '#FFDAB9', // 80-89: Peach Puff
            '#87CEEB'  // 90-99: Sky Blue
        ];

        this.rowEmojis = ['🌷', '🌻', '🌸', '💜', '🩵', '🌼', '🪻', '🌿', '🍑', '☁️'];

        // Animation state
        this.animationPath = [];
        this.animationIndex = 0;
        this.animationProgress = 0;
        this.isAnimating = false;
        this.highlightedCell = null;
        this.selectedCell = null;

        // Visibility state
        this.visibility = 'full'; // full, partial, peek, none
        this.visibleRows = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

        // Bee sprite position
        this.beeX = 0;
        this.beeY = 0;
        this.beeTargetX = 0;
        this.beeTargetY = 0;

        // Click handler
        this.onCellClick = null;
        this.setupClickHandler();

        // Start render loop
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupClickHandler() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const col = Math.floor((x - this.padding) / this.cellSize);
            const row = Math.floor((y - this.padding) / this.cellSize);

            if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                const number = row * 10 + col;
                this.selectedCell = number;

                if (this.onCellClick) {
                    this.onCellClick(number);
                }
            }
        });
    }

    // Set visibility level
    setVisibility(level, centerNumber = null) {
        this.visibility = level;

        if (level === 'full') {
            this.visibleRows = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        } else if (level === 'partial' && centerNumber !== null) {
            // Show only nearby rows
            const centerRow = Math.floor(centerNumber / 10);
            this.visibleRows = new Set();
            for (let r = Math.max(0, centerRow - 1); r <= Math.min(9, centerRow + 1); r++) {
                this.visibleRows.add(r);
            }
        } else if (level === 'peek') {
            this.visibleRows = new Set();
        } else if (level === 'none') {
            this.visibleRows = new Set();
        }
    }

    // Temporarily show grid (for peek mode)
    peek(duration = 2000) {
        const original = this.visibility;
        const originalRows = new Set(this.visibleRows);

        this.visibility = 'full';
        this.visibleRows = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

        setTimeout(() => {
            this.visibility = original;
            this.visibleRows = originalRows;
        }, duration);
    }

    // Animate path from start to end
    animatePath(path, onComplete) {
        this.animationPath = path;
        this.animationIndex = 0;
        this.animationProgress = 0;
        this.isAnimating = true;
        this.onAnimationComplete = onComplete;

        if (path.length > 0) {
            const start = path[0];
            this.beeX = (start % 10) * this.cellSize + this.padding + this.cellSize / 2;
            this.beeY = Math.floor(start / 10) * this.cellSize + this.padding + this.cellSize / 2;
        }
    }

    // Highlight a specific cell
    highlightCell(number, style = 'pulse') {
        this.highlightedCell = { number, style };
    }

    clearHighlight() {
        this.highlightedCell = null;
    }

    // Main animation loop
    animate(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Update animation
        if (this.isAnimating && this.animationPath.length > 1) {
            this.animationProgress += deltaTime / 500; // 500ms per step

            if (this.animationProgress >= 1) {
                this.animationProgress = 0;
                this.animationIndex++;

                if (this.animationIndex >= this.animationPath.length - 1) {
                    this.isAnimating = false;
                    if (this.onAnimationComplete) {
                        this.onAnimationComplete();
                    }
                }
            }

            // Interpolate bee position
            if (this.animationIndex < this.animationPath.length - 1) {
                const from = this.animationPath[this.animationIndex];
                const to = this.animationPath[this.animationIndex + 1];

                const fromX = (from % 10) * this.cellSize + this.padding + this.cellSize / 2;
                const fromY = Math.floor(from / 10) * this.cellSize + this.padding + this.cellSize / 2;
                const toX = (to % 10) * this.cellSize + this.padding + this.cellSize / 2;
                const toY = Math.floor(to / 10) * this.cellSize + this.padding + this.cellSize / 2;

                // Eased interpolation
                const t = this.easeInOutQuad(this.animationProgress);
                this.beeX = fromX + (toX - fromX) * t;
                this.beeY = fromY + (toY - fromY) * t;
            }
        }

        // Render
        this.render(timestamp);

        requestAnimationFrame(this.animate);
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    render(timestamp) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Background
        ctx.fillStyle = '#f5f5dc'; // Beige garden background
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = this.padding + col * this.cellSize;
                const y = this.padding + row * this.cellSize;
                const number = row * 10 + col;

                const isVisible = this.visibleRows.has(row);

                // Cell background
                if (isVisible) {
                    ctx.fillStyle = this.rowColors[row];
                } else {
                    ctx.fillStyle = '#ddd';
                }

                ctx.fillRect(x, y, this.cellSize - 2, this.cellSize - 2);

                // Cell border
                ctx.strokeStyle = '#999';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, this.cellSize - 2, this.cellSize - 2);

                // Highlight effect
                if (this.highlightedCell && this.highlightedCell.number === number) {
                    const pulse = Math.sin(timestamp / 200) * 0.3 + 0.7;
                    ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
                    ctx.fillRect(x + 2, y + 2, this.cellSize - 6, this.cellSize - 6);
                }

                // Selected cell
                if (this.selectedCell === number) {
                    ctx.strokeStyle = '#FFD700';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x + 1, y + 1, this.cellSize - 4, this.cellSize - 4);
                }

                // Number text
                if (isVisible) {
                    ctx.fillStyle = '#333';
                    ctx.font = 'bold 16px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(number.toString(), x + this.cellSize / 2, y + this.cellSize / 2);
                } else if (this.visibility !== 'none') {
                    // Show question mark for hidden cells
                    ctx.fillStyle = '#999';
                    ctx.font = '14px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('?', x + this.cellSize / 2, y + this.cellSize / 2);
                }
            }
        }

        // Draw row labels with emojis
        ctx.font = '16px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let row = 0; row < this.rows; row++) {
            const y = this.padding + row * this.cellSize + this.cellSize / 2;
            ctx.fillText(this.rowEmojis[row], this.padding - 5, y);
        }

        // Draw animation path trail
        if (this.animationPath.length > 1 && this.isAnimating) {
            ctx.strokeStyle = 'rgba(255, 180, 0, 0.5)';
            ctx.lineWidth = 4;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();

            for (let i = 0; i <= this.animationIndex; i++) {
                const num = this.animationPath[i];
                const x = (num % 10) * this.cellSize + this.padding + this.cellSize / 2;
                const y = Math.floor(num / 10) * this.cellSize + this.padding + this.cellSize / 2;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            // Include current animated position
            ctx.lineTo(this.beeX, this.beeY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw bee
        if (this.animationPath.length > 0 || this.highlightedCell) {
            const beeSize = 30;
            const bobOffset = Math.sin(timestamp / 150) * 3;

            ctx.font = `${beeSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🐝', this.beeX, this.beeY + bobOffset);
        }
    }

    // Position bee at a specific number
    setBeePosition(number) {
        this.beeX = (number % 10) * this.cellSize + this.padding + this.cellSize / 2;
        this.beeY = Math.floor(number / 10) * this.cellSize + this.padding + this.cellSize / 2;
        this.animationPath = [number];
    }

    // Get cell dimensions for external layout
    getDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height,
            cellSize: this.cellSize
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathGrid;
}
