/**
 * OC Score Analysis — analysis engine, modal UI, report generator, auto-patching
 * Reads from OCScoreHistory, computes weakness rankings, renders overlay panel.
 */
(function() {
    'use strict';

    // ===== CATEGORY DISPLAY NAMES =====
    var CAT_NAMES = {
        patterns: 'Patterns & Sequences', word: 'Word Problems',
        fractions: 'Fractions', decimals: 'Decimals',
        percentages: 'Percentages', geometry: 'Geometry',
        time: 'Time', money: 'Money',
        place_value: 'Place Value', multistep: 'Multi-step Problems',
        statistics: 'Statistics', measurement: 'Measurement',
        number_logic: 'Number Logic',
        logic: 'Logical Reasoning', analogies: 'Analogies',
        codes: 'Codes & Ciphers', spatial: 'Spatial Reasoning',
        sequences: 'Sequences', find_the_flaw: 'Find the Flaw',
        deductive: 'Deductive Reasoning',
        inference: 'Inference', vocabulary: 'Vocabulary',
        main_idea: 'Main Idea', comprehension: 'Comprehension',
        unknown: 'General'
    };

    var SECTION_ICONS = { reading: '\u{1F4D6}', maths: '\u{1F522}', thinking: '\u{1F9E9}' };
    var SECTION_NAMES = { reading: 'Reading', maths: 'Maths', thinking: 'Thinking' };
    var SECTION_COLORS = { reading: '#e17055', maths: '#00b894', thinking: '#6c5ce7' };

    // ===== INJECT STYLES =====
    function injectStyles() {
        if (document.getElementById('oca-styles')) return;
        var style = document.createElement('style');
        style.id = 'oca-styles';
        style.textContent = '\
.oca-overlay{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:10px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}\
.oca-panel{background:#1a1d27;color:#e2e4ed;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;border-radius:16px;box-shadow:0 25px 50px rgba(0,0,0,0.5);}\
.oca-header{background:linear-gradient(135deg,#6c5ce7,#a855f7);padding:20px 24px;border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center;}\
.oca-header h2{margin:0;font-size:1.3em;color:#fff;}\
.oca-header-sub{color:rgba(255,255,255,0.8);font-size:0.85em;margin-top:4px;}\
.oca-close{background:rgba(255,255,255,0.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:1.2em;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}\
.oca-close:hover{background:rgba(255,255,255,0.35);}\
.oca-body{padding:20px 24px;}\
.oca-overall{text-align:center;margin-bottom:20px;}\
.oca-overall-pct{font-size:2.8em;font-weight:800;margin-bottom:4px;}\
.oca-overall-label{color:#8b8fa3;font-size:0.85em;}\
.oca-bar-bg{background:#2e3345;border-radius:8px;height:12px;margin:10px 0;overflow:hidden;}\
.oca-bar-fill{height:100%;border-radius:8px;transition:width 0.4s ease;}\
.oca-section-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;}\
.oca-sec-card{background:#232733;border-radius:12px;padding:14px;text-align:center;border-top:3px solid transparent;}\
.oca-sec-card .icon{font-size:1.5em;}\
.oca-sec-card .name{font-size:0.8em;color:#8b8fa3;margin:4px 0;}\
.oca-sec-card .pct{font-size:1.6em;font-weight:700;}\
.oca-sec-card .count{font-size:0.75em;color:#8b8fa3;}\
.oca-section-title{font-size:1.1em;font-weight:700;margin:20px 0 12px;}\
.oca-weak-item{background:#232733;border-radius:10px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px;border-left:4px solid transparent;}\
.oca-weak-dot{font-size:0.9em;flex-shrink:0;}\
.oca-weak-info{flex:1;}\
.oca-weak-cat{font-weight:600;font-size:0.9em;}\
.oca-weak-sec{font-size:0.75em;color:#8b8fa3;}\
.oca-weak-badge{background:#2e3345;color:#e2e4ed;border-radius:12px;padding:2px 10px;font-size:0.8em;font-weight:600;flex-shrink:0;}\
.oca-recent{margin-bottom:20px;}\
.oca-recent-item{display:flex;align-items:center;gap:10px;padding:8px 12px;background:#232733;border-radius:8px;margin-bottom:6px;font-size:0.85em;}\
.oca-recent-date{color:#8b8fa3;min-width:70px;}\
.oca-recent-tag{padding:2px 8px;border-radius:6px;font-size:0.75em;font-weight:600;color:#fff;}\
.oca-recent-score{margin-left:auto;font-weight:600;}\
.oca-btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;}\
.oca-btn{border:none;border-radius:10px;padding:12px 20px;font-size:0.9em;font-weight:600;cursor:pointer;flex:1;text-align:center;}\
.oca-btn-copy{background:linear-gradient(135deg,#6c5ce7,#a855f7);color:#fff;}\
.oca-btn-copy:hover{opacity:0.9;}\
.oca-btn-clear{background:#2e3345;color:#8b8fa3;}\
.oca-btn-clear:hover{background:#3a3f55;color:#e2e4ed;}\
.oca-empty{text-align:center;padding:40px 20px;}\
.oca-empty-icon{font-size:3em;margin-bottom:10px;}\
.oca-empty p{color:#8b8fa3;}\
.oca-toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(80px);background:#232733;color:#e2e4ed;padding:14px 24px;border-radius:12px;font-size:0.9em;font-weight:600;z-index:100001;opacity:0;transition:all 0.3s ease;box-shadow:0 8px 24px rgba(0,0,0,0.4);}\
.oca-toast.show{transform:translateX(-50%) translateY(0);opacity:1;}\
.oca-menu-btn{display:block;width:100%;margin-top:12px;padding:12px;background:linear-gradient(135deg,#6c5ce7,#a855f7);color:#fff;border:none;border-radius:10px;font-size:0.95em;font-weight:600;cursor:pointer;}\
.oca-menu-btn:hover{opacity:0.9;}\
.oca-landing-btn{display:block;width:100%;max-width:400px;margin:20px auto 0;padding:16px;background:linear-gradient(135deg,#6c5ce7,#a855f7);color:#fff;border:none;border-radius:12px;font-size:1.1em;font-weight:700;cursor:pointer;box-shadow:0 4px 15px rgba(108,92,231,0.4);}\
.oca-landing-btn:hover{opacity:0.9;transform:translateY(-1px);box-shadow:0 6px 20px rgba(108,92,231,0.5);}\
';
        document.head.appendChild(style);
    }

    // ===== TOAST =====
    var toastEl = null;
    function createToastElement() {
        if (document.getElementById('oca-toast')) return;
        toastEl = document.createElement('div');
        toastEl.id = 'oca-toast';
        toastEl.className = 'oca-toast';
        document.body.appendChild(toastEl);
    }

    function showToast(msg) {
        if (!toastEl) { toastEl = document.getElementById('oca-toast'); }
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        setTimeout(function() { toastEl.classList.remove('show'); }, 2500);
    }

    // ===== ANALYSIS ENGINE =====
    function analyseHistory() {
        var history = window.OCScoreHistory ? window.OCScoreHistory.getHistory() : [];
        if (history.length === 0) return null;

        var result = {
            sessionCount: history.length,
            practiceCount: 0,
            fullTestCount: 0,
            overall: { correct: 0, total: 0 },
            sections: {
                reading:  { correct: 0, total: 0, categories: {} },
                maths:    { correct: 0, total: 0, categories: {} },
                thinking: { correct: 0, total: 0, categories: {} }
            },
            recentSessions: history.slice(-8).reverse(),
            weakCategories: []
        };

        history.forEach(function(entry) {
            if (entry.type === 'practice') {
                result.practiceCount++;
                var sec = result.sections[entry.section];
                if (!sec) return;
                sec.correct += entry.correct || 0;
                sec.total += entry.total || 0;
                result.overall.correct += entry.correct || 0;
                result.overall.total += entry.total || 0;

                (entry.wrong || []).forEach(function(w) {
                    var cat = (w.category || 'unknown').toLowerCase();
                    if (!sec.categories[cat]) sec.categories[cat] = { count: 0, questions: [] };
                    sec.categories[cat].count++;
                    sec.categories[cat].questions.push(w);
                });

            } else if (entry.type === 'full_test') {
                result.fullTestCount++;
                ['reading', 'maths', 'thinking'].forEach(function(secId) {
                    var s = entry.sections && entry.sections[secId];
                    if (!s) return;
                    var sec = result.sections[secId];
                    sec.correct += s.correct || 0;
                    sec.total += s.total || 0;
                    result.overall.correct += s.correct || 0;
                    result.overall.total += s.total || 0;

                    (s.wrong || []).forEach(function(w) {
                        var cat = (w.category || 'unknown').toLowerCase();
                        if (!sec.categories[cat]) sec.categories[cat] = { count: 0, questions: [] };
                        sec.categories[cat].count++;
                        sec.categories[cat].questions.push(w);
                    });
                });
            }
        });

        // Build ranked weakness list
        ['reading', 'maths', 'thinking'].forEach(function(section) {
            Object.keys(result.sections[section].categories).forEach(function(cat) {
                var data = result.sections[section].categories[cat];
                result.weakCategories.push({
                    section: section, category: cat, errorCount: data.count, questions: data.questions
                });
            });
        });
        result.weakCategories.sort(function(a, b) { return b.errorCount - a.errorCount; });

        return result;
    }

    // ===== HELPERS =====
    function pctColor(pct) {
        if (pct >= 85) return '#00b894';
        if (pct >= 70) return '#74b9ff';
        if (pct >= 55) return '#fdcb6e';
        return '#e17055';
    }

    function urgency(count) {
        if (count >= 4) return { dot: '\u{1F534}', color: '#e17055', bg: 'rgba(225,112,85,0.15)' };
        if (count >= 2) return { dot: '\u{1F7E1}', color: '#fdcb6e', bg: 'rgba(253,203,110,0.15)' };
        return { dot: '\u{1F535}', color: '#74b9ff', bg: 'rgba(116,185,255,0.15)' };
    }

    function catName(cat) { return CAT_NAMES[cat] || cat.charAt(0).toUpperCase() + cat.slice(1); }

    function fmtDate(iso) {
        try {
            var d = new Date(iso);
            return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
        } catch (e) { return ''; }
    }

    // ===== SHOW ANALYSIS PANEL =====
    function showAnalysisPanel() {
        // Remove existing panel
        var existing = document.getElementById('oca-overlay');
        if (existing) existing.remove();

        var data = analyseHistory();

        var overlay = document.createElement('div');
        overlay.id = 'oca-overlay';
        overlay.className = 'oca-overlay';
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

        var panel = document.createElement('div');
        panel.className = 'oca-panel';
        panel.onclick = function(e) { e.stopPropagation(); };

        if (!data) {
            panel.innerHTML = buildHeader(0) + '<div class="oca-body"><div class="oca-empty">\
                <div class="oca-empty-icon">\u{1F4DA}</div>\
                <h3>No Sessions Yet</h3>\
                <p>Complete some OC practice sessions or full tests and your results will appear here!</p>\
                <p style="margin-top:12px;color:#6c5ce7;">Try clicking a school in the game for quick practice, or visit the Test Centre for a full 82-question test.</p>\
            </div></div>';
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
            return;
        }

        var overallPct = data.overall.total > 0 ? Math.round((data.overall.correct / data.overall.total) * 100) : 0;

        var html = buildHeader(data.sessionCount);

        // Body
        html += '<div class="oca-body">';

        // Overall score
        html += '<div class="oca-overall">\
            <div class="oca-overall-pct" style="color:' + pctColor(overallPct) + ';">' + overallPct + '%</div>\
            <div class="oca-bar-bg"><div class="oca-bar-fill" style="width:' + overallPct + '%;background:' + pctColor(overallPct) + ';"></div></div>\
            <div class="oca-overall-label">' + data.overall.correct + '/' + data.overall.total + ' correct across ' + data.sessionCount + ' sessions</div>\
        </div>';

        // Section cards
        html += '<div class="oca-section-grid">';
        ['reading', 'maths', 'thinking'].forEach(function(secId) {
            var s = data.sections[secId];
            var sPct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            html += '<div class="oca-sec-card" style="border-top-color:' + SECTION_COLORS[secId] + ';">\
                <div class="icon">' + SECTION_ICONS[secId] + '</div>\
                <div class="name">' + SECTION_NAMES[secId] + '</div>\
                <div class="pct" style="color:' + pctColor(sPct) + ';">' + sPct + '%</div>\
                <div class="count">' + s.correct + '/' + s.total + '</div>\
            </div>';
        });
        html += '</div>';

        // Weakness ranking
        if (data.weakCategories.length > 0) {
            html += '<div class="oca-section-title">\u{1F3AF} Areas That Need Practice</div>';
            var shown = data.weakCategories.slice(0, 8);
            shown.forEach(function(w) {
                var u = urgency(w.errorCount);
                html += '<div class="oca-weak-item" style="border-left-color:' + u.color + ';background:' + u.bg + ';">\
                    <span class="oca-weak-dot">' + u.dot + '</span>\
                    <div class="oca-weak-info">\
                        <div class="oca-weak-cat">' + catName(w.category) + '</div>\
                        <div class="oca-weak-sec">' + SECTION_ICONS[w.section] + ' ' + SECTION_NAMES[w.section] + '</div>\
                    </div>\
                    <span class="oca-weak-badge">' + w.errorCount + ' error' + (w.errorCount !== 1 ? 's' : '') + '</span>\
                </div>';
            });
        }

        // Recent sessions
        if (data.recentSessions.length > 0) {
            html += '<div class="oca-section-title">\u{1F4C5} Recent Sessions</div><div class="oca-recent">';
            data.recentSessions.forEach(function(entry) {
                var date = fmtDate(entry.date);
                var tag, tagColor, score;
                if (entry.type === 'practice') {
                    tag = SECTION_NAMES[entry.section] || entry.section;
                    tagColor = SECTION_COLORS[entry.section] || '#6c5ce7';
                    var pPct = entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
                    score = entry.correct + '/' + entry.total + ' (' + pPct + '%)';
                } else {
                    tag = 'Full Test ' + (entry.testNumber || '?');
                    tagColor = '#6c5ce7';
                    var tc = 0, tt = 0;
                    ['reading', 'maths', 'thinking'].forEach(function(s) {
                        if (entry.sections && entry.sections[s]) {
                            tc += entry.sections[s].correct || 0;
                            tt += entry.sections[s].total || 0;
                        }
                    });
                    var fPct = tt > 0 ? Math.round((tc / tt) * 100) : 0;
                    score = tc + '/' + tt + ' (' + fPct + '%)';
                }
                html += '<div class="oca-recent-item">\
                    <span class="oca-recent-date">' + date + '</span>\
                    <span class="oca-recent-tag" style="background:' + tagColor + ';">' + tag + '</span>\
                    <span class="oca-recent-score">' + score + '</span>\
                </div>';
            });
            html += '</div>';
        }

        // Button row
        html += '<div class="oca-btn-row">\
            <button class="oca-btn oca-btn-copy" id="oca-copy-btn">\u{1F4CB} Copy Report for Dad</button>\
            <button class="oca-btn oca-btn-clear" id="oca-clear-btn">\u{1F5D1}\uFE0F Clear History</button>\
        </div>';

        html += '</div>'; // close body
        panel.innerHTML = html;
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // Bind buttons
        document.getElementById('oca-copy-btn').onclick = function() { copyReport(data, overallPct); };
        document.getElementById('oca-clear-btn').onclick = function() {
            if (confirm('Clear all score history? This cannot be undone.')) {
                if (window.OCScoreHistory) window.OCScoreHistory.clearHistory();
                showToast('\u{1F5D1}\uFE0F History cleared');
                overlay.remove();
            }
        };
    }

    function buildHeader(count) {
        var dateStr = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
        return '<div class="oca-header"><div>\
            <h2>\u{1F4CA} Score Analysis</h2>\
            <div class="oca-header-sub">' + dateStr + ' \u2022 ' + count + ' session' + (count !== 1 ? 's' : '') + ' recorded</div>\
        </div><button class="oca-close" id="oca-close-btn" onclick="document.getElementById(\'oca-overlay\').remove();">\u2715</button></div>';
    }

    // ===== REPORT GENERATOR =====
    function copyReport(data, overallPct) {
        var lines = [];
        lines.push('\u{1F4CA} OC SCORE ANALYSIS \u2014 Wei Wei');
        lines.push('Generated: ' + new Date().toLocaleString('en-AU'));
        lines.push('Sessions: ' + data.sessionCount + ' (' + data.fullTestCount + ' full tests, ' + data.practiceCount + ' practice sessions)');
        lines.push('');
        lines.push('\u2550\u2550\u2550 OVERALL: ' + data.overall.correct + '/' + data.overall.total + ' (' + overallPct + '%) \u2550\u2550\u2550');
        lines.push('');

        ['reading', 'maths', 'thinking'].forEach(function(secId) {
            var s = data.sections[secId];
            var sPct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            lines.push(SECTION_ICONS[secId] + ' ' + SECTION_NAMES[secId] + ':  ' + s.correct + '/' + s.total + ' (' + sPct + '%)');
        });

        lines.push('');
        lines.push('\u2550\u2550\u2550 \u{1F3AF} WEAKNESS RANKING \u2550\u2550\u2550');
        lines.push('');

        var critical = data.weakCategories.filter(function(w) { return w.errorCount >= 4; });
        var needsWork = data.weakCategories.filter(function(w) { return w.errorCount >= 2 && w.errorCount < 4; });
        var minor = data.weakCategories.filter(function(w) { return w.errorCount === 1; });

        if (critical.length > 0) {
            lines.push('\u{1F534} CRITICAL:');
            critical.forEach(function(w) {
                lines.push('  [' + SECTION_NAMES[w.section].toUpperCase() + '] ' + catName(w.category) + ' \u2014 ' + w.errorCount + ' errors');
            });
            lines.push('');
        }
        if (needsWork.length > 0) {
            lines.push('\u{1F7E1} NEEDS WORK:');
            needsWork.forEach(function(w) {
                lines.push('  [' + SECTION_NAMES[w.section].toUpperCase() + '] ' + catName(w.category) + ' \u2014 ' + w.errorCount + ' errors');
            });
            lines.push('');
        }
        if (minor.length > 0) {
            lines.push('\u{1F535} MINOR:');
            minor.forEach(function(w) {
                lines.push('  [' + SECTION_NAMES[w.section].toUpperCase() + '] ' + catName(w.category) + ' \u2014 ' + w.errorCount + ' error');
            });
            lines.push('');
        }

        // Sample wrong questions (only those with actual question text, not migrated stubs)
        var allWrong = [];
        data.weakCategories.forEach(function(w) {
            w.questions.forEach(function(q) {
                if (q.question) allWrong.push({ section: w.section, category: w.category, q: q });
            });
        });
        var sampleWrong = allWrong.slice(0, 15);
        if (sampleWrong.length > 0) {
            lines.push('\u2550\u2550\u2550 \u274C SAMPLE WRONG QUESTIONS \u2550\u2550\u2550');
            lines.push('');
            sampleWrong.forEach(function(item) {
                var q = item.q;
                var qText = (q.question || '').replace(/\n/g, ' ').substring(0, 120);
                lines.push('[' + SECTION_NAMES[item.section].toUpperCase() + ' - ' + item.category + '] "' + qText + '"');
                var selectedLabel = q.selectedIndex !== undefined && q.options && q.options[q.selectedIndex]
                    ? q.options[q.selectedIndex] : 'Not answered';
                var correctLabel = q.options && q.options[q.correctIndex] ? q.options[q.correctIndex] : '?';
                lines.push('  Answered: ' + selectedLabel + ' \u2192 Correct: ' + correctLabel);
                if (q.explanation) {
                    lines.push('  \u{1F4A1} ' + q.explanation.substring(0, 120));
                }
                lines.push('');
            });
        }

        lines.push('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
        lines.push('\u{1F4CC} Paste this into Claude and say:');
        lines.push('"Based on this score analysis, generate targeted');
        lines.push('OC practice questions focusing on the weak areas,');
        lines.push('with step-by-step explanations. Output as JSON');
        lines.push('for the test engine."');
        lines.push('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');

        var text = lines.join('\n');

        // Copy to clipboard with fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                showToast('\u2705 Copied! Send this to Dad \u{1F4F1}');
            }).catch(function() {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('\u2705 Copied! Send this to Dad \u{1F4F1}');
        } catch (e) {
            showToast('\u274C Could not copy \u2014 try manually');
        }
        document.body.removeChild(ta);
    }

    // ===== PATCHING OC-PRACTICE.JS =====
    function patchOCPractice() {
        if (!window.ocTest || !window.ocTest.showResults) return;
        if (window.ocTest._ocaPatched) return;
        var orig = window.ocTest.showResults.bind(window.ocTest);
        window.ocTest.showResults = function() {
            if (window.OCScoreHistory) {
                try {
                    window.OCScoreHistory.recordPracticeSession(
                        this.currentSection,
                        this.sessionQuestions,
                        this.sessionAnswers
                    );
                } catch (e) { console.warn('Score history: record failed', e); }
            }
            orig();
        };
        window.ocTest._ocaPatched = true;
    }

    // ===== PATCHING OC-TEST-ENGINE =====
    function patchTestEngine() {
        var attempts = 0;
        function tryPatch() {
            if (typeof window.renderResults !== 'function') {
                if (++attempts < 25) setTimeout(tryPatch, 200);
                return;
            }
            if (window._ocaTestPatched) return;

            var origRenderResults = window.renderResults;
            window.renderResults = function(app) {
                origRenderResults(app);

                // Record the test
                if (window.OCScoreHistory && window.state && window.state.questions) {
                    try {
                        var testNum = parseInt(new URLSearchParams(window.location.search).get('test')) || 0;
                        var sectionsData = {};

                        ['reading', 'maths', 'thinking'].forEach(function(secId) {
                            var qs = state.questions[secId] || [];
                            var ans = state.answers[secId] || [];
                            var correct = 0;
                            var wrong = [];

                            qs.forEach(function(q, i) {
                                if (ans[i] === q.correct) {
                                    correct++;
                                } else {
                                    wrong.push({
                                        question: (q.question || '').replace(/\n/g, ' '),
                                        category: (q.category || 'unknown').toLowerCase(),
                                        selectedIndex: ans[i],
                                        correctIndex: q.correct,
                                        options: q.options || [],
                                        explanation: q.explanation || ''
                                    });
                                }
                            });

                            sectionsData[secId] = {
                                correct: correct,
                                total: qs.length,
                                time: (state.times && state.times[secId]) || 0,
                                wrong: wrong
                            };
                        });

                        window.OCScoreHistory.recordFullTest(testNum, sectionsData);
                    } catch (e) { console.warn('Score history: record failed', e); }
                }

                // Inject analysis button into results view
                var resultsDiv = app || document.getElementById('app');
                if (resultsDiv) {
                    var navRow = resultsDiv.querySelector('div[style*="margin-top:25px"]');
                    if (navRow) {
                        var btn = document.createElement('button');
                        btn.className = 'btn btn-outline';
                        btn.style.cssText = 'background:linear-gradient(135deg,#6c5ce7,#a855f7);color:white;border:none;';
                        btn.textContent = '\u{1F4CA} Score Analysis';
                        btn.onclick = function() { showAnalysisPanel(); };
                        navRow.appendChild(btn);
                    }
                }
            };
            window._ocaTestPatched = true;
        }
        tryPatch();
    }

    // ===== INJECT INTO OC.HTML TEST CENTRE =====
    function injectTestCentreButton() {
        var header = document.querySelector('.header');
        if (!header) return;

        var btn = document.createElement('button');
        btn.className = 'oca-landing-btn';
        btn.textContent = '\u{1F4CA} Score Analysis';
        btn.onclick = function() { showAnalysisPanel(); };

        var statsRow = header.querySelector('.stats-row');
        if (statsRow) statsRow.after(btn);
        else header.appendChild(btn);
    }

    // ===== INJECT INTO IN-GAME OC MENU =====
    function injectMenuButton() {
        var attempts = 0;
        function tryInject() {
            var menu = document.getElementById('oc-menu');
            if (!menu) {
                if (++attempts < 20) setTimeout(tryInject, 300);
                return;
            }
            if (menu.querySelector('.oca-menu-btn')) return;

            var btn = document.createElement('button');
            btn.className = 'oca-menu-btn';
            btn.textContent = '\u{1F4CA} Score Analysis';
            btn.onclick = function() { showAnalysisPanel(); };
            menu.appendChild(btn);
        }
        tryInject();
    }

    // ===== INITIALIZATION =====
    injectStyles();
    createToastElement();

    // Determine context
    function initContext() {
        // In-game OC practice
        if (window.ocTest) {
            patchOCPractice();
            injectMenuButton();
        }

        // oc.html test centre landing page
        if (document.getElementById('tests-grid')) {
            injectTestCentreButton();
        }

        // oc-test-engine.html
        if (typeof window.renderResults === 'function' ||
            document.querySelector('[onclick="startTest()"]') ||
            new URLSearchParams(window.location.search).has('test')) {
            patchTestEngine();
        }
    }

    // Run immediately, then retry for late-loading globals
    initContext();
    setTimeout(function() {
        if (window.ocTest && !window.ocTest._ocaPatched) {
            patchOCPractice();
            injectMenuButton();
        }
    }, 1000);
    setTimeout(function() {
        if (window.ocTest && !window.ocTest._ocaPatched) {
            patchOCPractice();
            injectMenuButton();
        }
    }, 3000);

})();
