// Mobile Touch Controls for Beecroft Valley
// Enhanced mobile gameplay support with context-aware interactions

class MobileControls {
    constructor(game) {
        this.game = game;
        this.joystickActive = false;
        this.joystickStartPos = { x: 0, y: 0 };
        this.joystickCurrentPos = { x: 0, y: 0 };
        this.isMobile = this.detectMobile();
        this.lastContext = null; // Track what action button will do
        this.contextUpdateInterval = null;

        if (this.isMobile) {
            this.setupTouchControls();
            this.preventDefaultTouchBehavior();
            this.startContextUpdates();
            console.log('Mobile controls initialized');
        }
    }

    detectMobile() {
        // Improved detection: include tablets, touch screens, and wider breakpoint
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
        const isSmallScreen = window.innerWidth <= 1024; // Include tablets

        // Show mobile controls if: has touch AND (small screen OR mobile user agent)
        return hasTouch && (isSmallScreen || isMobileUA);
    }

    // Check if we're on a touch device (for showing/hiding prompts)
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
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

    // Start periodic updates to the action button based on context
    startContextUpdates() {
        // Update every 200ms to keep button context current
        this.contextUpdateInterval = setInterval(() => {
            this.updateActionButtonContext();
        }, 200);
    }

    // Determine what the action button will do based on current game state
    getInteractionContext() {
        if (!this.game || !this.game.player) return { type: 'none', label: '💬', hint: '' };

        const INTERACTION_DISTANCE = 2.5; // Unified interaction distance

        if (this.game.currentMap === 'overworld') {
            // Check for nearby NPCs first (highest priority)
            for (let npc of this.game.npcs || []) {
                const dx = this.game.player.x - npc.x;
                const dy = this.game.player.y - npc.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < INTERACTION_DISTANCE) {
                    return { type: 'npc', label: '💬', hint: `Talk to ${npc.name}`, target: npc };
                }
            }

            // Check for nearby markers (buildings, POIs)
            const marker = this.game.getNearestMarker();
            if (marker) {
                const dx = this.game.player.x - marker.x;
                const dy = this.game.player.y - marker.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < INTERACTION_DISTANCE) {
                    const b = marker.data || marker;
                    if (b.isChristmasTree) {
                        return { type: 'christmas', label: '🎄', hint: 'Toggle Music', target: marker };
                    } else if (b.isRestaurant) {
                        return { type: 'restaurant', label: '🍽️', hint: `Enter ${marker.name}`, target: marker };
                    } else if (b.isShop) {
                        return { type: 'shop', label: '🛒', hint: `Shop at ${marker.name}`, target: marker };
                    } else if (b.isCarDealer) {
                        return { type: 'car_dealer', label: '🚗', hint: 'Buy a Car', target: marker };
                    } else if (b.type === 'school') {
                        return { type: 'school', label: '🏫', hint: `Enter ${marker.name}`, target: marker };
                    } else if (b.canEnter) {
                        return { type: 'enter', label: '🚪', hint: `Enter ${marker.name}`, target: marker };
                    } else {
                        return { type: 'view', label: '👁️', hint: marker.name, target: marker };
                    }
                }
            }

            // Check for harvestable crops
            const tileX = Math.floor(this.game.player.x);
            const tileY = Math.floor(this.game.player.y);
            const crop = (this.game.crops || []).find(c => c.x === tileX && c.y === tileY && c.stage >= 4);
            if (crop) {
                return { type: 'harvest', label: '🌾', hint: 'Harvest Crop', target: crop };
            }

