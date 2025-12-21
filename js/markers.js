// Beecroft Valley - Floating Map Markers System
// Replaces ugly building rectangles with clean floating pins like Google Maps

// Marker styles by type
const MARKER_STYLES = {
    station:    { color: '#8B4513', size: 32 },
    shop:       { color: '#4CAF50', size: 28 },
    cafe:       { color: '#FF9800', size: 26 },
    restaurant: { color: '#F44336', size: 26 },
    school:     { color: '#FFC107', size: 28 },
    clinic:     { color: '#E91E63', size: 26 },
    park:       { color: '#8BC34A', size: 24 },
    church:     { color: '#9E9E9E', size: 26 },
    home:       { color: '#E91E63', size: 24 },
    community:  { color: '#9C27B0', size: 26 },
    firestation:{ color: '#FF5722', size: 28 },
    gym:        { color: '#00BCD4', size: 24 },
    parking:    { color: '#607D8B', size: 22 },
    playground: { color: '#FFEB3B', size: 24 },
    recreation: { color: '#3F51B5', size: 24 },
    vet:        { color: '#4DD0E1', size: 24 },
    christmas:  { color: '#2E7D32', size: 32, animated: true },
    christmas_tree: { color: '#2E7D32', size: 32, animated: true },
    car_dealer: { color: '#2196F3', size: 26 },
    garden:     { color: '#8BC34A', size: 24 },
    default:    { color: '#2196F3', size: 24 }
};

// Distance thresholds for visual states
const DISTANCE_FAR = 15;
const DISTANCE_NEAR = 5;

class MarkerRenderer {
    /**
     * Render a single marker at the given screen position
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} marker - Marker data (x, y, name, emoji, type, interactable, data)
     * @param {number} screenX - Screen X position
     * @param {number} screenY - Screen Y position
     * @param {number} distance - Distance from player
     * @param {number} time - Current timestamp for animations
     */
    static render(ctx, marker, screenX, screenY, distance, time) {
        const style = MARKER_STYLES[marker.type] || MARKER_STYLES.default;
        const isChristmas = marker.type === 'christmas' || marker.type === 'christmas_tree';

        // Calculate visual state based on distance
        let scale = 1.0;
        let alpha = 1.0;
        let showLabel = false;
        let isInteractable = false;

        if (distance > DISTANCE_FAR) {
            // Far: Small, muted, no label
            scale = 0.6;
            alpha = 0.6;
        } else if (distance > DISTANCE_NEAR) {
            // Near: Full size, label visible, subtle glow
            scale = 0.8 + (1 - (distance - DISTANCE_NEAR) / (DISTANCE_FAR - DISTANCE_NEAR)) * 0.2;
            alpha = 0.8 + (1 - (distance - DISTANCE_NEAR) / (DISTANCE_FAR - DISTANCE_NEAR)) * 0.2;
            showLabel = true;
        } else {
            // Interactable: Pulsing animation, "SPACE" prompt
            scale = 1.0;
            alpha = 1.0;
            showLabel = true;
            isInteractable = marker.interactable;
        }

        // Idle float animation
        const floatOffset = Math.sin(time / 500 + marker.x * 0.1) * 2;

        // Pulsing animation for interactable markers
        let pulseScale = 1.0;
        if (isInteractable) {
            pulseScale = 1.0 + Math.sin(time / 200) * 0.08;
        }

        const finalScale = scale * pulseScale;
        const baseSize = style.size * finalScale;
        const stemHeight = 20 * finalScale;

        // Adjusted Y for float and stem
        const markerY = screenY - floatOffset;

        ctx.save();
        ctx.globalAlpha = alpha;

        // === Draw ground shadow ===
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY + 4, 12 * finalScale, 6 * finalScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // === Draw pin stem (thin line) ===
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 2 * finalScale;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX, markerY - stemHeight);
        ctx.stroke();

