// Mobile Touch Controls for Beecroft Valley
// Enhanced mobile gameplay support

class MobileControls {
    constructor(game) {
        this.game = game;
        this.joystickActive = false;
        this.joystickStartPos = { x: 0, y: 0 };
        this.joystickCurrentPos = { x: 0, y: 0 };
        this.isMobile = this.detectMobile();

        if (this.isMobile) {
            this.setupTouchControls();
            this.preventDefaultTouchBehavior();
            console.log('Mobile controls initialized');
        }
    }

    detectMobile() {
        return (
            window.innerWidth <= 768 ||
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        );
    }

    preventDefaultTouchBehavior() {
        // Prevent page scrolling when touching game elements
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.closest('#mobile-controls') || e.target.closest('#gameCanvas')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevent double-tap zoom
        document.body.addEventListener('touchend', (e) => {
            if (e.target.closest('#mobile-controls')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupTouchControls() {
        // Joystick controls
        const joystickBase = document.querySelector('.joystick-base');
        const joystickStick = document.querySelector('.joystick-stick');

        if (!joystickBase || !joystickStick) {
            console.error('Mobile controls elements not found');
            return;
        }

        // Touch start on joystick
        joystickBase.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.joystickActive = true;
            const rect = joystickBase.getBoundingClientRect();
            const touch = e.touches[0];
            this.joystickStartPos = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            this.updateJoystick(touch.clientX, touch.clientY, joystickStick);
        }, { passive: false });

        // Touch move on joystick
        joystickBase.addEventListener('touchmove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!this.joystickActive) return;
            const touch = e.touches[0];
            this.updateJoystick(touch.clientX, touch.clientY, joystickStick);
        }, { passive: false });

        const endJoystick = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.joystickActive = false;
            joystickStick.style.transform = 'translate(-50%, -50%)';
            this.joystickCurrentPos = { x: 0, y: 0 };

            // Clear all movement keys
            this.game.keys['ArrowUp'] = false;
            this.game.keys['ArrowDown'] = false;
            this.game.keys['ArrowLeft'] = false;
            this.game.keys['ArrowRight'] = false;
            this.game.keys['w'] = false;
            this.game.keys['s'] = false;
            this.game.keys['a'] = false;
            this.game.keys['d'] = false;
        };

        joystickBase.addEventListener('touchend', endJoystick, { passive: false });
        joystickBase.addEventListener('touchcancel', endJoystick, { passive: false });

        // Also listen on document for when finger slides off joystick
        document.addEventListener('touchend', (e) => {
            if (this.joystickActive) {
                endJoystick(e);
            }
        }, { passive: false });

        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                btn.classList.add('active');
                const action = btn.dataset.action;
                this.handleAction(action);
            }, { passive: false });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                btn.classList.remove('active');
            }, { passive: false });
        });

        // Canvas touch support for direct interaction
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                // Single tap on canvas can trigger action/talk
                if (e.touches.length === 1) {
                    this.canvasTapTimer = setTimeout(() => {
                        this.handleAction('action');
                    }, 200);
                }
            }, { passive: false });

            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                // Cancel tap if moved
                if (this.canvasTapTimer) {
                    clearTimeout(this.canvasTapTimer);
                    this.canvasTapTimer = null;
                }
            }, { passive: false });

            canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
            }, { passive: false });
        }
    }

    updateJoystick(touchX, touchY, stick) {
        const maxDistance = 40;
        const dx = touchX - this.joystickStartPos.x;
        const dy = touchY - this.joystickStartPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let finalX = dx;
        let finalY = dy;

        if (distance > maxDistance) {
            finalX = (dx / distance) * maxDistance;
            finalY = (dy / distance) * maxDistance;
        }

        stick.style.transform = `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px))`;

        // Update game keys based on joystick position
        const threshold = 12; // Lower threshold for more responsive controls

        // Calculate normalized direction for diagonal movement
        const normalizedX = distance > threshold ? dx / distance : 0;
        const normalizedY = distance > threshold ? dy / distance : 0;

        // Set movement keys with consideration for diagonal movement
        this.game.keys['ArrowUp'] = normalizedY < -0.3;
        this.game.keys['ArrowDown'] = normalizedY > 0.3;
        this.game.keys['ArrowLeft'] = normalizedX < -0.3;
        this.game.keys['ArrowRight'] = normalizedX > 0.3;

        // Also set WASD keys for redundancy
        this.game.keys['w'] = this.game.keys['ArrowUp'];
        this.game.keys['s'] = this.game.keys['ArrowDown'];
        this.game.keys['a'] = this.game.keys['ArrowLeft'];
        this.game.keys['d'] = this.game.keys['ArrowRight'];
    }

    handleAction(action) {
        if (!this.game) return;

        switch (action) {
            case 'action':
                // Simulate spacebar - Talk to NPC or interact with marker
                if (this.game.currentMap === 'overworld') {
                    // First check for nearby NPCs
                    let foundNPC = false;
                    const talkDistance = 1.5;
                    for (let npc of this.game.npcs) {
                        const dx = this.game.player.x - npc.x;
                        const dy = this.game.player.y - npc.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < talkDistance) {
                            this.game.showNPCDialog(npc);
                            foundNPC = true;
                            break;
                        }
                    }

                    // Then check for nearby markers
                    if (!foundNPC) {
                        const marker = this.game.getNearestMarker();
                        if (marker) {
                            this.game.interactWithMarker(marker);
                        } else {
                            // Fallback to crop harvesting
                            this.game.talkToNearbyNPC();
                        }
                    }
                } else {
                    this.game.exitBuilding();
                }
                break;
            case 'tool':
                // Use current tool (E key)
                this.game.useTool();
                break;
            case 'inventory':
                // Toggle inventory (I key)
                this.game.toggleInventory();
                break;
            case 'car':
                // Toggle car (C key)
                this.game.toggleCar();
                break;
        }
    }
}

// Initialize mobile controls when game is ready
function initMobileControls() {
    if (window.game) {
        window.mobileControls = new MobileControls(window.game);
    } else {
        // Retry if game not yet loaded
        setTimeout(initMobileControls, 100);
    }
}

// Start initialization on both load events for reliability
window.addEventListener('load', () => {
    setTimeout(initMobileControls, 200);
});

// Also try on DOMContentLoaded as backup
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMobileControls, 500);
});
