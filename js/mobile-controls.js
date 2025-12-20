// Mobile Touch Controls for Beecroft Valley

class MobileControls {
    constructor(game) {
        this.game = game;
        this.joystickActive = false;
        this.joystickStartPos = { x: 0, y: 0 };
        this.joystickCurrentPos = { x: 0, y: 0 };

        this.setupTouchControls();
    }

    setupTouchControls() {
        // Joystick controls
        const joystickBase = document.querySelector('.joystick-base');
        const joystickStick = document.querySelector('.joystick-stick');

        if (!joystickBase || !joystickStick) return;

        joystickBase.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.joystickActive = true;
            const rect = joystickBase.getBoundingClientRect();
            const touch = e.touches[0];
            this.joystickStartPos = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            this.updateJoystick(touch.clientX, touch.clientY, joystickStick);
        });

        joystickBase.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.joystickActive) return;
            const touch = e.touches[0];
            this.updateJoystick(touch.clientX, touch.clientY, joystickStick);
        });

        const endJoystick = () => {
            this.joystickActive = false;
            joystickStick.style.transform = 'translate(-50%, -50%)';
            this.joystickCurrentPos = { x: 0, y: 0 };

            // Clear movement keys
            this.game.keys['ArrowUp'] = false;
            this.game.keys['ArrowDown'] = false;
            this.game.keys['ArrowLeft'] = false;
            this.game.keys['ArrowRight'] = false;
        };

        joystickBase.addEventListener('touchend', endJoystick);
        joystickBase.addEventListener('touchcancel', endJoystick);

        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.handleAction(action);
            });
        });
    }

    updateJoystick(touchX, touchY, stick) {
        const maxDistance = 35;
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
        const threshold = 15;

        this.game.keys['ArrowUp'] = finalY < -threshold;
        this.game.keys['ArrowDown'] = finalY > threshold;
        this.game.keys['ArrowLeft'] = finalX < -threshold;
        this.game.keys['ArrowRight'] = finalX > threshold;
    }

    handleAction(action) {
        switch (action) {
            case 'action':
                // Simulate spacebar
                if (this.game.currentMap === 'overworld') {
                    const building = this.game.getNearbyBuilding();
                    if (building && building.canEnter) {
                        this.game.enterBuilding(building);
                    } else {
                        this.game.talkToNearbyNPC();
                    }
                } else {
                    this.game.exitBuilding();
                }
                break;
            case 'tool':
                // Use tool
                this.game.useTool();
                break;
            case 'inventory':
                // Toggle inventory
                this.game.toggleInventory();
                break;
            case 'car':
                // Toggle car
                this.game.toggleCar();
                break;
        }
    }
}

// Initialize mobile controls when game is ready
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.game && window.innerWidth <= 768) {
            new MobileControls(window.game);
        }
    }, 100);
});
