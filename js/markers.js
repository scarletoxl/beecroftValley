// Beecroft Valley - Floating Map Markers System
// Replaces ugly building rectangles with clean floating pins like Google Maps

// ===== BEECROFT POI DATA =====
// All POI locations from KML with GPS coordinates
class BeeccroftPOIData {
    // Reference point: Beecroft Railway Station
    static ORIGIN_LAT = -33.7497;
    static ORIGIN_LNG = 151.0657;

    // Scale factor: degrees to game units (approximately 1 degree ≈ 111km)
    // At this latitude, 1 degree lat ≈ 111km, 1 degree lng ≈ 93km
    // We want roughly 1 game unit = ~10 meters, so scale factor ~10000
    static SCALE_LAT = 10000;
    static SCALE_LNG = 8500; // Adjusted for longitude compression at this latitude

    // Game origin offset (where station is in game coordinates)
    static GAME_ORIGIN_X = 250;
    static GAME_ORIGIN_Y = 250;

    static getPOIs() {
        return [
            { name: "Beecroft Railway Station", lat: -33.7497, lng: 151.0657, type: "station", emoji: "🚂", canEnter: true, hasInterior: true },
            { name: "Beecroft Vet", lat: -33.7487499, lng: 151.0661721, type: "vet", emoji: "🐾", canEnter: true },
            { name: "HerGP Medical Clinic", lat: -33.7480712, lng: 151.0661727, type: "clinic", emoji: "👩‍⚕️", canEnter: true, hasDoctor: true },
            { name: "Smart Cookies Early Learning Centre", lat: -33.7481295, lng: 151.0657495, type: "school", emoji: "👶", canEnter: true },
            { name: "Hannah's Beecroft", lat: -33.7490767, lng: 151.0647043, type: "restaurant", emoji: "🍽️", canEnter: true, isRestaurant: true, hasJobs: true },
            { name: "Woolworths Beecroft", lat: -33.7492214, lng: 151.0648387, type: "shop", emoji: "🛒", canEnter: true, isShop: true, shopType: "grocery" },
            { name: "Chargrill Charlie's", lat: -33.7492018, lng: 151.0653654, type: "restaurant", emoji: "🍗", canEnter: true, isRestaurant: true },
            { name: "Yo Sushi", lat: -33.7487725, lng: 151.0655586, type: "restaurant", emoji: "🍣", canEnter: true, isRestaurant: true },
            { name: "The Beehive Cafe", lat: -33.7502544, lng: 151.0652775, type: "cafe", emoji: "☕", canEnter: true, isRestaurant: true, hasJobs: true },
            { name: "Beecroft Village Shopping Centre", lat: -33.748883, lng: 151.06566, type: "shop", emoji: "🏪", canEnter: true, isShop: true },
            { name: "Beecroft Public School", lat: -33.7521663, lng: 151.0651659, type: "school", emoji: "🏫", canEnter: true, hasJobs: true },
            { name: "Bridey's Home", lat: -33.7449847, lng: 151.0613656, type: "home", emoji: "🏠", canEnter: true },
            { name: "My Home", lat: -33.7554966, lng: 151.0641447, type: "home", emoji: "🏡", canEnter: true, isPlayerHome: true },
            { name: "Beecroft Presbyterian Church", lat: -33.7532228, lng: 151.0645291, type: "church", emoji: "⛪", canEnter: true },
            { name: "Vintage Cellars", lat: -33.7529669, lng: 151.0652818, type: "shop", emoji: "🍷", canEnter: true, isShop: true, shopType: "liquor" },
            { name: "Tennis Court 1", lat: -33.7535342, lng: 151.0668467, type: "recreation", emoji: "🎾", canEnter: true },
            { name: "Tennis Court 2", lat: -33.7535406, lng: 151.0670187, type: "recreation", emoji: "🎾", canEnter: true },
            { name: "Beecroft Village Green", lat: -33.7528398, lng: 151.0660815, type: "park", emoji: "🌳" },
            { name: "The Verandah Beecroft", lat: -33.7519795, lng: 151.0636935, type: "cafe", emoji: "☕", canEnter: true, isRestaurant: true },
            { name: "Beecroft Community Centre", lat: -33.7514305, lng: 151.0654066, type: "community", emoji: "🏘️", canEnter: true },
            { name: "Fire Station", lat: -33.750685, lng: 151.065238, type: "firestation", emoji: "🚒", canEnter: true },
            { name: "Railway Station Gardens", lat: -33.7494224, lng: 151.0662239, type: "park", emoji: "🌸" },
            { name: "Love Pilates Beecroft", lat: -33.7491587, lng: 151.0659203, type: "gym", emoji: "🧘", canEnter: true, hasJobs: true },
            { name: "Beecroft Station Parking 2", lat: -33.7482448, lng: 151.0665765, type: "parking", emoji: "🅿️" },
            { name: "Beecroft Station Parking 1", lat: -33.750511, lng: 151.0664253, type: "parking", emoji: "🅿️" },
            { name: "Cheltenham Oval", lat: -33.7598939, lng: 151.069589, type: "park", emoji: "⚽" },
            { name: "Cheltenham Early Education", lat: -33.7580781, lng: 151.0743615, type: "school", emoji: "👶", canEnter: true },
            { name: "Cheltenham Girls' High School", lat: -33.7575657, lng: 151.0732986, type: "school", emoji: "🏫", canEnter: true, hasJobs: true },
            { name: "Cheltenham Station", lat: -33.7555854, lng: 151.078597, type: "station", emoji: "🚂", canEnter: true },
            { name: "Malton Road Playground", lat: -33.7510833, lng: 151.0788557, type: "playground", emoji: "🎪" },
            { name: "Christmas Tree", lat: -33.7493, lng: 151.0655, type: "christmas", emoji: "🎄", isChristmasTree: true },
            { name: "Beecroft Auto Sales", lat: -33.7505, lng: 151.0670, type: "car_dealer", emoji: "🚗", canEnter: true, isCarDealer: true }
        ];
    }

