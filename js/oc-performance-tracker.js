// Beecroft Valley - OC Exam Performance Tracker
// Records detailed performance data and generates weakness-based recommendations

class OCPerformanceTracker {
    constructor() {
        this.storageKey = 'ocPerformanceData';
        this.maxSessions = 50; // Keep last 50 sessions
        this.data = this.loadData();
    }

    // ===== DATA STRUCTURE =====
    getDefaultData() {
        return {
            // Per-category statistics
            categoryStats: {
                // Maths categories
                maths_patterns: { correct: 0, total: 0, totalTime: 0 },
                maths_word: { correct: 0, total: 0, totalTime: 0 },
                maths_fractions: { correct: 0, total: 0, totalTime: 0 },
                maths_time: { correct: 0, total: 0, totalTime: 0 },
                maths_money: { correct: 0, total: 0, totalTime: 0 },
                maths_averages: { correct: 0, total: 0, totalTime: 0 },
                maths_geometry: { correct: 0, total: 0, totalTime: 0 },
                maths_multistep: { correct: 0, total: 0, totalTime: 0 },
                maths_place_value: { correct: 0, total: 0, totalTime: 0 },
                // Thinking categories
                thinking_logic: { correct: 0, total: 0, totalTime: 0 },
                thinking_analogies: { correct: 0, total: 0, totalTime: 0 },
                thinking_codes: { correct: 0, total: 0, totalTime: 0 },
                thinking_spatial: { correct: 0, total: 0, totalTime: 0 },
                thinking_sequences: { correct: 0, total: 0, totalTime: 0 },
                thinking_venn: { correct: 0, total: 0, totalTime: 0 },
                thinking_oddoneout: { correct: 0, total: 0, totalTime: 0 },
                thinking_puzzles: { correct: 0, total: 0, totalTime: 0 },
                thinking_number_logic: { correct: 0, total: 0, totalTime: 0 },
                // Reading categories
                reading_inference: { correct: 0, total: 0, totalTime: 0 },
                reading_vocabulary: { correct: 0, total: 0, totalTime: 0 },
                reading_main_idea: { correct: 0, total: 0, totalTime: 0 },
                reading_detail: { correct: 0, total: 0, totalTime: 0 }
            },
            // Session history
            sessions: [],
            // Last updated timestamp
            lastUpdated: null
        };
    }