            return { type: 'none', label: '💬', hint: '' };
        } else {
            // Inside building
            const interior = this.game.interiorMaps ? this.game.interiorMaps[this.game.currentMap] : null;
            if (!interior) {
                return { type: 'exit', label: '🚪', hint: 'Exit Building' };
            }

            // Check for interior NPCs
            if (interior.npcs) {
                for (let npc of interior.npcs) {
                    const dx = this.game.player.x - npc.x;
                    const dy = this.game.player.y - npc.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < INTERACTION_DISTANCE) {
                        if (npc.role === 'tennis coach' && this.game.currentMap.includes('Tennis Court')) {
                            return { type: 'tennis', label: '🎾', hint: 'Play Tennis', target: npc };
                        }
                        return { type: 'npc', label: '💬', hint: `Talk to ${npc.name}`, target: npc };
                    }
                }
            }

            // Check for interactive furniture
            if (interior.furniture) {
                for (let furniture of interior.furniture) {
                    if (furniture.interactive) {
                        const dx = this.game.player.x - furniture.x;
                        const dy = this.game.player.y - furniture.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < 2) {
                            const label = furniture.emoji || '🪑';
                            return { type: 'furniture', label: label, hint: `Use ${furniture.name || 'furniture'}`, target: furniture };
                        }
                    }
                }
            }

            // Check for exit
            if (interior.exitX !== undefined && interior.exitY !== undefined) {
                const exitDist = Math.sqrt(
                    Math.pow(this.game.player.x - interior.exitX, 2) +
                    Math.pow(this.game.player.y - interior.exitY, 2)
                );
                if (exitDist < 2) {
                    return { type: 'exit', label: '🚪', hint: 'Exit Building' };
                }
            }

            return { type: 'none', label: '💬', hint: '' };
        }
    }

    // Update the action button to show context-aware icon and hint
    updateActionButtonContext() {
        const actionBtn = document.querySelector('.action-btn[data-action="action"]');
        if (!actionBtn) return;

        const context = this.getInteractionContext();

        // Only update if context changed
        if (this.lastContext && this.lastContext.type === context.type &&
            this.lastContext.hint === context.hint) {
            return;
        }
        this.lastContext = context;

        // Update button icon
        actionBtn.textContent = context.label;

        // Update or create hint tooltip
        let hintEl = actionBtn.querySelector('.action-hint');
        if (context.hint) {
            if (!hintEl) {
                hintEl = document.createElement('div');
                hintEl.className = 'action-hint';
                actionBtn.appendChild(hintEl);
            }
            hintEl.textContent = context.hint;
            hintEl.style.display = 'block';
            actionBtn.classList.add('has-context');
        } else {
            if (hintEl) hintEl.style.display = 'none';
            actionBtn.classList.remove('has-context');
        }
    }

    handleAction(action) {
        if (!this.game) return;

        switch (action) {
            case 'action':
                // Context-aware action - mirrors keyboard spacebar behavior exactly
                if (this.game.currentMap === 'overworld') {
                    // Check for sitting first
                    if (this.game.player.sitting) {
                        this.game.standUp();
                        return;
                    }

                    // Check for nearby NPCs (priority 1)
                    const TALK_DISTANCE = 2.5;
                    let foundNPC = false;
                    for (let npc of this.game.npcs || []) {
                        const dx = this.game.player.x - npc.x;
                        const dy = this.game.player.y - npc.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < TALK_DISTANCE) {
                            this.game.showNPCDialog(npc);
                            foundNPC = true;
                            break;
                        }
                    }

                    // Check for nearby markers (priority 2)
                    if (!foundNPC) {
                        const marker = this.game.getNearestMarker();
                        if (marker) {
                            // Verify we're close enough to interact
                            const dx = this.game.player.x - marker.x;
                            const dy = this.game.player.y - marker.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance < 3) { // Closer distance for actual interaction
                                this.game.interactWithMarker(marker);
                            } else {
                                // Show hint to get closer
                                this.game.showMessage(`Move closer to ${marker.name}`);
                            }
                        } else {
                            // Fallback to crop harvesting / building check
                            this.game.talkToNearbyNPC();
                        }
                    }
                } else {
                    // Inside building - mirror keyboard behavior exactly
                    const interior = this.game.interiorMaps ? this.game.interiorMaps[this.game.currentMap] : null;

                    if (interior && interior.npcs) {
                        // Check for interior NPCs
                        let foundInteriorNPC = false;
                        const talkDistance = 2.5;

                        for (let npc of interior.npcs) {
                            const dx = this.game.player.x - npc.x;
                            const dy = this.game.player.y - npc.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance < talkDistance) {
                                // Handle tennis coach specially
                                if (npc.role === 'tennis coach' && this.game.currentMap.includes('Tennis Court')) {
                                    if (!this.game.tennisGame.active) {
                                        this.game.tennisGame.start();
                                    }
                                } else {
                                    this.game.showNPCDialog(npc, this.game.currentMap);
                                }
                                foundInteriorNPC = true;
                                break;
                            }
                        }

                        // Check for interactive furniture if no NPC found
                        if (!foundInteriorNPC && interior.furniture) {
                            for (let furniture of interior.furniture) {
                                if (furniture.interactive) {
                                    const dx = this.game.player.x - furniture.x;
                                    const dy = this.game.player.y - furniture.y;
                                    const distance = Math.sqrt(dx * dx + dy * dy);
                                    if (distance < 2) {
                                        this.game.interactWithFurniture(furniture);
                                        foundInteriorNPC = true;
                                        break;
                                    }
                                }
                            }
                        }

                        // Check if at exit - only exit if near the exit point
                        if (!foundInteriorNPC && interior.exitX !== undefined) {
                            const exitDist = Math.sqrt(
                                Math.pow(this.game.player.x - interior.exitX, 2) +
                                Math.pow(this.game.player.y - interior.exitY, 2)
                            );
                            if (exitDist < 2) {
                                this.game.exitBuilding();
                            }
                        }
                    } else {
                        // No interior data, just exit
                        this.game.exitBuilding();
                    }
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

    // Clean up interval when controls are destroyed
    destroy() {
        if (this.contextUpdateInterval) {
            clearInterval(this.contextUpdateInterval);
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
