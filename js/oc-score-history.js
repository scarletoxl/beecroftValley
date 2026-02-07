/**
 * OC Score History — shared storage module
 * Records practice sessions (oc-practice.js) and full tests (oc-test-engine.html)
 * into a single localStorage key so the analysis panel can read from one source.
 */
window.OCScoreHistory = (function() {
    'use strict';

    const STORAGE_KEY = 'ocScoreHistory';
    const MAX_ENTRIES = 100;

    function load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
            console.warn('OCScoreHistory: failed to load', e);
            return [];
        }
    }

    function save(history) {
        try {
            while (history.length > MAX_ENTRIES) history.shift();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
            console.log('OCScoreHistory: saved', history.length, 'entries');
        } catch (e) {
            console.warn('OCScoreHistory: save failed', e);
        }
    }

    function isDuplicate(history, id) {
        return history.some(h => h.id === id);
    }

    return {
        recordPracticeSession: function(section, questions, answers) {
            if (!section || !questions || !answers) return;
            var history = load();
            var id = Date.now();
            if (isDuplicate(history, id)) return;

            var correct = 0;
            var wrong = [];
            questions.forEach(function(q, i) {
                var ans = answers[i];
                if (ans && ans.isCorrect) {
                    correct++;
                } else if (ans) {
                    wrong.push({
                        question: q.q || q.question || '',
                        category: (q.category || 'unknown').toLowerCase(),
                        selectedIndex: ans.selected,
                        correctIndex: q.correct,
                        options: q.options || [],
                        explanation: q.explanation || ''
                    });
                }
            });

            history.push({
                id: id,
                type: 'practice',
                date: new Date().toISOString(),
                section: section,
                total: questions.length,
                correct: correct,
                wrong: wrong
            });
            save(history);
        },

        recordFullTest: function(testNumber, sections) {
            if (!sections) return;
            var history = load();
            var id = Date.now();
            if (isDuplicate(history, id)) return;

            var totalTime = 0;
            ['reading', 'maths', 'thinking'].forEach(function(s) {
                if (sections[s] && sections[s].time) totalTime += sections[s].time;
            });

            history.push({
                id: id,
                type: 'full_test',
                testNumber: testNumber,
                date: new Date().toISOString(),
                totalTime: totalTime,
                sections: sections
            });
            save(history);
        },

        getHistory: function() {
            return load();
        },

        clearHistory: function() {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) {
                console.warn('OCScoreHistory: clear failed', e);
            }
        },

        getSessionCount: function() {
            return load().length;
        }
    };
})();
