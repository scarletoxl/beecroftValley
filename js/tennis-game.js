// Tennis Minigame for Beecroft Valley
// Full-featured tennis game with proper collision detection and victory celebrations

class TennisGame {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.score = { player: 0, opponent: 0 };
        this.ball = { x: 0, y: 0, vx: 0, vy: 0, prevX: 0, prevY: 0 };
        this.player = { x: 8, y: 15, width: 2.5, height: 0.6 };
        this.opponent = { x: 8, y: 5, width: 2.5, height: 0.6 };
        this.courtWidth = 16;
        this.courtHeight = 20;
        this.netY = 10;
        this.gameState = 'ready'; // ready, countdown, playing, won, lost, paused
        this.difficulty = 1;
        this.rally = 0;
        this.longestRally = 0;
        this.totalWins = 0;
        this.hitCooldown = 0;

        // Visual effects
        this.particles = [];
        this.celebrations = [];
        this.screenShake = 0;
        this.ballTrail = [];
        this.countdownTimer = 0;
        this.countdownNumber = 3;

        // Animation states
        this.victoryStars = [];
        this.medalScale = 0;
        this.medalRotation = 0;
        this.showMedal = false;

        // Sound simulation through visual feedback
        this.hitFlash = 0;
        this.scoreFlash = 0;

        // Modal animation
        this.modalOpacity = 0;
        this.gameAreaScale = 0;

