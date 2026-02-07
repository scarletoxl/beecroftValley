/**
 * OC Score History — shared storage module
 * Records practice sessions (oc-practice.js) and full tests (oc-test-engine.html)
 * into a single localStorage key so the analysis panel can read from one source.
 *
 * On first load, migrates existing data from:
 *   - ocTestScoreHistory (full test results from oc-test-engine.html)
 *   - ocPerformanceData  (practice sessions from oc-performance-tracker.js)
 */
window.OCScoreHistory = (function() {
    'use strict';

    var STORAGE_KEY = 'ocScoreHistory';
    var MIGRATED_KEY = 'ocScoreHistory_migrated';
    var MAX_ENTRIES = 100;

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
        return history.some(function(h) { return h.id === id; });
    }

    // ===== MIGRATION: import existing historical data =====
    function migrateExistingData() {
        if (localStorage.getItem(MIGRATED_KEY)) return; // already done

        var history = load();
        var imported = 0;

        // 1. Import from ocTestScoreHistory (full test results)
        try {
            var testHistory = JSON.parse(localStorage.getItem('ocTestScoreHistory') || '[]');
            testHistory.forEach(function(entry) {
                if (!entry.timestamp) return;
                // Use timestamp as id to avoid duplicates
                var id = entry.timestamp;
                if (isDuplicate(history, id)) return;

                // Build sections with correct/total (no per-question detail available)
                var sections = {};
                ['reading', 'maths', 'thinking'].forEach(function(secId) {
                    var correct = entry[secId];
                    var total = entry[secId + 'Total'];
                    if (typeof correct === 'number' && typeof total === 'number') {
                        sections[secId] = {
                            correct: correct,
                            total: total,
                            time: 0,
                            wrong: [] // no per-question detail in legacy data
                        };
                    }
                });

                history.push({
                    id: id,
                    type: 'full_test',
                    testNumber: entry.testNumber || 0,
                    date: new Date(entry.timestamp).toISOString(),
                    totalTime: 0,
                    sections: sections,
                    migrated: true
                });
                imported++;
            });
        } catch (e) {
            console.warn('OCScoreHistory: migration of ocTestScoreHistory failed', e);
        }

        // 2. Import from ocPerformanceData (practice sessions)
        try {
            var perfData = JSON.parse(localStorage.getItem('ocPerformanceData') || 'null');
            if (perfData && perfData.sessions && perfData.sessions.length > 0) {
                perfData.sessions.forEach(function(session) {
                    if (!session.date) return;
                    var id = session.date; // timestamp used as date field
                    if (isDuplicate(history, id)) return;

                    var correct = session.score || 0;
                    var total = session.total || 0;
                    var section = session.section || 'maths';

                    // Build wrong list from per-question data
                    var wrong = [];
                    if (session.questions && session.questions.length > 0) {
                        session.questions.forEach(function(q) {
                            if (!q.isCorrect) {
                                wrong.push({
                                    question: '', // not available in legacy data
                                    category: (q.category || 'unknown').toLowerCase(),
                                    selectedIndex: undefined,
                                    correctIndex: undefined,
                                    options: [],
                                    explanation: ''
                                });
                            }
                        });
                    }

                    history.push({
                        id: id,
                        type: 'practice',
                        date: new Date(id).toISOString(),
                        section: section,
                        total: total,
                        correct: correct,
                        wrong: wrong,
                        migrated: true
                    });
                    imported++;
                });
            }
        } catch (e) {
            console.warn('OCScoreHistory: migration of ocPerformanceData failed', e);
        }

        // Sort by id (timestamp) to maintain chronological order
        history.sort(function(a, b) { return a.id - b.id; });

        if (imported > 0) {
            save(history);
            console.log('OCScoreHistory: migrated', imported, 'historical entries');
        }

        // Mark migration as done so we don't re-import
        try {
            localStorage.setItem(MIGRATED_KEY, '1');
        } catch (e) { /* ignore */ }
    }

    // Run migration immediately on load
    migrateExistingData();

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
                localStorage.removeItem(MIGRATED_KEY); // allow re-migration if history re-appears
            } catch (e) {
                console.warn('OCScoreHistory: clear failed', e);
            }
        },

        getSessionCount: function() {
            return load().length;
        }
    };
})();
