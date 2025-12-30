// Beecroft Valley - OC Practice Integration
// Connects OC Practice system to school POI interactions

(function() {
    'use strict';

    // Wait for game to be ready
    function initOCIntegration() {
        if (!window.game) {
            setTimeout(initOCIntegration, 100);
            return;
        }

        console.log('🏫 OC Practice Integration: Initializing...');

        // Store original interactWithMarker function
        const originalInteractWithMarker = window.game.interactWithMarker.bind(window.game);

        // Override interactWithMarker to handle schools
        window.game.interactWithMarker = function(marker) {
            const b = marker.data;
            
            // Check if this is a school
            if (b.isSchool || b.type === 'school') {
                this.openSchoolOCPractice(marker);
                return;
            }
            
            // Otherwise use original behavior
            originalInteractWithMarker(marker);
        };

        // Add method to open OC Practice for schools
        window.game.openSchoolOCPractice = function(marker) {
            const schoolName = marker.name;
            
            // Show welcome message
            this.showMessage(`📚 Welcome to ${schoolName}! Time to practice!`);
            
            // Small delay for dramatic effect, then open OC test
            setTimeout(() => {
                if (window.ocTest) {
                    window.ocTest.open();
                } else {
                    this.showMessage('⚠️ OC Practice system loading...');
                    // Try again in a moment
                    setTimeout(() => {
                        if (window.ocTest) {
                            window.ocTest.open();
                        } else {
                            this.showMessage('❌ Could not load OC Practice. Please try again.');
                        }
                    }, 500);
                }
            }, 300);
        };

        console.log('🏫 OC Practice Integration: Ready! Click on any school to start practicing.');
    }

    // Start initialization
    window.addEventListener('load', () => {
        setTimeout(initOCIntegration, 500);
    });

    // Also try on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initOCIntegration, 600);
    });
})();
