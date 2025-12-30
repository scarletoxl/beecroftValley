// Tennis Minigame for Beecroft Valley
// Simple tennis game where you hit a ball back and forth

class TennisGame {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.score = { player: 0, opponent: 0 };
        this.ball = { x: 0, y: 0, vx: 0, vy: 0 };
        this.player = { x: 8, y: 15 };
        this.opponent = { x: 8, y: 5 };
        this.courtWidth = 16;
        this.courtHeight = 20;
        this.netY = 10;
        this.gameState = 'ready'; // ready, playing, won, lost
        this.difficulty = 1;
        this.rally = 0;
    }

    start() {
        this.active = true;
        this.score = { player: 0, opponent: 0 };
        this.gameState = 'ready';
        this.rally = 0;
        this.serveBall();
        this.showInstructions();
    }

    showInstructions() {
        this.game.showMessage("🎾 Tennis Game! Use WASD to move, SPACE to hit. First to 3 points wins!");
    }

    serveBall() {
        // Start ball in center
        this.ball.x = this.courtWidth / 2;
        this.ball.y = this.netY;

        // Random serve direction
        const angle = (Math.random() - 0.5) * Math.PI / 3;
        const speed = 0.15;
        this.ball.vx = Math.sin(angle) * speed;
        this.ball.vy = (Math.random() > 0.5 ? 1 : -1) * speed;

        this.gameState = 'playing';
        this.rally = 0;
    }

    update(deltaTime) {
        if (!this.active || (this.gameState !== 'playing' && this.gameState !== 'serving')) return;
        if (this.gameState === 'serving') return; // Wait during serve delay

        // Move ball
        this.ball.x += this.ball.vx * deltaTime * 60;
        this.ball.y += this.ball.vy * deltaTime * 60;

        // Clamp ball to safe bounds (prevent any clipping)
        this.ball.x = Math.max(1, Math.min(this.courtWidth - 1, this.ball.x));
        this.ball.y = Math.max(1, Math.min(this.courtHeight - 1, this.ball.y));

        // Bounce off side walls
        if (this.ball.x < 2 || this.ball.x > this.courtWidth - 2) {
            this.ball.vx *= -1;
            this.ball.x = Math.max(2, Math.min(this.courtWidth - 2, this.ball.x));
        }

        // Check if ball goes past player (opponent scores)
        if (this.ball.y > this.courtHeight - 2) {
            this.score.opponent++;
            this.rally = 0;
            // Stop ball immediately
            this.ball.vx = 0;
            this.ball.vy = 0;
            this.ball.x = this.courtWidth / 2;
            this.ball.y = this.netY;
            this.gameState = 'serving'; // Pause game state
            this.game.showMessage(`Opponent scores! ${this.score.player}-${this.score.opponent}`);
            this.checkWin();
            return; // Stop processing this frame
        }

        // Check if ball goes past opponent (player scores)
        if (this.ball.y < 2) {
            this.score.player++;
            this.rally = 0;
            // Stop ball immediately
            this.ball.vx = 0;
            this.ball.vy = 0;
            this.ball.x = this.courtWidth / 2;
            this.ball.y = this.netY;
            this.gameState = 'serving'; // Pause game state
            this.game.showMessage(`You score! ${this.score.player}-${this.score.opponent}`);
            this.checkWin();
            return; // Stop processing this frame
        }

        // AI opponent movement
        this.updateOpponent();

        // Check for opponent hit
        if (this.ball.y < 6 && this.ball.y > 4) {
            const dx = Math.abs(this.ball.x - this.opponent.x);
            if (dx < 1.5) {
                this.hitBall(this.opponent.x, this.opponent.y, 1);
                this.rally++;
            }
        }
    }

    updateOpponent() {
        // AI follows ball with some delay
        const targetX = this.ball.x;
        const diff = targetX - this.opponent.x;
        const speed = 0.08 * (1 + this.difficulty * 0.3);

        if (Math.abs(diff) > 0.5) {
            this.opponent.x += Math.sign(diff) * speed;
        }

        // Keep opponent in bounds
        this.opponent.x = Math.max(2, Math.min(this.courtWidth - 2, this.opponent.x));
    }

    handleInput(keys) {
        if (!this.active || this.gameState !== 'playing') return;

        const speed = 0.15;

        // Move player
        if (keys['a'] || keys['ArrowLeft']) {
            this.player.x -= speed;
        }
        if (keys['d'] || keys['ArrowRight']) {
            this.player.x += speed;
        }
        if (keys['w'] || keys['ArrowUp']) {
            this.player.y -= speed * 0.5;
        }
        if (keys['s'] || keys['ArrowDown']) {
            this.player.y += speed * 0.5;
        }

        // Keep player in bounds
        this.player.x = Math.max(2, Math.min(this.courtWidth - 2, this.player.x));
        this.player.y = Math.max(this.netY + 2, Math.min(this.courtHeight - 2, this.player.y));

        // Hit ball with space
        if (keys[' ']) {
            this.tryHit();
        }
    }

    tryHit() {
        const dx = Math.abs(this.ball.x - this.player.x);
        const dy = Math.abs(this.ball.y - this.player.y);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 1.5 && this.ball.vy > 0) {
            this.hitBall(this.player.x, this.player.y, -1);
            this.rally++;

            if (this.rally > 3) {
                this.game.showMessage(`${this.rally} hit rally! 🔥`);
            }
        }
    }

    hitBall(fromX, fromY, direction) {
        // Calculate angle based on hit position
        const offsetX = this.ball.x - fromX;
        const baseAngle = offsetX * 0.3; // Angle based on where you hit it

        const speed = 0.15 + Math.min(this.rally * 0.01, 0.05);
        this.ball.vx = Math.sin(baseAngle) * speed;
        this.ball.vy = direction * speed;
    }

    checkWin() {
        if (this.score.player >= 3) {
            this.gameState = 'won';
            this.game.showMessage("🏆 You won the match! Press ESC to exit.");
            this.difficulty++;
        } else if (this.score.opponent >= 3) {
            this.gameState = 'lost';
            this.game.showMessage("😞 You lost. Press ESC to try again!");
        } else {
            setTimeout(() => this.serveBall(), 1500);
        }
    }

    render(ctx, interior) {
        if (!this.active) return;

        // Render ball
        const ballScreen = this.game.mapSystem.gameToScreen(
            this.ball.x, this.ball.y,
            this.game.camera.x, this.game.camera.y,
            this.game.canvas.width, this.game.canvas.height
        );

        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(ballScreen.x, ballScreen.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FBC02D';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Render player paddle
        const playerScreen = this.game.mapSystem.gameToScreen(
            this.player.x, this.player.y,
            this.game.camera.x, this.game.camera.y,
            this.game.canvas.width, this.game.canvas.height
        );

        ctx.fillStyle = '#1976D2';
        ctx.fillRect(playerScreen.x - 15, playerScreen.y - 5, 30, 10);
        ctx.strokeStyle = '#0D47A1';
        ctx.lineWidth = 2;
        ctx.strokeRect(playerScreen.x - 15, playerScreen.y - 5, 30, 10);

        // Render opponent paddle
        const opponentScreen = this.game.mapSystem.gameToScreen(
            this.opponent.x, this.opponent.y,
            this.game.camera.x, this.game.camera.y,
            this.game.canvas.width, this.game.canvas.height
        );

        ctx.fillStyle = '#D32F2F';
        ctx.fillRect(opponentScreen.x - 15, opponentScreen.y - 5, 30, 10);
        ctx.strokeStyle = '#B71C1C';
        ctx.lineWidth = 2;
        ctx.strokeRect(opponentScreen.x - 15, opponentScreen.y - 5, 30, 10);

        // Render score
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.score.player} - ${this.score.opponent}`, this.game.canvas.width / 2, 40);

        // Render rally counter
        if (this.rally > 3) {
            ctx.fillStyle = '#FF6F00';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(`${this.rally} hit rally!`, this.game.canvas.width / 2, 70);
        }

        // Render game state messages
        if (this.gameState === 'won') {
            ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
            ctx.fillRect(this.game.canvas.width / 2 - 150, this.game.canvas.height / 2 - 50, 300, 100);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 32px Arial';
            ctx.fillText('🏆 YOU WON! 🏆', this.game.canvas.width / 2, this.game.canvas.height / 2);
            ctx.font = '18px Arial';
            ctx.fillText('Press ESC to exit', this.game.canvas.width / 2, this.game.canvas.height / 2 + 30);
        } else if (this.gameState === 'lost') {
            ctx.fillStyle = 'rgba(244, 67, 54, 0.9)';
            ctx.fillRect(this.game.canvas.width / 2 - 150, this.game.canvas.height / 2 - 50, 300, 100);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 32px Arial';
            ctx.fillText('GAME OVER', this.game.canvas.width / 2, this.game.canvas.height / 2);
            ctx.font = '18px Arial';
            ctx.fillText('Press ESC to exit', this.game.canvas.width / 2, this.game.canvas.height / 2 + 30);
        }

        ctx.textAlign = 'left';
    }

    stop() {
        this.active = false;
        this.gameState = 'ready';
    }
}