    /**
     * Convert GPS coordinates to game coordinates
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {{x: number, y: number}} Game coordinates
     */
    static gpsToGame(lat, lng) {
        // Calculate offset from origin
        const dLat = lat - this.ORIGIN_LAT;
        const dLng = lng - this.ORIGIN_LNG;

        // Convert to game coordinates
        // Note: Latitude increases going north but Y increases going down in game
        const x = this.GAME_ORIGIN_X + (dLng * this.SCALE_LNG);
        const y = this.GAME_ORIGIN_Y - (dLat * this.SCALE_LAT);

        return { x, y };
    }

    /**
     * Convert game coordinates to GPS
     * @param {number} x - Game X coordinate
     * @param {number} y - Game Y coordinate
     * @returns {{lat: number, lng: number}} GPS coordinates
     */
    static gameToGPS(x, y) {
        const dX = x - this.GAME_ORIGIN_X;
        const dY = y - this.GAME_ORIGIN_Y;

        const lng = this.ORIGIN_LNG + (dX / this.SCALE_LNG);
        const lat = this.ORIGIN_LAT - (dY / this.SCALE_LAT);

        return { lat, lng };
    }

    /**
     * Get all POIs with game coordinates
     * @returns {Array} POIs with x, y game coordinates added
     */
    static getPOIsWithGameCoords() {
        return this.getPOIs().map(poi => {
            const coords = this.gpsToGame(poi.lat, poi.lng);
            return {
                ...poi,
                x: coords.x,
                y: coords.y,
                interactable: poi.canEnter || poi.isShop || poi.isRestaurant || poi.isChristmasTree || poi.isCarDealer
            };
        });
    }
}

// ===== ROAD AND RAILWAY DATA =====
// Define roads and railway with GPS coordinates
class BeeccroftRoadData {
    /**
     * Get road segments as GPS coordinate pairs
     * Each road is an array of {lat, lng} points
     */
    static getRoads() {
        return [
            // Beecroft Road - Main north-south arterial
            {
                name: "Beecroft Road",
                type: "main",
                width: 5,
                points: [
                    { lat: -33.7400, lng: 151.0657 },
                    { lat: -33.7650, lng: 151.0657 }
                ]
            },
            // Hannah Street - East-west shopping strip
            {
                name: "Hannah Street",
                type: "main",
                width: 4,
                points: [
                    { lat: -33.7495, lng: 151.0600 },
                    { lat: -33.7495, lng: 151.0750 }
                ]
            },
            // Chapman Avenue
            {
                name: "Chapman Avenue",
                type: "secondary",
                width: 3,
                points: [
                    { lat: -33.7480, lng: 151.0620 },
                    { lat: -33.7480, lng: 151.0700 }
                ]
            },
            // Copeland Road
            {
                name: "Copeland Road",
                type: "secondary",
                width: 3,
                points: [
                    { lat: -33.7510, lng: 151.0630 },
                    { lat: -33.7510, lng: 151.0720 }
                ]
            },
            // Malton Road
            {
                name: "Malton Road",
                type: "secondary",
                width: 3,
                points: [
                    { lat: -33.7505, lng: 151.0657 },
                    { lat: -33.7505, lng: 151.0800 }
                ]
            }
        ];
    }

    /**
     * Get railway line as GPS coordinates
     */
    static getRailway() {
        return {
            name: "Northern Line",
            width: 4,
            points: [
                { lat: -33.7497, lng: 151.0500 },
                { lat: -33.7497, lng: 151.0657 }, // Beecroft Station
                { lat: -33.7555, lng: 151.0786 }, // Cheltenham Station
                { lat: -33.7600, lng: 151.0900 }
            ]
        };
    }

    /**
     * Convert road to game coordinates
     */
    static roadToGameCoords(road) {
        return {
            ...road,
            points: road.points.map(p => BeeccroftPOIData.gpsToGame(p.lat, p.lng))
        };
    }

    /**
     * Get all roads with game coordinates
     */
    static getRoadsWithGameCoords() {
        return this.getRoads().map(road => this.roadToGameCoords(road));
    }

    /**
     * Get railway with game coordinates
     */
    static getRailwayWithGameCoords() {
        return this.roadToGameCoords(this.getRailway());
    }
}

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
