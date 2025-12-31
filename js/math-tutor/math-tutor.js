// js/math-tutor/math-tutor.js
// Main Math Tutor module - orchestrates all components

class MathTutor {
    constructor() {
        this.isOpen = false;
        this.studentName = 'Wei Wei'; // Default, could be customised

        // Components (initialized when UI opens)
        this.grid = null;
        this.adaptive = null;
        this.api = null;

        // Session state
        this.currentProblem = null;
        this.problemStartTime = null;
        this.sessionPhase = 'greeting'; // greeting, warmup, calibration, practice, challenge, summary
        this.problemsInPhase = 0;

        // Progress (persisted to localStorage)
        this.progress = this.loadProgress();
        this.stats = this.loadStats();

        // Session rewards
        this.sessionGold = 0;
        this.sessionMedals = [];

        // UI elements (created dynamically)
        this.modal = null;
        this.elements = {};

        // Create UI
        this.createUI();
    }

    // === PERSISTENCE ===
    loadProgress() {
        try {
            const saved = localStorage.getItem('mathTutor_progress');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    }

    saveProgress() {
        localStorage.setItem('mathTutor_progress', JSON.stringify(this.progress));
    }

    loadStats() {
        try {
            const saved = localStorage.getItem('mathTutor_stats');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    }

    saveStats() {
        localStorage.setItem('mathTutor_stats', JSON.stringify(this.stats));
    }

    // === UI CREATION ===
    createUI() {
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.id = 'math-tutor-modal';
        this.modal.className = 'math-tutor-modal';
        this.modal.style.display = 'none';

        this.modal.innerHTML = `
            <div class="math-tutor-container">
                <header class="math-tutor-header">
                    <div class="header-left">
                        <span class="buzzy-icon">🐝</span>
                        <h2>Buzzy's Number Garden</h2>
                    </div>
                    <div class="header-right">
                        <span class="session-gold">💰 <span id="mt-session-gold">0</span></span>
                        <button class="mt-btn-icon" id="mt-skill-tree-btn" title="Skill Tree">🌳</button>
                        <button class="mt-btn-icon" id="mt-close-btn" title="Close">✕</button>
                    </div>
                </header>

                <main class="math-tutor-main">
                    <div class="mt-left-panel">
                        <div class="buzzy-dialogue">
                            <div class="buzzy-avatar">🐝</div>
                            <div class="buzzy-bubble" id="mt-dialogue">
                                Welcome to the Number Garden!
                            </div>
                        </div>

                        <div class="mt-problem-area" id="mt-problem-area">
                            <div class="mt-question" id="mt-question"></div>
                            <div class="mt-input-area">
                                <input type="number" id="mt-answer-input" class="mt-answer-input" placeholder="?" autocomplete="off">
                                <button class="mt-btn mt-btn-primary" id="mt-submit-btn">Check!</button>
                            </div>
                            <div class="mt-hint-area">
                                <button class="mt-btn mt-btn-secondary" id="mt-hint-btn">💡 Hint</button>
                                <button class="mt-btn mt-btn-secondary" id="mt-peek-btn">👀 Peek at Grid</button>
                            </div>
                        </div>

                        <div class="mt-feedback" id="mt-feedback"></div>

                        <div class="mt-progress-bar">
                            <div class="mt-progress-fill" id="mt-progress-fill"></div>
                            <span class="mt-progress-text" id="mt-progress-text">0 / 0</span>
                        </div>
                    </div>

                    <div class="mt-right-panel">
                        <canvas id="mt-grid-canvas"></canvas>
                    </div>
                </main>

                <div class="mt-skill-tree-panel" id="mt-skill-tree-panel" style="display: none;">
                    <h3>🌳 Your Skill Tree</h3>
                    <div class="skill-tree-content" id="mt-skill-tree-content"></div>
                    <button class="mt-btn mt-btn-secondary" id="mt-skill-tree-close">Back to Practice</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // Store element references
        this.elements = {
            dialogue: document.getElementById('mt-dialogue'),
            question: document.getElementById('mt-question'),
            answerInput: document.getElementById('mt-answer-input'),
            submitBtn: document.getElementById('mt-submit-btn'),
            hintBtn: document.getElementById('mt-hint-btn'),
            peekBtn: document.getElementById('mt-peek-btn'),
            feedback: document.getElementById('mt-feedback'),
            progressFill: document.getElementById('mt-progress-fill'),
            progressText: document.getElementById('mt-progress-text'),
            sessionGold: document.getElementById('mt-session-gold'),
            problemArea: document.getElementById('mt-problem-area'),
            skillTreePanel: document.getElementById('mt-skill-tree-panel'),
            skillTreeContent: document.getElementById('mt-skill-tree-content'),
            gridCanvas: document.getElementById('mt-grid-canvas')
        };

        // Bind events
        document.getElementById('mt-close-btn').addEventListener('click', () => this.close());
        document.getElementById('mt-skill-tree-btn').addEventListener('click', () => this.showSkillTree());
        document.getElementById('mt-skill-tree-close').addEventListener('click', () => this.hideSkillTree());
        this.elements.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.elements.hintBtn.addEventListener('click', () => this.showHint());
        this.elements.peekBtn.addEventListener('click', () => this.peekGrid());
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
    }

    // === OPEN/CLOSE ===
    async open() {
        this.isOpen = true;
        this.modal.style.display = 'flex';

        // Initialize components
        this.grid = new MathGrid(this.elements.gridCanvas);
        this.adaptive = new MathAdaptive();
        this.api = new MathTutorAPI();

        // Reset session
        this.sessionGold = 0;
        this.sessionMedals = [];
        this.problemsInPhase = 0;

        // Grid click handler for "find" problems
        this.grid.onCellClick = (number) => this.handleGridClick(number);

        // Start with greeting
        this.sessionPhase = 'greeting';
        await this.showGreeting();
    }

    close() {
        if (this.adaptive && this.adaptive.sessionStats.totalProblems > 0) {
            this.showSummary();
        } else {
            this.forceClose();
        }
    }

    forceClose() {
        this.isOpen = false;
        this.modal.style.display = 'none';

        // Award gold to game
        if (window.game && this.sessionGold > 0) {
            window.game.player.gold += this.sessionGold;
            window.game.showMessage(`🐝 You earned ${this.sessionGold} gold from math practice!`);
        }

        // Award medals to inventory
        this.sessionMedals.forEach(medal => {
            if (window.game) {
                window.game.addToInventory({
                    id: `math_medal_${medal.skill}_${medal.type}`,
                    name: `${medal.type.charAt(0).toUpperCase() + medal.type.slice(1)} ${MathSkills.skills[medal.skill]?.name || medal.skill}`,
                    icon: medal.type === 'gold' ? '🥇' : medal.type === 'silver' ? '🥈' : '🥉',
                    type: 'medal',
                    quantity: 1
                });
            }
        });

        // Save progress
        this.saveProgress();
        this.saveStats();

        // Cleanup
        this.api?.clearHistory();
    }

    // === SESSION FLOW ===
    async showGreeting() {
        this.elements.problemArea.style.display = 'none';

        // Get last session info
        const lastSession = localStorage.getItem('mathTutor_lastSession');
        const parsedSession = lastSession ? JSON.parse(lastSession) : null;

        const greeting = await this.api.generateGreeting(this.studentName, parsedSession);
        this.setDialogue(greeting);

        // After greeting, start warmup
        setTimeout(() => this.startWarmup(), 3000);
    }

    async startWarmup() {
        this.sessionPhase = 'warmup';
        this.problemsInPhase = 0;
        this.elements.problemArea.style.display = 'block';

        this.setDialogue("Let's warm up those wings! Here's an easy one...");

        // Pick a mastered skill for warmup, or default
        const masteredSkill = this.getMasteredSkill() || 'navigator_find';
        this.adaptive.setSkill(masteredSkill, 1); // Level 1 for warmup

        this.nextProblem();
    }

    async startCalibration() {
        this.sessionPhase = 'calibration';
        this.problemsInPhase = 0;

        // Pick skill to calibrate
        const recommendedSkill = MathSkills.getRecommendedSkill(this.progress, this.stats);
        this.adaptive.setSkill(recommendedSkill); // Will start calibration

        this.setDialogue("Now let's find your level! I'll try a few different problems...");

        this.nextProblem();
    }

    async startPractice() {
        this.sessionPhase = 'practice';
        this.problemsInPhase = 0;

        const level = this.adaptive.currentLevel;
        const skill = MathSkills.skills[this.adaptive.currentSkill];

        this.setDialogue(`Bee-rilliant! You're ready for Level ${level} ${skill?.name || 'practice'}! Let's go!`);

        this.nextProblem();
    }

    // === PROBLEM HANDLING ===
    nextProblem() {
        // Check if phase should change
        if (this.sessionPhase === 'warmup' && this.problemsInPhase >= 3) {
            this.startCalibration();
            return;
        }

        if (this.sessionPhase === 'calibration' && !this.adaptive.isCalibrating) {
            this.startPractice();
            return;
        }

        // Generate problem
        this.currentProblem = MathProblems.generate(
            this.adaptive.currentSkill,
            this.adaptive.currentLevel
        );

        // Update UI
        this.elements.question.textContent = this.currentProblem.question;
        this.elements.answerInput.value = '';
        this.elements.answerInput.focus();
        this.elements.feedback.textContent = '';
        this.elements.feedback.className = 'mt-feedback';

        // Update grid visibility
        this.grid.setVisibility(
            this.adaptive.scaffoldingLevel,
            this.currentProblem.operands?.[0]
        );

        // Position bee at starting number if applicable
        if (this.currentProblem.operands) {
            this.grid.setBeePosition(this.currentProblem.operands[0]);
        }

        // Show/hide peek button based on scaffold level
        this.elements.peekBtn.style.display =
            this.adaptive.scaffoldingLevel === 'peek' ? 'inline-block' : 'none';

        // Update progress display
        this.updateProgressDisplay();

        // Start timer
        this.problemStartTime = Date.now();
    }

    async submitAnswer() {
        const userAnswer = parseInt(this.elements.answerInput.value);

        if (isNaN(userAnswer)) {
            this.elements.feedback.textContent = "Type a number!";
            return;
        }

        const timeSeconds = (Date.now() - this.problemStartTime) / 1000;
        const correct = userAnswer === this.currentProblem.answer;

        // Record in adaptive engine
        const adjustment = this.adaptive.recordResult(correct, timeSeconds, this.currentProblem);

        // Update stats
        this.updateStats(correct, timeSeconds);

        // Show feedback
        if (correct) {
            await this.handleCorrectAnswer(timeSeconds, adjustment);
        } else {
            await this.handleIncorrectAnswer(userAnswer);
        }
    }

    async handleCorrectAnswer(timeSeconds, adjustment) {
        // Visual feedback
        this.elements.feedback.textContent = 'Correct!';
        this.elements.feedback.className = 'mt-feedback correct';

        // Animate path if available
        if (this.currentProblem.gridPath) {
            this.grid.animatePath(this.currentProblem.gridPath, () => {
                this.grid.highlightCell(this.currentProblem.answer);
            });
        } else {
            this.grid.highlightCell(this.currentProblem.answer);
        }

        // Award gold
        const goldEarned = this.sessionPhase === 'challenge' ? 15 : 5;
        this.sessionGold += goldEarned;
        this.elements.sessionGold.textContent = this.sessionGold;

        // API response
        const streak = this.adaptive.consecutiveCorrect;
        const response = await this.api.generateCorrectResponse(this.currentProblem, timeSeconds, streak);
        this.setDialogue(response);

        // Check for level up message
        if (adjustment.reason) {
            setTimeout(() => {
                this.setDialogue(adjustment.reason);
            }, 1500);
        }

        // Check for medals
        this.checkMedals();

        // Next problem after delay
        this.problemsInPhase++;
        setTimeout(() => this.nextProblem(), 2000);
    }

    async handleIncorrectAnswer(userAnswer) {
        // Visual feedback
        this.elements.feedback.textContent = `Not quite... the answer was ${this.currentProblem.answer}`;
        this.elements.feedback.className = 'mt-feedback incorrect';

        // Detect student state
        const studentState = this.adaptive.detectState();

        // Check for break suggestion
        if (studentState === 'frustrated' || studentState === 'distracted') {
            const breakMsg = await this.api.generateBreakSuggestion(studentState);
            this.setDialogue(breakMsg);

            // Show continue/break options
            // (Implementation: add buttons dynamically)
        } else {
            const response = await this.api.generateIncorrectResponse(
                this.currentProblem,
                userAnswer,
                studentState
            );
            this.setDialogue(response);
        }

        // Show correct answer on grid
        this.grid.highlightCell(this.currentProblem.answer);
        if (this.currentProblem.gridPath) {
            this.grid.animatePath(this.currentProblem.gridPath);
        }

        // Next problem after longer delay
        this.problemsInPhase++;
        setTimeout(() => this.nextProblem(), 3500);
    }

    async showHint() {
        const hint = await this.api.generateHint(this.currentProblem, 1);
        this.setDialogue(hint);

        // If grid is hidden, briefly show relevant area
        if (this.adaptive.scaffoldingLevel === 'none') {
            this.grid.setVisibility('partial', this.currentProblem.operands?.[0]);
            setTimeout(() => {
                this.grid.setVisibility('none');
            }, 3000);
        }
    }

    peekGrid() {
        this.grid.peek(2000);
        this.setDialogue("Quick peek! Try to remember where the numbers are!");
    }

    handleGridClick(number) {
        // For "find" type problems
        if (this.currentProblem?.type === 'find') {
            this.elements.answerInput.value = number;
            this.submitAnswer();
        }
    }

    // === SUMMARY ===
    async showSummary() {
        this.sessionPhase = 'summary';
        this.elements.problemArea.style.display = 'none';

        const summary = this.adaptive.getSessionSummary();

        // Save last session
        localStorage.setItem('mathTutor_lastSession', JSON.stringify(summary));

        const summaryText = await this.api.generateSessionSummary(
            summary,
            this.sessionMedals.map(m => `${m.type} ${m.skill}`),
            this.sessionGold
        );

        this.setDialogue(summaryText);

        // Show summary stats in feedback area
        this.elements.feedback.innerHTML = `
            <div class="session-summary">
                <div class="summary-stat">Problems: ${summary.totalProblems}</div>
                <div class="summary-stat">Accuracy: ${summary.accuracy}%</div>
                <div class="summary-stat">Avg Time: ${summary.avgTime}s</div>
                <div class="summary-stat">Gold Earned: ${this.sessionGold}</div>
                ${this.sessionMedals.length > 0 ? `<div class="summary-stat">Medals: ${this.sessionMedals.length}</div>` : ''}
            </div>
            <button class="mt-btn mt-btn-primary" id="mt-finish-btn">Finish</button>
        `;
        this.elements.feedback.className = 'mt-feedback summary';

        document.getElementById('mt-finish-btn').addEventListener('click', () => this.forceClose());
    }

    // === SKILL TREE ===
    showSkillTree() {
        this.elements.skillTreePanel.style.display = 'block';
        this.renderSkillTree();
    }

    hideSkillTree() {
        this.elements.skillTreePanel.style.display = 'none';
    }

    renderSkillTree() {
        const content = this.elements.skillTreeContent;
        content.innerHTML = '';

        // Group skills by branch
        const branches = {};
        for (const [id, skill] of Object.entries(MathSkills.skills)) {
            if (!branches[skill.branch]) branches[skill.branch] = [];
            branches[skill.branch].push({ id, ...skill });
        }

        // Render each branch
        for (const [branch, skills] of Object.entries(branches)) {
            const branchDiv = document.createElement('div');
            branchDiv.className = 'skill-branch';
            branchDiv.innerHTML = `<h4>${this.getBranchName(branch)}</h4>`;

            const skillsDiv = document.createElement('div');
            skillsDiv.className = 'skills-list';

            skills.forEach(skill => {
                const isUnlocked = MathSkills.isUnlocked(skill.id, this.progress);
                const currentLevel = this.progress[skill.id] || 0;
                const stats = this.stats[skill.id];
                const medal = MathSkills.getMedal(skill.id, stats);

                const skillDiv = document.createElement('div');
                skillDiv.className = `skill-item ${isUnlocked ? 'unlocked' : 'locked'} ${medal ? 'medal-' + medal : ''}`;
                skillDiv.innerHTML = `
                    <span class="skill-icon">${skill.icon}</span>
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-level">Lv ${currentLevel}/${skill.maxLevel}</span>
                    ${medal ? `<span class="skill-medal">${medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : '🥉'}</span>` : ''}
                `;

                if (isUnlocked) {
                    skillDiv.addEventListener('click', () => this.selectSkill(skill.id));
                }

                skillsDiv.appendChild(skillDiv);
            });

            branchDiv.appendChild(skillsDiv);
            content.appendChild(branchDiv);
        }
    }

    getBranchName(branch) {
        const names = {
            navigator: 'Navigator',
            addition: 'Addition',
            subtraction: 'Subtraction',
            multiplication: 'Multiplication',
            strategies: 'Strategies',
            word_problems: 'Word Problems'
        };
        return names[branch] || branch;
    }

    selectSkill(skillId) {
        this.adaptive.setSkill(skillId);
        this.hideSkillTree();
        this.setDialogue(`Let's practice ${MathSkills.skills[skillId]?.name}!`);
        this.sessionPhase = 'practice';
        this.problemsInPhase = 0;
        this.nextProblem();
    }

    // === HELPERS ===
    setDialogue(text) {
        this.elements.dialogue.textContent = text;
    }

    updateProgressDisplay() {
        const total = this.adaptive.sessionStats.totalProblems;
        const correct = this.adaptive.sessionStats.correct;
        const accuracy = total > 0 ? Math.round(correct / total * 100) : 0;

        this.elements.progressFill.style.width = `${accuracy}%`;
        this.elements.progressText.textContent = `${correct} / ${total} (${accuracy}%)`;
    }

    updateStats(correct, time) {
        const skillId = this.adaptive.currentSkill;
        if (!this.stats[skillId]) {
            this.stats[skillId] = { attempts: 0, correct: 0, totalTime: 0 };
        }
        this.stats[skillId].attempts++;
        if (correct) this.stats[skillId].correct++;
        this.stats[skillId].totalTime += time;
    }

    checkMedals() {
        const skillId = this.adaptive.currentSkill;
        const stats = this.stats[skillId];
        const currentMedal = MathSkills.getMedal(skillId, stats);

        if (currentMedal) {
            // Check if this is a new medal
            const existingMedal = this.sessionMedals.find(m => m.skill === skillId);
            if (!existingMedal || this.medalRank(currentMedal) > this.medalRank(existingMedal.type)) {
                // Remove old medal if upgrading
                if (existingMedal) {
                    this.sessionMedals = this.sessionMedals.filter(m => m.skill !== skillId);
                }
                this.sessionMedals.push({ skill: skillId, type: currentMedal });

                // Celebrate!
                const medalEmoji = currentMedal === 'gold' ? '🥇' : currentMedal === 'silver' ? '🥈' : '🥉';
                this.setDialogue(`WOW! You earned a ${currentMedal.toUpperCase()} medal ${medalEmoji} in ${MathSkills.skills[skillId]?.name}! Buzz-tastic!`);
            }
        }
    }

    medalRank(type) {
        return { bronze: 1, silver: 2, gold: 3 }[type] || 0;
    }

    getMasteredSkill() {
        for (const [skillId, stats] of Object.entries(this.stats)) {
            if (MathSkills.getMedal(skillId, stats)) {
                return skillId;
            }
        }
        return null;
    }
}

// Initialize global instance
window.mathTutor = new MathTutor();