    // ===== PERSISTENCE =====
    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to handle new categories
                const defaults = this.getDefaultData();
                return {
                    categoryStats: { ...defaults.categoryStats, ...parsed.categoryStats },
                    sessions: parsed.sessions || [],
                    lastUpdated: parsed.lastUpdated
                };
            }
        } catch (e) {
            console.error('Error loading OC performance data:', e);
        }
        return this.getDefaultData();
    }

    saveData() {
        try {
            this.data.lastUpdated = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.error('Error saving OC performance data:', e);
        }
    }

    // ===== RECORDING PERFORMANCE =====

    // Record a single answer
    recordAnswer(section, category, isCorrect, timeSpent = 0) {
        // Build the category key
        const categoryKey = this.getCategoryKey(section, category);

        // Initialize if not exists
        if (!this.data.categoryStats[categoryKey]) {
            this.data.categoryStats[categoryKey] = { correct: 0, total: 0, totalTime: 0 };
        }

        // Update stats
        this.data.categoryStats[categoryKey].total++;
        if (isCorrect) {
            this.data.categoryStats[categoryKey].correct++;
        }
        this.data.categoryStats[categoryKey].totalTime += timeSpent;

        this.saveData();
    }

    // Record a complete session
    recordSession(session) {
        // Session format:
        // {
        //   section: 'maths' | 'thinking' | 'reading',
        //   date: timestamp,
        //   questions: [{ category, isCorrect, timeSpent }],
        //   score: number,
        //   total: number
        // }

        this.data.sessions.unshift({
            ...session,
            date: Date.now()
        });

        // Keep only last N sessions
        if (this.data.sessions.length > this.maxSessions) {
            this.data.sessions = this.data.sessions.slice(0, this.maxSessions);
        }

        this.saveData();
    }

    getCategoryKey(section, category) {
        if (!category) return `${section}_general`;
        // Normalize category name
        const normalizedCategory = category.toLowerCase().replace(/\s+/g, '_');
        return `${section}_${normalizedCategory}`;
    }

    // ===== ANALYSIS =====

    // Get accuracy for a specific category
    getCategoryAccuracy(categoryKey) {
        const stats = this.data.categoryStats[categoryKey];
        if (!stats || stats.total === 0) return null;
        return Math.round((stats.correct / stats.total) * 100);
    }

    // Get all category stats with accuracy
    getAllCategoryStats() {
        const results = {};
        for (const [key, stats] of Object.entries(this.data.categoryStats)) {
            if (stats.total > 0) {
                results[key] = {
                    ...stats,
                    accuracy: Math.round((stats.correct / stats.total) * 100),
                    avgTime: stats.total > 0 ? Math.round(stats.totalTime / stats.total) : 0
                };
            }
        }
        return results;
    }

    // Get stats by section
    getSectionStats(section) {
        const results = {};
        for (const [key, stats] of Object.entries(this.data.categoryStats)) {
            if (key.startsWith(section + '_') && stats.total > 0) {
                const categoryName = key.replace(section + '_', '');
                results[categoryName] = {
                    ...stats,
                    accuracy: Math.round((stats.correct / stats.total) * 100),
                    avgTime: stats.total > 0 ? Math.round(stats.totalTime / stats.total) : 0
                };
            }
        }
        return results;
    }

    // Get overall section accuracy
    getOverallSectionAccuracy(section) {
        let correct = 0, total = 0;
        for (const [key, stats] of Object.entries(this.data.categoryStats)) {
            if (key.startsWith(section + '_')) {
                correct += stats.correct;
                total += stats.total;
            }
        }
        return total > 0 ? Math.round((correct / total) * 100) : null;
    }

    // ===== WEAKNESS DETECTION =====

    // Identify weak categories (below threshold)
    getWeaknesses(threshold = 70) {
        const weaknesses = [];

        for (const [key, stats] of Object.entries(this.data.categoryStats)) {
            if (stats.total >= 3) { // Need at least 3 attempts to identify weakness
                const accuracy = (stats.correct / stats.total) * 100;
                if (accuracy < threshold) {
                    weaknesses.push({
                        category: key,
                        accuracy: Math.round(accuracy),
                        attempts: stats.total,
                        correct: stats.correct,
                        section: key.split('_')[0],
                        categoryName: this.formatCategoryName(key)
                    });
                }
            }
        }

        // Sort by accuracy (worst first)
        weaknesses.sort((a, b) => a.accuracy - b.accuracy);

        return weaknesses;
    }

    // Get strengths (above threshold)
    getStrengths(threshold = 80) {
        const strengths = [];

        for (const [key, stats] of Object.entries(this.data.categoryStats)) {
            if (stats.total >= 3) {
                const accuracy = (stats.correct / stats.total) * 100;
                if (accuracy >= threshold) {
                    strengths.push({
                        category: key,
                        accuracy: Math.round(accuracy),
                        attempts: stats.total,
                        correct: stats.correct,
                        section: key.split('_')[0],
                        categoryName: this.formatCategoryName(key)
                    });
                }
            }
        }

        // Sort by accuracy (best first)
        strengths.sort((a, b) => b.accuracy - a.accuracy);

        return strengths;
    }

    // ===== RECOMMENDATIONS =====

    // Generate practice recommendations based on performance
    getRecommendations() {
        const recommendations = [];
        const weaknesses = this.getWeaknesses(70);
        const allStats = this.getAllCategoryStats();

        // Priority 1: Critical weaknesses (below 50%)
        const critical = weaknesses.filter(w => w.accuracy < 50);
        for (const weakness of critical.slice(0, 2)) {
            recommendations.push({
                priority: 'critical',
                category: weakness.category,
                categoryName: weakness.categoryName,
                section: weakness.section,
                accuracy: weakness.accuracy,
                message: `Focus on ${weakness.categoryName} - only ${weakness.accuracy}% correct`,
                tip: this.getTipForCategory(weakness.category)
            });
        }

        // Priority 2: Moderate weaknesses (50-70%)
        const moderate = weaknesses.filter(w => w.accuracy >= 50 && w.accuracy < 70);
        for (const weakness of moderate.slice(0, 2)) {
            recommendations.push({
                priority: 'moderate',
                category: weakness.category,
                categoryName: weakness.categoryName,
                section: weakness.section,
                accuracy: weakness.accuracy,
                message: `Practice ${weakness.categoryName} - currently at ${weakness.accuracy}%`,
                tip: this.getTipForCategory(weakness.category)
            });
        }

        // Priority 3: Categories with few attempts
        const lowAttempts = [];
        for (const [key, stats] of Object.entries(this.data.categoryStats)) {
            if (stats.total > 0 && stats.total < 5) {
                lowAttempts.push({
                    category: key,
                    categoryName: this.formatCategoryName(key),
                    section: key.split('_')[0],
                    attempts: stats.total
                });
            }
        }

        for (const item of lowAttempts.slice(0, 2)) {
            recommendations.push({
                priority: 'explore',
                category: item.category,
                categoryName: item.categoryName,
                section: item.section,
                message: `Try more ${item.categoryName} questions (only ${item.attempts} attempted)`,
                tip: 'More practice helps identify strengths and weaknesses'
            });
        }

        return recommendations;
    }

    // Get tip for a specific category
    getTipForCategory(category) {
        const tips = {
            // Maths
            maths_patterns: 'Look for what changes between each number. Try multiplying, adding, or look for special sequences.',
            maths_word: 'Read carefully and identify the key numbers and operation words (total, each, shared, etc.).',
            maths_fractions: 'Remember: divide by the bottom number first, then multiply by the top.',
            maths_time: 'Convert everything to the same units (all minutes or all hours) before calculating.',
            maths_money: 'Line up decimal points when adding/subtracting. Check your answer makes sense.',
            maths_averages: 'Add all numbers together, then divide by how many numbers there are.',
            maths_geometry: 'Remember key formulas: perimeter = around, area = inside, angles in triangle = 180°.',
            maths_multistep: 'Break into smaller steps. Solve one part at a time.',
            maths_place_value: 'Each position is 10× the one to its right: ones, tens, hundreds, thousands...',
            // Thinking
            thinking_logic: 'Draw diagrams or use arrows to show relationships between things.',
            thinking_analogies: 'Find the relationship first (opposite, part of, used for) then apply it.',
            thinking_codes: 'Look for patterns: does each letter shift by the same amount?',
            thinking_spatial: 'Try to visualize or draw what happens step by step.',
            thinking_sequences: 'Check if items repeat in groups or follow a growing pattern.',
            thinking_venn: 'Draw circles and put numbers in the overlapping parts first.',
            thinking_oddoneout: 'Find what 3 things have in common that 1 thing doesn\'t.',
            thinking_puzzles: 'Read riddles carefully - the answer is often simpler than you think.',
            thinking_number_logic: 'Watch for trick questions! Read every word carefully.',
            // Reading
            reading_inference: 'Look for clues in the text - what does the author suggest but not say directly?',
            reading_vocabulary: 'Use the words around an unknown word to figure out its meaning.',
            reading_main_idea: 'Ask yourself: what is the whole passage mainly about?',
            reading_detail: 'Scan back through the passage to find the specific information.'
        };

        return tips[category] || 'Practice regularly and review your mistakes.';
    }

    // ===== FORMATTING =====

    formatCategoryName(categoryKey) {
        const names = {
            maths_patterns: 'Patterns & Sequences',
            maths_word: 'Word Problems',
            maths_fractions: 'Fractions',
            maths_time: 'Time',
            maths_money: 'Money',
            maths_averages: 'Averages',
            maths_geometry: 'Geometry',
            maths_multistep: 'Multi-step Problems',
            maths_place_value: 'Place Value',
            thinking_logic: 'Logical Reasoning',
            thinking_analogies: 'Analogies',
            thinking_codes: 'Codes & Ciphers',
            thinking_spatial: 'Spatial Reasoning',
            thinking_sequences: 'Sequences',
            thinking_venn: 'Venn Diagrams',
            thinking_oddoneout: 'Odd One Out',
            thinking_puzzles: 'Puzzles & Riddles',
            thinking_number_logic: 'Number Logic',
            reading_inference: 'Inference',
            reading_vocabulary: 'Vocabulary',
            reading_main_idea: 'Main Idea',
            reading_detail: 'Finding Details'
        };

        return names[categoryKey] || categoryKey.split('_').slice(1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getSectionEmoji(section) {
        const emojis = { maths: '🔢', thinking: '🧠', reading: '📖' };
        return emojis[section] || '📝';
    }

    // ===== SESSION HISTORY =====

    getRecentSessions(count = 10) {
        return this.data.sessions.slice(0, count);
    }

    getSessionsBySection(section, count = 10) {
        return this.data.sessions
            .filter(s => s.section === section)
            .slice(0, count);
    }

    // Get trend (improving, declining, stable)
    getTrend(section, windowSize = 5) {
        const sessions = this.getSessionsBySection(section, windowSize * 2);
        if (sessions.length < windowSize) return 'insufficient_data';

        const recent = sessions.slice(0, windowSize);
        const older = sessions.slice(windowSize, windowSize * 2);

        if (older.length < windowSize) return 'insufficient_data';

        const recentAvg = recent.reduce((sum, s) => sum + (s.score / s.total), 0) / recent.length;
        const olderAvg = older.reduce((sum, s) => sum + (s.score / s.total), 0) / older.length;

        const diff = recentAvg - olderAvg;

        if (diff > 0.1) return 'improving';
        if (diff < -0.1) return 'declining';
        return 'stable';
    }

    // ===== UTILITY =====

    // Reset all data
    resetAllData() {
        this.data = this.getDefaultData();
        this.saveData();
    }

    // Reset section data
    resetSectionData(section) {
        for (const key of Object.keys(this.data.categoryStats)) {
            if (key.startsWith(section + '_')) {
                this.data.categoryStats[key] = { correct: 0, total: 0, totalTime: 0 };
            }
        }
        this.data.sessions = this.data.sessions.filter(s => s.section !== section);
        this.saveData();
    }

    // Get summary for display
    getSummary() {
        const mathsAcc = this.getOverallSectionAccuracy('maths');
        const thinkingAcc = this.getOverallSectionAccuracy('thinking');
        const readingAcc = this.getOverallSectionAccuracy('reading');

        const weaknesses = this.getWeaknesses(70);
        const strengths = this.getStrengths(80);
        const recommendations = this.getRecommendations();

        let totalQuestions = 0;
        let totalCorrect = 0;
        for (const stats of Object.values(this.data.categoryStats)) {
            totalQuestions += stats.total;
            totalCorrect += stats.correct;
        }

        return {
            sections: {
                maths: mathsAcc,
                thinking: thinkingAcc,
                reading: readingAcc
            },
            overall: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null,
            totalQuestions,
            totalCorrect,
            weaknesses: weaknesses.slice(0, 5),
            strengths: strengths.slice(0, 5),
            recommendations: recommendations.slice(0, 5),
            recentSessions: this.getRecentSessions(5),
            trends: {
                maths: this.getTrend('maths'),
                thinking: this.getTrend('thinking'),
                reading: this.getTrend('reading')
            }
        };
    }
}

// Export for global access
window.OCPerformanceTracker = OCPerformanceTracker;
window.ocPerformance = new OCPerformanceTracker();
console.log('📊 OC Performance Tracker loaded!');