        // === Draw glow for interactable markers ===
        if (isInteractable) {
            const glowRadius = baseSize * 0.8;
            const gradient = ctx.createRadialGradient(
                screenX, markerY - stemHeight - baseSize / 2,
                0,
                screenX, markerY - stemHeight - baseSize / 2,
                glowRadius
            );
            gradient.addColorStop(0, hexToRgba(style.color, 0.4));
            gradient.addColorStop(1, hexToRgba(style.color, 0));
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX, markerY - stemHeight - baseSize / 2, glowRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // === Draw bubble/circle background ===
        const bubbleY = markerY - stemHeight - baseSize / 2;

        // Outer ring (darker border)
        ctx.fillStyle = darkenColor(style.color, 0.2);
        ctx.beginPath();
        ctx.arc(screenX, bubbleY, baseSize / 2 + 2, 0, Math.PI * 2);
        ctx.fill();

        // Main bubble
        ctx.fillStyle = style.color;
        ctx.beginPath();
        ctx.arc(screenX, bubbleY, baseSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        const highlightGradient = ctx.createRadialGradient(
            screenX - baseSize * 0.15, bubbleY - baseSize * 0.15,
            0,
            screenX, bubbleY,
            baseSize / 2
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(screenX, bubbleY, baseSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // === Draw emoji centered in bubble ===
        ctx.font = `${Math.floor(baseSize * 0.6)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(marker.emoji, screenX, bubbleY + 1);

        // === Christmas tree sparkle effect ===
        if (isChristmas && style.animated) {
            MarkerRenderer.renderChristmasSparkles(ctx, screenX, bubbleY, baseSize, time);
        }

        // === Draw label below marker when near ===
        if (showLabel && marker.name) {
            const labelY = markerY + 12;
            const labelText = marker.name;

            // Measure text for background
            ctx.font = 'bold 11px Arial';
            const textWidth = ctx.measureText(labelText).width;

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            const padding = 4;
            const bgWidth = textWidth + padding * 2;
            const bgHeight = 16;
            ctx.beginPath();
            ctx.roundRect(screenX - bgWidth / 2, labelY - bgHeight / 2, bgWidth, bgHeight, 3);
            ctx.fill();

            // Text with dark outline for readability
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.lineWidth = 2;
            ctx.strokeText(labelText, screenX, labelY);
            ctx.fillStyle = '#fff';
            ctx.fillText(labelText, screenX, labelY);
        }

        // === Draw "SPACE" prompt badge above marker when interactable ===
        if (isInteractable) {
            const badgeY = bubbleY - baseSize / 2 - 16;
            const badgeText = 'SPACE';

            ctx.font = 'bold 10px Arial';
            const textWidth = ctx.measureText(badgeText).width;

            // Pulsing background
            const pulseAlpha = 0.7 + Math.sin(time / 150) * 0.3;
            ctx.fillStyle = `rgba(255, 215, 0, ${pulseAlpha})`;
            const padding = 4;
            const bgWidth = textWidth + padding * 2;
            const bgHeight = 14;
            ctx.beginPath();
            ctx.roundRect(screenX - bgWidth / 2, badgeY - bgHeight / 2, bgWidth, bgHeight, 3);
            ctx.fill();

            // Border
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000';
            ctx.fillText(badgeText, screenX, badgeY);
        }

        ctx.restore();
    }

    /**
     * Render Christmas tree sparkle effects
     */
    static renderChristmasSparkles(ctx, x, y, size, time) {
        const sparkleCount = 6;
        const sparkleRadius = size * 0.8;

        for (let i = 0; i < sparkleCount; i++) {
            const angle = (time / 1000 + i * Math.PI * 2 / sparkleCount) % (Math.PI * 2);
            const sparkleX = x + Math.cos(angle) * sparkleRadius * 0.5;
            const sparkleY = y + Math.sin(angle) * sparkleRadius * 0.3;

            // Twinkle effect
            const twinkle = Math.sin(time / 100 + i * 1.5);
            if (twinkle > 0) {
                const sparkleSize = 2 + twinkle * 2;
                const colors = ['#FFD700', '#FF6B6B', '#4FC3F7', '#81C784', '#BA68C8'];
                ctx.fillStyle = colors[i % colors.length];
                ctx.globalAlpha = 0.6 + twinkle * 0.4;

                // Star shape
                ctx.beginPath();
                for (let j = 0; j < 4; j++) {
                    const starAngle = j * Math.PI / 2;
                    const starX = sparkleX + Math.cos(starAngle) * sparkleSize;
                    const starY = sparkleY + Math.sin(starAngle) * sparkleSize;
                    if (j === 0) ctx.moveTo(starX, starY);
                    else ctx.lineTo(starX, starY);
                }
                ctx.closePath();
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }
}

// === Helper functions ===

/**
 * Convert hex color to rgba
 */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Darken a hex color by a factor
 */
function darkenColor(hex, factor) {
    const r = Math.floor(parseInt(hex.slice(1, 3), 16) * (1 - factor));
    const g = Math.floor(parseInt(hex.slice(3, 5), 16) * (1 - factor));
    const b = Math.floor(parseInt(hex.slice(5, 7), 16) * (1 - factor));
    return `rgb(${r}, ${g}, ${b})`;
}

// Polyfill for roundRect if not available
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        return this;
    };
}