        // Power-up indicator
        this.powerLevel = 0;
        this.isPowerHit = false;
    }

    start() {
        this.active = true;
        this.score = { player: 0, opponent: 0 };
        this.gameState = 'countdown';
        this.rally = 0;
        this.longestRally = 0;
        this.particles = [];
        this.celebrations = [];
        this.victoryStars = [];
        this.showMedal = false;
        this.modalOpacity = 0;
        this.gameAreaScale = 0;
        this.countdownTimer = 0;
        this.countdownNumber = 3;
        this.powerLevel = 0;
        this.startCountdown();
    }

    startCountdown() {
        this.gameState = 'countdown';
        this.countdownNumber = 3;
        this.countdownTimer = 0;
        this.resetPositions();
    }

    resetPositions() {
        this.player.x = this.courtWidth / 2;
        this.player.y = 15;
        this.opponent.x = this.courtWidth / 2;
        this.opponent.y = 5;
        this.ball.x = this.courtWidth / 2;
        this.ball.y = this.netY;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ballTrail = [];
    }

    serveBall() {
        // Start ball in center
        this.ball.x = this.courtWidth / 2;
        this.ball.y = this.netY;
        this.ball.prevX = this.ball.x;
        this.ball.prevY = this.ball.y;

        // Random serve direction with better angle
        const angle = (Math.random() - 0.5) * Math.PI / 4;
        // Slower ball at lower difficulties (difficulty 1-2 are much easier)
        const speed = 0.06 + this.difficulty * 0.025;
        this.ball.vx = Math.sin(angle) * speed;
        this.ball.vy = (Math.random() > 0.5 ? 1 : -1) * speed;

        this.gameState = 'playing';
        this.rally = 0;
        this.ballTrail = [];
        this.hitCooldown = 0;

        // Add serve effect
        this.addParticles(this.ball.x, this.ball.y, '#FFEB3B', 8);
    }

    addParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                life: 1,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }

    addHitEffect(x, y, power = false) {
        const color = power ? '#FF5722' : '#4CAF50';
        this.addParticles(x, y, color, power ? 15 : 8);
        this.hitFlash = 1;
        this.screenShake = power ? 8 : 4;
    }

    addScoreEffect(isPlayerScore) {
        const color = isPlayerScore ? '#4CAF50' : '#F44336';
        for (let i = 0; i < 20; i++) {
            this.celebrations.push({
                x: this.courtWidth / 2,
                y: isPlayerScore ? 3 : 17,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: 1.5,
                color: color,
                size: Math.random() * 6 + 3,
                type: 'confetti'
            });
        }
        this.scoreFlash = 1;
    }

    createVictoryStars() {
        this.victoryStars = [];
        for (let i = 0; i < 30; i++) {
            this.victoryStars.push({
                x: Math.random() * this.courtWidth,
                y: Math.random() * this.courtHeight,
                size: Math.random() * 8 + 4,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                opacity: 0,
                targetOpacity: Math.random() * 0.5 + 0.5,
                delay: Math.random() * 30
            });
        }
        this.showMedal = true;
        this.medalScale = 0;
        this.medalRotation = -Math.PI;
    }

    update(deltaTime) {
        if (!this.active) return;

        // Update modal animation
        this.modalOpacity = Math.min(1, this.modalOpacity + deltaTime * 3);
        this.gameAreaScale = Math.min(1, this.gameAreaScale + deltaTime * 4);

        // Update particles
        this.updateParticles(deltaTime);

        // Decrease effects
        this.hitFlash = Math.max(0, this.hitFlash - deltaTime * 5);
        this.scoreFlash = Math.max(0, this.scoreFlash - deltaTime * 3);
        this.screenShake = Math.max(0, this.screenShake - deltaTime * 30);
        this.hitCooldown = Math.max(0, this.hitCooldown - deltaTime);

        // Handle countdown
        if (this.gameState === 'countdown') {
            this.countdownTimer += deltaTime;
            if (this.countdownTimer >= 1) {
                this.countdownTimer = 0;
                this.countdownNumber--;
                if (this.countdownNumber <= 0) {
                    this.serveBall();
                }
            }
            return;
        }

        // Update victory animation
        if (this.gameState === 'won') {
            this.updateVictoryAnimation(deltaTime);
            return;
        }

        if (this.gameState !== 'playing') return;

        // Store previous position for collision detection
        this.ball.prevX = this.ball.x;
        this.ball.prevY = this.ball.y;

        // Move ball
        const speedMultiplier = 60;
        this.ball.x += this.ball.vx * deltaTime * speedMultiplier;
        this.ball.y += this.ball.vy * deltaTime * speedMultiplier;

        // Add to ball trail
        this.ballTrail.push({ x: this.ball.x, y: this.ball.y, life: 1 });
        if (this.ballTrail.length > 10) {
            this.ballTrail.shift();
        }
        this.ballTrail.forEach(t => t.life -= deltaTime * 3);

        // Bounce off side walls
        if (this.ball.x < 2 || this.ball.x > this.courtWidth - 2) {
            this.ball.vx *= -1;
            this.ball.x = Math.max(2, Math.min(this.courtWidth - 2, this.ball.x));
            this.addParticles(this.ball.x, this.ball.y, '#9E9E9E', 5);
        }

        // Check for paddle collisions using swept collision detection
        this.checkPaddleCollisions();

        // Check if ball goes past player (opponent scores)
        if (this.ball.y > this.courtHeight - 1) {
            this.score.opponent++;
            this.addScoreEffect(false);
            this.game.showMessage(`Opponent scores! ${this.score.player}-${this.score.opponent}`);
            if (this.rally > this.longestRally) this.longestRally = this.rally;
            this.rally = 0;
            this.checkWin();
        }

        // Check if ball goes past opponent (player scores)
        if (this.ball.y < 1) {
            this.score.player++;
            this.addScoreEffect(true);
            this.game.showMessage(`You score! ${this.score.player}-${this.score.opponent}`);
            if (this.rally > this.longestRally) this.longestRally = this.rally;
            this.rally = 0;
            this.checkWin();
        }

        // AI opponent movement
        this.updateOpponent(deltaTime);

        // Update power level
        if (this.gameState === 'playing') {
            this.powerLevel = Math.min(1, this.powerLevel + deltaTime * 0.3);
        }
    }

    checkPaddleCollisions() {
        // Player paddle collision (automatic - no button press needed!)
        if (this.ball.vy > 0 && this.hitCooldown <= 0) {
            if (this.checkPaddleHit(this.player, this.ball, 'player')) {
                const power = this.isPowerHit && this.powerLevel >= 0.8;
                this.hitBall(this.player.x, this.player.y, -1, power);
                this.rally++;
                this.addHitEffect(this.ball.x, this.ball.y, power);
                this.hitCooldown = 0.2;

                if (power) {
                    this.powerLevel = 0;
                    this.game.showMessage("⚡ POWER HIT! ⚡");
                } else if (this.rally > 3) {
                    this.game.showMessage(`${this.rally} hit rally! 🔥`);
                }
            }
        }

        // Opponent paddle collision (automatic)
        if (this.ball.vy < 0 && this.hitCooldown <= 0) {
            if (this.checkPaddleHit(this.opponent, this.ball, 'opponent')) {
                this.hitBall(this.opponent.x, this.opponent.y, 1, false);
                this.rally++;
                this.addHitEffect(this.ball.x, this.ball.y, false);
                this.hitCooldown = 0.2;
            }
        }
    }

    checkPaddleHit(paddle, ball, who) {
        // Expanded collision box for more reliable hits
        const paddleLeft = paddle.x - paddle.width / 2 - 0.3;
        const paddleRight = paddle.x + paddle.width / 2 + 0.3;
        const paddleTop = paddle.y - paddle.height / 2 - 0.5;
        const paddleBottom = paddle.y + paddle.height / 2 + 0.5;

        // Check if ball is within paddle bounds (with generous hit box)
        const ballInX = ball.x >= paddleLeft && ball.x <= paddleRight;

        // For player (bottom), check if ball crossed the paddle line
        if (who === 'player') {
            const ballNearPaddle = ball.y >= paddleTop - 0.5 && ball.y <= paddleBottom + 1;
            const ballCrossedPaddle = ball.prevY < paddle.y && ball.y >= paddle.y - 1;
            return ballInX && (ballNearPaddle || ballCrossedPaddle);
        }

        // For opponent (top), check if ball crossed the paddle line
        if (who === 'opponent') {
            const ballNearPaddle = ball.y >= paddleTop - 1 && ball.y <= paddleBottom + 0.5;
            const ballCrossedPaddle = ball.prevY > paddle.y && ball.y <= paddle.y + 1;
            return ballInX && (ballNearPaddle || ballCrossedPaddle);
        }

        return false;
    }

    updateOpponent(deltaTime) {
        // AI behavior varies significantly by difficulty
        let targetX = this.ball.x;

        // Only predict trajectory at higher difficulties
        if (this.difficulty >= 3 && this.ball.vy < 0) {
            const timeToReach = (this.opponent.y - this.ball.y) / Math.abs(this.ball.vy * 60);
            const predictionAccuracy = Math.min(0.8, (this.difficulty - 2) * 0.2); // 0 at diff 2, 0.8 at diff 6
            targetX = this.ball.x + this.ball.vx * 60 * timeToReach * predictionAccuracy;
        }

        const diff = targetX - this.opponent.x;

        // Much slower AI at low difficulties
        // Diff 1: 0.04, Diff 2: 0.065, Diff 3: 0.09, Diff 4: 0.115, Diff 5: 0.14
        const baseSpeed = 0.015 + this.difficulty * 0.025;
        const speed = baseSpeed * deltaTime * 60;

        // More imperfection at lower difficulties
        const imperfectionAmount = Math.max(0.2, 1.5 - this.difficulty * 0.25);
        const imperfection = Math.sin(Date.now() * 0.001) * imperfectionAmount;

        // At low difficulties, AI sometimes hesitates
        const hesitation = this.difficulty < 3 ? Math.random() < 0.15 : false;

        if (Math.abs(diff) > 0.3 && !hesitation) {
            this.opponent.x += Math.sign(diff + imperfection) * Math.min(Math.abs(diff), speed);
        }

        // Keep opponent in bounds
        this.opponent.x = Math.max(2 + this.opponent.width/2, Math.min(this.courtWidth - 2 - this.opponent.width/2, this.opponent.x));
    }

    handleInput(keys) {
        if (!this.active) return;

        // Allow exit anytime
        if (keys['Escape']) {
            // Handled in game.js
        }

        if (this.gameState !== 'playing' && this.gameState !== 'countdown') return;

        const baseSpeed = 0.2;
        const speed = baseSpeed;

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

        // Keep player in bounds (can move more of the court)
        this.player.x = Math.max(2 + this.player.width/2, Math.min(this.courtWidth - 2 - this.player.width/2, this.player.x));
        this.player.y = Math.max(this.netY + 1.5, Math.min(this.courtHeight - 1.5, this.player.y));

        // Power hit with space (hold to charge)
        this.isPowerHit = keys[' '];
    }

    hitBall(fromX, fromY, direction, isPowerHit = false) {
        // Calculate angle based on hit position
        const offsetX = this.ball.x - fromX;
        const baseAngle = offsetX * 0.4;

        // Speed increases with rally and difficulty
        // Lower base speed, scales more with difficulty
        let speed = 0.06 + Math.min(this.rally * 0.006, 0.03) + this.difficulty * 0.02;

        // Power hit increases speed significantly
        if (isPowerHit) {
            speed *= 1.4;
        }

        this.ball.vx = Math.sin(baseAngle) * speed * 1.2;
        this.ball.vy = direction * speed;

        // Ensure ball doesn't go too slow vertically (lower minimum at low difficulty)
        const minSpeed = 0.05 + this.difficulty * 0.01;
        if (Math.abs(this.ball.vy) < minSpeed) {
            this.ball.vy = direction * minSpeed;
        }
    }

    checkWin() {
        const winScore = 3;
        if (this.score.player >= winScore) {
            this.gameState = 'won';
            this.totalWins++;
            this.difficulty = Math.min(5, this.difficulty + 0.5);
            this.createVictoryStars();
            this.game.showMessage("🏆 You won the match!");
        } else if (this.score.opponent >= winScore) {
            this.gameState = 'lost';
            this.game.showMessage("Game Over! Press ESC to try again");
        } else {
            // Continue game after delay
            setTimeout(() => {
                if (this.active && (this.gameState === 'playing' || this.gameState === 'countdown')) {
                    this.startCountdown();
                }
            }, 1500);
            this.gameState = 'countdown';
            this.countdownNumber = 2; // Shorter countdown between points
            this.countdownTimer = 0;
        }
    }

    updateParticles(deltaTime) {
        // Update regular particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx * deltaTime * 60;
            p.y += p.vy * deltaTime * 60;
            p.life -= deltaTime * 2;
            p.vy += deltaTime * 0.1; // Gravity
            return p.life > 0;
        });

        // Update celebration particles
        this.celebrations = this.celebrations.filter(c => {
            c.x += c.vx * deltaTime * 60;
            c.y += c.vy * deltaTime * 60;
            c.life -= deltaTime;
            c.vy += deltaTime * 0.05;
            return c.life > 0;
        });
    }

    updateVictoryAnimation(deltaTime) {
        // Update stars
        this.victoryStars.forEach(star => {
            if (star.delay > 0) {
                star.delay -= deltaTime * 60;
            } else {
                star.opacity = Math.min(star.targetOpacity, star.opacity + deltaTime * 2);
                star.rotation += star.rotationSpeed;
            }
        });

        // Update medal
        if (this.showMedal) {
            this.medalScale = Math.min(1, this.medalScale + deltaTime * 3);
            this.medalRotation += deltaTime * 2;
            if (this.medalRotation > 0) {
                this.medalRotation = Math.sin(Date.now() * 0.002) * 0.1;
            }
        }

        // Spawn continuous celebration particles
        if (Math.random() < deltaTime * 10) {
            this.celebrations.push({
                x: Math.random() * this.courtWidth,
                y: -1,
                vx: (Math.random() - 0.5) * 0.1,
                vy: Math.random() * 0.1 + 0.05,
                life: 3,
                color: ['#FFD700', '#FFA500', '#FF6347', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 5)],
                size: Math.random() * 4 + 2,
                type: 'confetti'
            });
        }
    }

    render(ctx, interior) {
        if (!this.active) return;

        const canvas = this.game.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Apply screen shake
        const shakeX = (Math.random() - 0.5) * this.screenShake;
        const shakeY = (Math.random() - 0.5) * this.screenShake;
        ctx.save();
        ctx.translate(shakeX, shakeY);

        // Draw semi-transparent modal background
        ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * this.modalOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw game area with scale animation
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(this.gameAreaScale, this.gameAreaScale);
        ctx.translate(-centerX, -centerY);

        // Draw stylized court background
        this.renderCourt(ctx, canvas);

        // Draw ball trail
        this.renderBallTrail(ctx);

        // Draw ball
        this.renderBall(ctx);

        // Draw paddles
        this.renderPaddles(ctx);

        // Draw particles
        this.renderParticles(ctx);

        ctx.restore();

        // Draw UI overlay (not affected by game area scale)
        this.renderUI(ctx, canvas);

        // Draw countdown
        if (this.gameState === 'countdown') {
            this.renderCountdown(ctx, canvas);
        }

        // Draw game end screens
        if (this.gameState === 'won') {
            this.renderVictoryScreen(ctx, canvas);
        } else if (this.gameState === 'lost') {
            this.renderLossScreen(ctx, canvas);
        }

        ctx.restore();
    }

    renderCourt(ctx, canvas) {
        const courtLeft = 80;
        const courtRight = canvas.width - 80;
        const courtTop = 100;
        const courtBottom = canvas.height - 60;

        // Court background
        const gradient = ctx.createLinearGradient(courtLeft, courtTop, courtLeft, courtBottom);
        gradient.addColorStop(0, '#2d5016');
        gradient.addColorStop(0.5, '#3d6b1e');
        gradient.addColorStop(1, '#2d5016');
        ctx.fillStyle = gradient;
        ctx.fillRect(courtLeft, courtTop, courtRight - courtLeft, courtBottom - courtTop);

        // Court border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeRect(courtLeft, courtTop, courtRight - courtLeft, courtBottom - courtTop);

        // Center line (net)
        const netY = (courtTop + courtBottom) / 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(courtLeft, netY);
        ctx.lineTo(courtRight, netY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Service boxes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        const boxWidth = (courtRight - courtLeft) / 2;
        ctx.strokeRect(courtLeft, courtTop, boxWidth, (netY - courtTop) * 0.6);
        ctx.strokeRect(courtLeft + boxWidth, courtTop, boxWidth, (netY - courtTop) * 0.6);
        ctx.strokeRect(courtLeft, netY + (courtBottom - netY) * 0.4, boxWidth, (courtBottom - netY) * 0.6);
        ctx.strokeRect(courtLeft + boxWidth, netY + (courtBottom - netY) * 0.4, boxWidth, (courtBottom - netY) * 0.6);

        // Store court dimensions for rendering
        this.courtRenderBounds = { left: courtLeft, right: courtRight, top: courtTop, bottom: courtBottom };
    }

    gameToScreenX(gameX) {
        const bounds = this.courtRenderBounds;
        return bounds.left + (gameX / this.courtWidth) * (bounds.right - bounds.left);
    }

    gameToScreenY(gameY) {
        const bounds = this.courtRenderBounds;
        return bounds.top + (gameY / this.courtHeight) * (bounds.bottom - bounds.top);
    }

    renderBallTrail(ctx) {
        this.ballTrail.forEach((t, i) => {
            if (t.life > 0) {
                const x = this.gameToScreenX(t.x);
                const y = this.gameToScreenY(t.y);
                ctx.fillStyle = `rgba(255, 235, 59, ${t.life * 0.3})`;
                ctx.beginPath();
                ctx.arc(x, y, 6 * t.life, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    renderBall(ctx) {
        const ballX = this.gameToScreenX(this.ball.x);
        const ballY = this.gameToScreenY(this.ball.y);

        // Ball glow
        const glowGradient = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, 20);
        glowGradient.addColorStop(0, 'rgba(255, 235, 59, 0.6)');
        glowGradient.addColorStop(1, 'rgba(255, 235, 59, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 20, 0, Math.PI * 2);
        ctx.fill();

        // Ball shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(ballX + 3, ballY + 3, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ball
        const ballGradient = ctx.createRadialGradient(ballX - 3, ballY - 3, 0, ballX, ballY, 10);
        ballGradient.addColorStop(0, '#FFFF8D');
        ballGradient.addColorStop(0.5, '#FFEB3B');
        ballGradient.addColorStop(1, '#F9A825');
        ctx.fillStyle = ballGradient;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
        ctx.fill();

        // Ball highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(ballX - 3, ballY - 3, 4, 0, Math.PI * 2);
        ctx.fill();

        // Ball border
        ctx.strokeStyle = '#FBC02D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Hit flash effect
        if (this.hitFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.hitFlash * 0.5})`;
            ctx.beginPath();
            ctx.arc(ballX, ballY, 15 + (1 - this.hitFlash) * 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderPaddles(ctx) {
        // Player paddle
        const playerX = this.gameToScreenX(this.player.x);
        const playerY = this.gameToScreenY(this.player.y);
        const paddleWidth = 60;
        const paddleHeight = 14;

        // Paddle shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(playerX - paddleWidth/2 + 3, playerY - paddleHeight/2 + 3, paddleWidth, paddleHeight, 4);
        ctx.fill();

        // Player paddle gradient
        const playerGradient = ctx.createLinearGradient(playerX - paddleWidth/2, playerY - paddleHeight/2,
                                                        playerX - paddleWidth/2, playerY + paddleHeight/2);
        playerGradient.addColorStop(0, '#42A5F5');
        playerGradient.addColorStop(0.5, '#1976D2');
        playerGradient.addColorStop(1, '#0D47A1');
        ctx.fillStyle = playerGradient;
        ctx.beginPath();
        ctx.roundRect(playerX - paddleWidth/2, playerY - paddleHeight/2, paddleWidth, paddleHeight, 4);
        ctx.fill();

        // Paddle highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(playerX - paddleWidth/2 + 2, playerY - paddleHeight/2 + 2, paddleWidth - 4, 4, 2);
        ctx.fill();

        // Player paddle border
        ctx.strokeStyle = '#0D47A1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(playerX - paddleWidth/2, playerY - paddleHeight/2, paddleWidth, paddleHeight, 4);
        ctx.stroke();

        // Power indicator around player paddle
        if (this.powerLevel > 0.3 && this.isPowerHit) {
            ctx.strokeStyle = `rgba(255, 152, 0, ${this.powerLevel})`;
            ctx.lineWidth = 3 + this.powerLevel * 2;
            ctx.beginPath();
            ctx.roundRect(playerX - paddleWidth/2 - 4, playerY - paddleHeight/2 - 4, paddleWidth + 8, paddleHeight + 8, 6);
            ctx.stroke();
        }

        // Opponent paddle
        const opponentX = this.gameToScreenX(this.opponent.x);
        const opponentY = this.gameToScreenY(this.opponent.y);

        // Paddle shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(opponentX - paddleWidth/2 + 3, opponentY - paddleHeight/2 + 3, paddleWidth, paddleHeight, 4);
        ctx.fill();

        // Opponent paddle gradient
        const opponentGradient = ctx.createLinearGradient(opponentX - paddleWidth/2, opponentY - paddleHeight/2,
                                                          opponentX - paddleWidth/2, opponentY + paddleHeight/2);
        opponentGradient.addColorStop(0, '#EF5350');
        opponentGradient.addColorStop(0.5, '#D32F2F');
        opponentGradient.addColorStop(1, '#B71C1C');
        ctx.fillStyle = opponentGradient;
        ctx.beginPath();
        ctx.roundRect(opponentX - paddleWidth/2, opponentY - paddleHeight/2, paddleWidth, paddleHeight, 4);
        ctx.fill();

        // Paddle highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(opponentX - paddleWidth/2 + 2, opponentY - paddleHeight/2 + 2, paddleWidth - 4, 4, 2);
        ctx.fill();

        // Opponent paddle border
        ctx.strokeStyle = '#B71C1C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(opponentX - paddleWidth/2, opponentY - paddleHeight/2, paddleWidth, paddleHeight, 4);
        ctx.stroke();
    }

    renderParticles(ctx) {
        // Regular particles
        this.particles.forEach(p => {
            const x = this.gameToScreenX(p.x);
            const y = this.gameToScreenY(p.y);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Celebration particles
        this.celebrations.forEach(c => {
            const x = this.gameToScreenX(c.x);
            const y = this.gameToScreenY(c.y);
            ctx.fillStyle = c.color;
            ctx.globalAlpha = Math.min(1, c.life);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(c.life * 5);
            ctx.fillRect(-c.size/2, -c.size/2, c.size, c.size);
            ctx.restore();
        });
        ctx.globalAlpha = 1;
    }

    renderUI(ctx, canvas) {
        const centerX = canvas.width / 2;

        // Score panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.roundRect(centerX - 120, 10, 240, 70, 10);
        ctx.fill();

        // Score panel border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(centerX - 120, 10, 240, 70, 10);
        ctx.stroke();

        // Score
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Score flash effect
        if (this.scoreFlash > 0) {
            ctx.fillStyle = `rgb(${255}, ${255 - this.scoreFlash * 100}, ${255 - this.scoreFlash * 100})`;
        }

        ctx.fillText(`${this.score.player} - ${this.score.opponent}`, centerX, 40);

        // Labels
        ctx.font = '12px Arial';
        ctx.fillStyle = '#4CAF50';
        ctx.fillText('YOU', centerX - 50, 60);
        ctx.fillStyle = '#F44336';
        ctx.fillText('CPU', centerX + 50, 60);

        // Rally counter
        if (this.rally > 2) {
            ctx.fillStyle = '#FF9800';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`Rally: ${this.rally}`, centerX, 95);
        }

        // Difficulty indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Difficulty: ${'⭐'.repeat(Math.ceil(this.difficulty))}`, 20, 30);

        // Controls hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WASD/Arrows: Move | SPACE: Power Hit | ESC: Exit', centerX, canvas.height - 15);

        // Power bar (when holding space)
        if (this.isPowerHit && this.powerLevel > 0) {
            const barWidth = 100;
            const barHeight = 10;
            const barX = centerX - barWidth/2;
            const barY = canvas.height - 45;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

            const powerGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
            powerGradient.addColorStop(0, '#4CAF50');
            powerGradient.addColorStop(0.5, '#FFEB3B');
            powerGradient.addColorStop(1, '#FF5722');
            ctx.fillStyle = powerGradient;
            ctx.fillRect(barX, barY, barWidth * this.powerLevel, barHeight);

            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('POWER', centerX, barY - 5);
        }

        ctx.textAlign = 'left';
    }

    renderCountdown(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Pulsing countdown number
        const scale = 1 + Math.sin(this.countdownTimer * Math.PI) * 0.2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        // Number shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.countdownNumber > 0 ? this.countdownNumber.toString() : 'GO!', 4, 4);

        // Number
        ctx.fillStyle = this.countdownNumber > 0 ? '#FFFFFF' : '#4CAF50';
        ctx.fillText(this.countdownNumber > 0 ? this.countdownNumber.toString() : 'GO!', 0, 0);

        ctx.restore();

        // "Get Ready" text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Get Ready!', centerX, centerY - 80);
        ctx.textAlign = 'left';
    }

    renderVictoryScreen(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Render stars in background
        this.victoryStars.forEach(star => {
            if (star.opacity > 0) {
                const x = this.gameToScreenX(star.x);
                const y = this.gameToScreenY(star.y);
                this.drawStar(ctx, x, y, star.size, star.rotation, star.opacity);
            }
        });

        // Victory panel
        const panelWidth = 400;
        const panelHeight = 300;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.beginPath();
        ctx.roundRect(centerX - panelWidth/2, centerY - panelHeight/2, panelWidth, panelHeight, 20);
        ctx.fill();

        // Golden border
        const borderGradient = ctx.createLinearGradient(centerX - panelWidth/2, centerY - panelHeight/2,
                                                        centerX + panelWidth/2, centerY + panelHeight/2);
        borderGradient.addColorStop(0, '#FFD700');
        borderGradient.addColorStop(0.5, '#FFA500');
        borderGradient.addColorStop(1, '#FFD700');
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(centerX - panelWidth/2, centerY - panelHeight/2, panelWidth, panelHeight, 20);
        ctx.stroke();

        // Medal
        if (this.showMedal) {
            ctx.save();
            ctx.translate(centerX, centerY - 60);
            ctx.scale(this.medalScale, this.medalScale);
            ctx.rotate(this.medalRotation);

            // Medal circle
            const medalGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
            medalGradient.addColorStop(0, '#FFE082');
            medalGradient.addColorStop(0.5, '#FFD700');
            medalGradient.addColorStop(1, '#FFA000');
            ctx.fillStyle = medalGradient;
            ctx.beginPath();
            ctx.arc(0, 0, 50, 0, Math.PI * 2);
            ctx.fill();

            // Medal border
            ctx.strokeStyle = '#FF8F00';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 50, 0, Math.PI * 2);
            ctx.stroke();

            // Star on medal
            this.drawStar(ctx, 0, 0, 30, 0, 1, '#FF6F00');

            // Medal shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.ellipse(-15, -15, 20, 10, -Math.PI/4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // Victory text
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏆 VICTORY! 🏆', centerX, centerY + 30);

        // Stats
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Arial';
        ctx.fillText(`Final Score: ${this.score.player} - ${this.score.opponent}`, centerX, centerY + 70);
        ctx.fillText(`Longest Rally: ${this.longestRally}`, centerX, centerY + 95);
        ctx.fillText(`Total Wins: ${this.totalWins}`, centerX, centerY + 120);

        // Exit instruction
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px Arial';
        ctx.fillText('Press ESC to continue', centerX, centerY + 155);

        ctx.textAlign = 'left';
    }

    renderLossScreen(ctx, canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Loss panel
        const panelWidth = 350;
        const panelHeight = 220;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.beginPath();
        ctx.roundRect(centerX - panelWidth/2, centerY - panelHeight/2, panelWidth, panelHeight, 20);
        ctx.fill();

        // Red border
        ctx.strokeStyle = '#F44336';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(centerX - panelWidth/2, centerY - panelHeight/2, panelWidth, panelHeight, 20);
        ctx.stroke();

        // Game Over text
        ctx.fillStyle = '#F44336';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', centerX, centerY - 40);

        // Stats
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Arial';
        ctx.fillText(`Final Score: ${this.score.player} - ${this.score.opponent}`, centerX, centerY + 10);
        ctx.fillText(`Longest Rally: ${this.longestRally}`, centerX, centerY + 40);

        // Encouragement
        ctx.fillStyle = '#FF9800';
        ctx.font = '16px Arial';
        ctx.fillText('Keep practicing! You\'ll get them next time!', centerX, centerY + 75);

        // Exit instruction
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px Arial';
        ctx.fillText('Press ESC to try again', centerX, centerY + 105);

        ctx.textAlign = 'left';
    }

    drawStar(ctx, x, y, size, rotation, opacity, fillColor = '#FFD700') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.globalAlpha = opacity;

        ctx.fillStyle = fillColor;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
            const px = Math.cos(angle) * size;
            const py = Math.sin(angle) * size;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    stop() {
        this.active = false;
        this.gameState = 'ready';
        this.particles = [];
        this.celebrations = [];
        this.victoryStars = [];
    }
}
