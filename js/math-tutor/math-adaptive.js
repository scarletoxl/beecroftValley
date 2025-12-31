// js/math-tutor/math-adaptive.js
// Real-time adaptive difficulty engine

class MathAdaptive {
    constructor() {
        // Recent performance window
        this.recentWindow = 5;
        this.recentResults = [];

        // Session stats
        this.sessionStats = {
            startTime: Date.now(),
            totalProblems: 0,
            correct: 0,
            totalTime: 0,
            skillsAttempted: new Set(),
            levelChanges: []
        };

        // Current state
        this.currentSkill = null;
        this.currentLevel = 1;
        this.scaffoldingLevel = 'full'; // full, partial, peek, none
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;

        // Calibration state
        this.isCalibrating = true;
        this.calibrationProblems = 0;
        this.calibrationMax = 5;

        // Thresholds
        this.thresholds = {
            tooEasy: { accuracy: 0.9, avgTime: 5 },
            sweetSpot: { accuracyMin: 0.7, accuracyMax: 0.85, avgTimeMin: 5, avgTimeMax: 15 },
            tooHard: { accuracy: 0.6, avgTime: 20 },
            bumpUpStreak: 3,
            bumpDownStreak: 2
        };
    }

    // Record a result and return adjustment recommendation
    recordResult(correct, timeSeconds, problem) {
        const result = {
            correct,
            time: timeSeconds,
            skill: this.currentSkill,
            level: this.currentLevel,
            timestamp: Date.now()
        };

        this.recentResults.push(result);
        if (this.recentResults.length > this.recentWindow) {
            this.recentResults.shift();
        }

        // Update streaks
        if (correct) {
            this.consecutiveCorrect++;
            this.consecutiveWrong = 0;
        } else {
            this.consecutiveWrong++;
            this.consecutiveCorrect = 0;
        }

        // Update session stats
        this.sessionStats.totalProblems++;
        if (correct) this.sessionStats.correct++;
        this.sessionStats.totalTime += timeSeconds;
        this.sessionStats.skillsAttempted.add(this.currentSkill);

        // Calibration mode
        if (this.isCalibrating) {
            return this.calibrationAdjust(correct, timeSeconds);
        }

        // Regular adaptive mode
        return this.adaptiveAdjust();
    }

    // Fast binary-search calibration
    calibrationAdjust(correct, time) {
        this.calibrationProblems++;

        let adjustment = { action: 'continue' };

        if (correct && time < 5) {
            // Too easy, jump up significantly
            adjustment = {
                action: 'level_up',
                amount: 2,
                reason: 'Fast and correct - jumping ahead'
            };
        } else if (correct && time < 10) {
            // Good, move up a bit
            adjustment = {
                action: 'level_up',
                amount: 1,
                reason: 'Correct - trying slightly harder'
            };
        } else if (!correct) {
            // Too hard, drop down
            adjustment = {
                action: 'level_down',
                amount: 1,
                reason: 'Finding your level...'
            };
        }

        // End calibration after enough problems
        if (this.calibrationProblems >= this.calibrationMax) {
            this.isCalibrating = false;
            adjustment.calibrationComplete = true;
            adjustment.foundLevel = this.currentLevel;
        }

        // Apply level change
        this.applyLevelChange(adjustment);

        return adjustment;
    }

    // Regular adaptive adjustment
    adaptiveAdjust() {
        const metrics = this.calculateMetrics();
        let adjustment = { action: 'continue', metrics };

        // Check streaks first (immediate response)
        if (this.consecutiveCorrect >= this.thresholds.bumpUpStreak) {
            adjustment = {
                action: 'level_up',
                amount: 1,
                reason: `${this.consecutiveCorrect} correct in a row! Let's try harder!`,
                scaffoldChange: 'reduce'
            };
            this.consecutiveCorrect = 0;
        } else if (this.consecutiveWrong >= this.thresholds.bumpDownStreak) {
            adjustment = {
                action: 'level_down',
                amount: 1,
                reason: "Let's slow down and try an easier one",
                scaffoldChange: 'increase'
            };
            this.consecutiveWrong = 0;
        }
        // Check overall metrics
        else if (metrics.accuracy >= this.thresholds.tooEasy.accuracy &&
                 metrics.avgTime <= this.thresholds.tooEasy.avgTime) {
            adjustment = {
                action: 'level_up',
                amount: 1,
                reason: "You're flying through these!",
                scaffoldChange: 'reduce'
            };
        } else if (metrics.accuracy < this.thresholds.tooHard.accuracy ||
                   metrics.avgTime > this.thresholds.tooHard.avgTime) {
            adjustment = {
                action: 'level_down',
                amount: 1,
                reason: "These seem tricky - let's practice more",
                scaffoldChange: 'increase'
            };
        }

        // Apply changes
        this.applyLevelChange(adjustment);
        this.applyScaffoldChange(adjustment);

        return adjustment;
    }

