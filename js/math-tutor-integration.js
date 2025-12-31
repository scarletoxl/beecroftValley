// js/math-tutor-integration.js
// Beecroft Valley - Math Tutor Integration
// Adds Buzzy's Number Garden near the school

(function() {
    'use strict';

    function initMathTutorIntegration() {
        if (!window.game) {
            setTimeout(initMathTutorIntegration, 100);
            return;
        }

        console.log('Math Tutor Integration: Initializing...');

        // Add the Math Tutor marker to the game's markers array
        // Position: Slightly offset from Beecroft Public School
        // Beecroft Public School is at approximately: lat: -33.7516, lng: 151.0658
        // Place the tutor nearby (e.g., a "garden" next to the school)
        const tutorPOI = {
            name: "Buzzy's Number Garden",
            lat: -33.7512,  // Slightly north of the school
            lng: 151.0662,  // Slightly east
            type: "math_tutor",
            emoji: "🐝",
            canEnter: true,
            isMathTutor: true,
            interactable: true
        };

        // Convert GPS to game coordinates using the BeeccroftPOIData class
        const coords = BeeccroftPOIData.gpsToGame(tutorPOI.lat, tutorPOI.lng);
        const marker = {
            ...tutorPOI,
            x: coords.x,
            y: coords.y,
            data: tutorPOI
        };

        // Add to game markers
        window.game.markers.push(marker);

        // Add marker style for math_tutor type
        if (typeof MARKER_STYLES !== 'undefined') {
            MARKER_STYLES.math_tutor = { color: '#FFD700', size: 30, animated: true };
        }

        // Store original interactWithMarker
        const originalInteractWithMarker = window.game.interactWithMarker.bind(window.game);

        // Override interactWithMarker to handle math tutor
        window.game.interactWithMarker = function(marker) {
            const b = marker.data;

            if (b.isMathTutor) {
                this.openMathTutor(marker);
                return;
            }

            originalInteractWithMarker(marker);
        };

        // Add method to open Math Tutor
        window.game.openMathTutor = function(marker) {
            this.showMessage("Welcome to Buzzy's Number Garden!");

            setTimeout(() => {
                if (window.mathTutor) {
                    window.mathTutor.open();
                } else {
                    this.showMessage('Math Tutor loading...');
                    setTimeout(() => {
                        if (window.mathTutor) {
                            window.mathTutor.open();
                        } else {
                            this.showMessage('Could not load Math Tutor.');
                        }
                    }, 500);
                }
            }, 300);
        };

        console.log('Math Tutor Integration: Ready! Visit the garden near school.');
    }

    window.addEventListener('load', () => setTimeout(initMathTutorIntegration, 500));
    document.addEventListener('DOMContentLoaded', () => setTimeout(initMathTutorIntegration, 600));
})();
