// js/math-tutor/math-skills.js
// Skill tree definitions for Buzzy's Number Garden

const MathSkills = {
    // Skill definitions
    skills: {
        // === NAVIGATOR BRANCH ===
        navigator_find: {
            id: 'navigator_find',
            name: 'Quick Find',
            branch: 'navigator',
            description: 'Quickly locate numbers on the grid',
            icon: '🔍',
            maxLevel: 3,
            requires: [],
            levelDescriptions: {
                1: 'Find numbers 0-50',
                2: 'Find numbers 0-99',
                3: 'Speed challenge - find 5 in 15 seconds'
            }
        },
        navigator_patterns: {
            id: 'navigator_patterns',
            name: 'Grid Patterns',
            branch: 'navigator',
            description: 'Recognize patterns in the grid (×5, ×10 columns)',
            icon: '🔢',
            maxLevel: 3,
            requires: ['navigator_find:2'],
            levelDescriptions: {
                1: 'Identify ×10 column',
                2: 'Identify ×5 columns',
                3: 'Predict pattern continuations'
            }
        },

        // === ADDITION BRANCH ===
        addition_small: {
            id: 'addition_small',
            name: 'Small Hops',
            branch: 'addition',
            description: 'Add single digits (1-9)',
            icon: '🐰',
            maxLevel: 5,
            requires: ['navigator_find:1'],
            levelDescriptions: {
                1: '2-digit + 1-digit, no carry (32 + 5)',
                2: '2-digit + 1-digit, with carry (38 + 7)',
                3: 'Mixed, partial grid visible',
                4: 'Mixed, grid on request',
                5: 'Mental only, speed challenge'
            }
        },
        addition_jumping: {
            id: 'addition_jumping',
            name: 'Row Jumping',
            branch: 'addition',
            description: 'Add by jumping rows (+10, +20, etc)',
            icon: '🦘',
            maxLevel: 5,
            requires: ['addition_small:2'],
            levelDescriptions: {
                1: '+10 jumps (23 + 10)',
                2: '+20, +30 jumps',
                3: '2-digit + 2-digit, no carry (34 + 25)',
                4: '2-digit + 2-digit, with carry (47 + 36)',
                5: 'Any 2-digit + 2-digit, mental'
            }
        },

        // === SUBTRACTION BRANCH ===
        subtraction_small: {
            id: 'subtraction_small',
            name: 'Small Steps Back',
            branch: 'subtraction',
            description: 'Subtract single digits',
            icon: '🐢',
            maxLevel: 5,
            requires: ['navigator_find:1'],
            levelDescriptions: {
                1: '2-digit - 1-digit, no borrow (47 - 3)',
                2: '2-digit - 1-digit, with borrow (43 - 7)',
                3: 'Mixed, partial grid',
                4: 'Mixed, grid on request',
                5: 'Mental only'
            }
        },
        subtraction_jumping: {
            id: 'subtraction_jumping',
            name: 'Row Jumping Back',
            branch: 'subtraction',
            description: 'Subtract by jumping rows back',
            icon: '🦀',
            maxLevel: 5,
            requires: ['subtraction_small:2'],
            levelDescriptions: {
                1: '-10 jumps (53 - 10)',
                2: '-20, -30 jumps',
                3: '2-digit - 2-digit, no borrow (68 - 24)',
                4: '2-digit - 2-digit, with borrow (53 - 28)',
                5: 'Any 2-digit - 2-digit, mental'
            }
        },

        // === MULTIPLICATION BRANCH ===
        multiplication_easy: {
            id: 'multiplication_easy',
            name: 'Easy Times',
            branch: 'multiplication',
            description: 'Times tables ×2, ×5, ×10',
            icon: '✖️',
            maxLevel: 3,
            requires: ['addition_jumping:2'],
            levelDescriptions: {
                1: '×2 tables with visual arrays',
                2: '×5 and ×10 tables',
                3: 'Mixed ×2, ×5, ×10 speed'
            }
        },
        multiplication_medium: {
            id: 'multiplication_medium',
            name: 'Growing Tables',
            branch: 'multiplication',
            description: 'Times tables ×3, ×4, ×6, ×7',
            icon: '🌱',
            maxLevel: 3,
            requires: ['multiplication_easy:2'],
            levelDescriptions: {
                1: '×3 and ×4 tables',
                2: '×6 and ×7 tables',
                3: 'Mixed, speed challenge'
            }
        },
        multiplication_hard: {
            id: 'multiplication_hard',
            name: 'Master Tables',
            branch: 'multiplication',
            description: 'Times tables ×8, ×9',
            icon: '⭐',
            maxLevel: 3,
            requires: ['multiplication_medium:2'],
            levelDescriptions: {
                1: '×8 tables with strategy hints',
                2: '×9 tables with finger trick',
                3: 'All tables mixed, pure recall'
            }
        },

        // === STRATEGIES BRANCH ===
        strategy_doubles: {
            id: 'strategy_doubles',
            name: 'Doubles Power',
            branch: 'strategies',
            description: 'Use doubles and near-doubles',
            icon: '👯',
            maxLevel: 3,
            requires: ['addition_jumping:3'],
            levelDescriptions: {
                1: 'Pure doubles (6+6, 7+7, 8+8)',
                2: 'Near doubles (6+7 = double 6 + 1)',
                3: 'Big doubles (26+27, 35+36)'
            }
        },
        strategy_compensation: {
            id: 'strategy_compensation',
            name: 'Round & Adjust',
            branch: 'strategies',
            description: 'Add/subtract by rounding',
            icon: '🎯',
            maxLevel: 3,
            requires: ['addition_jumping:3', 'subtraction_jumping:3'],
            levelDescriptions: {
                1: '+9 = +10 - 1 (visual)',
                2: '+99 = +100 - 1',
                3: 'Mixed compensation strategies'
            }
        },

        // === WORD PROBLEMS ===
        word_problems: {
            id: 'word_problems',
            name: 'Story Problems',
            branch: 'word_problems',
            description: 'Beecroft-themed word problems',
            icon: '📖',
            maxLevel: 5,
            requires: ['addition_jumping:4', 'subtraction_jumping:4'],
            levelDescriptions: {
                1: 'Single-step addition stories',
                2: 'Single-step subtraction stories',
                3: 'Mixed single-step',
                4: 'Two-step problems',
                5: 'Multi-step with multiplication'
            }
        }
    },

    // Medal thresholds
    medals: {
        bronze: { accuracy: 0.7, minAttempts: 10 },
        silver: { accuracy: 0.85, minAttempts: 15, avgTimeUnder: 12 },
        gold: { accuracy: 0.95, minAttempts: 20, avgTimeUnder: 8 }
    },

    // Check if a skill is unlocked based on current progress
    isUnlocked: function(skillId, progress) {
        const skill = this.skills[skillId];
        if (!skill) return false;
        if (skill.requires.length === 0) return true;

        return skill.requires.every(req => {
            const [reqSkillId, reqLevel] = req.split(':');
            const currentLevel = progress[reqSkillId] || 0;
            return currentLevel >= parseInt(reqLevel);
        });
    },

    // Get current medal for a skill
    getMedal: function(skillId, stats) {
        if (!stats || stats.attempts < this.medals.bronze.minAttempts) return null;

        const accuracy = stats.correct / stats.attempts;
        const avgTime = stats.totalTime / stats.attempts;

        if (accuracy >= this.medals.gold.accuracy &&
            stats.attempts >= this.medals.gold.minAttempts &&
            avgTime <= this.medals.gold.avgTimeUnder) {
            return 'gold';
        }
        if (accuracy >= this.medals.silver.accuracy &&
            stats.attempts >= this.medals.silver.minAttempts &&
            avgTime <= this.medals.silver.avgTimeUnder) {
            return 'silver';
        }
        if (accuracy >= this.medals.bronze.accuracy) {
            return 'bronze';
        }
        return null;
    },

    // Get next recommended skill to practice
    getRecommendedSkill: function(progress, stats) {
        // Priority: skills that are unlocked but not mastered
        const candidates = [];

        for (const [skillId, skill] of Object.entries(this.skills)) {
            if (!this.isUnlocked(skillId, progress)) continue;

            const currentLevel = progress[skillId] || 0;
            if (currentLevel >= skill.maxLevel) continue;

            const skillStats = stats[skillId] || { attempts: 0, correct: 0 };
            const medal = this.getMedal(skillId, skillStats);

            candidates.push({
                skillId,
                currentLevel,
                medal,
                priority: this.calculatePriority(skillId, currentLevel, medal, skillStats)
            });
        }

        candidates.sort((a, b) => b.priority - a.priority);
        return candidates[0]?.skillId || 'navigator_find';
    },

    calculatePriority: function(skillId, level, medal, stats) {
        // Higher priority = should practice more
        let priority = 0;

        // Prefer skills with some progress but not complete
        if (level > 0 && !medal) priority += 10;

        // Prefer skills being practiced (familiarity)
        if (stats.attempts > 0 && stats.attempts < 30) priority += 5;

        // Prefer struggling skills (accuracy 50-70%)
        if (stats.attempts > 5) {
            const accuracy = stats.correct / stats.attempts;
            if (accuracy >= 0.5 && accuracy < 0.7) priority += 8;
        }

        // Slightly prefer earlier skills in progression
        const skillOrder = Object.keys(this.skills);
        priority -= skillOrder.indexOf(skillId) * 0.1;

        return priority;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathSkills;
}