    calculateMetrics() {
        if (this.recentResults.length === 0) {
            return { accuracy: 0.5, avgTime: 10 };
        }

        const correct = this.recentResults.filter(r => r.correct).length;
        const totalTime = this.recentResults.reduce((sum, r) => sum + r.time, 0);

        return {
            accuracy: correct / this.recentResults.length,
            avgTime: totalTime / this.recentResults.length,
            sampleSize: this.recentResults.length
        };
    }

    applyLevelChange(adjustment) {
        if (adjustment.action === 'level_up') {
            const skill = MathSkills.skills[this.currentSkill];
            const maxLevel = skill ? skill.maxLevel : 5;
            this.currentLevel = Math.min(maxLevel, this.currentLevel + (adjustment.amount || 1));
            this.sessionStats.levelChanges.push({ direction: 'up', level: this.currentLevel, time: Date.now() });
        } else if (adjustment.action === 'level_down') {
            this.currentLevel = Math.max(1, this.currentLevel - (adjustment.amount || 1));
            this.sessionStats.levelChanges.push({ direction: 'down', level: this.currentLevel, time: Date.now() });
        }
    }

    applyScaffoldChange(adjustment) {
        const scaffoldOrder = ['full', 'partial', 'peek', 'none'];
        const currentIndex = scaffoldOrder.indexOf(this.scaffoldingLevel);

        if (adjustment.scaffoldChange === 'reduce' && currentIndex < scaffoldOrder.length - 1) {
            this.scaffoldingLevel = scaffoldOrder[currentIndex + 1];
        } else if (adjustment.scaffoldChange === 'increase' && currentIndex > 0) {
            this.scaffoldingLevel = scaffoldOrder[currentIndex - 1];
        }
    }

    // Set skill and optionally start calibration
    setSkill(skillId, startLevel = null) {
        this.currentSkill = skillId;

        if (startLevel !== null) {
            this.currentLevel = startLevel;
            this.isCalibrating = false;
        } else {
            // Start calibration at middle level
            const skill = MathSkills.skills[skillId];
            const maxLevel = skill ? skill.maxLevel : 5;
            this.currentLevel = Math.ceil(maxLevel / 2);
            this.isCalibrating = true;
            this.calibrationProblems = 0;
        }

        // Reset streaks
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
    }

    // Detect distraction/frustration patterns
    detectState() {
        if (this.recentResults.length < 2) return 'normal';

        const lastTwo = this.recentResults.slice(-2);
        const avgTime = lastTwo.reduce((s, r) => s + r.time, 0) / 2;
        const accuracy = lastTwo.filter(r => r.correct).length / 2;

        // Fast wrong answers = guessing/frustrated
        if (accuracy < 0.5 && avgTime < 3) {
            return 'frustrated';
        }

        // Very slow = distracted or stuck
        if (avgTime > 30) {
            return 'distracted';
        }

        // Declining performance
        if (this.recentResults.length >= 4) {
            const firstHalf = this.recentResults.slice(0, 2);
            const secondHalf = this.recentResults.slice(-2);
            const firstAcc = firstHalf.filter(r => r.correct).length / 2;
            const secondAcc = secondHalf.filter(r => r.correct).length / 2;

            if (firstAcc > 0.7 && secondAcc < 0.4) {
                return 'declining';
            }
        }

        return 'normal';
    }

    // Get session summary for API
    getSessionSummary() {
        const duration = (Date.now() - this.sessionStats.startTime) / 1000 / 60; // minutes

        return {
            duration: Math.round(duration),
            totalProblems: this.sessionStats.totalProblems,
            correct: this.sessionStats.correct,
            accuracy: this.sessionStats.totalProblems > 0
                ? Math.round(this.sessionStats.correct / this.sessionStats.totalProblems * 100)
                : 0,
            avgTime: this.sessionStats.totalProblems > 0
                ? Math.round(this.sessionStats.totalTime / this.sessionStats.totalProblems * 10) / 10
                : 0,
            skillsWorked: Array.from(this.sessionStats.skillsAttempted),
            levelProgression: this.sessionStats.levelChanges,
            finalLevel: this.currentLevel,
            finalScaffold: this.scaffoldingLevel
        };
    }

    // Reset for new session
    reset() {
        this.recentResults = [];
        this.sessionStats = {
            startTime: Date.now(),
            totalProblems: 0,
            correct: 0,
            totalTime: 0,
            skillsAttempted: new Set(),
            levelChanges: []
        };
        this.consecutiveCorrect = 0;
        this.consecutiveWrong = 0;
        this.isCalibrating = true;
        this.calibrationProblems = 0;
        this.scaffoldingLevel = 'full';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathAdaptive;
}
