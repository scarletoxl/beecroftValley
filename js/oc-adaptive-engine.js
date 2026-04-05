// Scarlet's 7-Day Adaptive OC Intensive - Engine
// Dashboard, test runner, adaptive tracking, 7-day system

(function() {
'use strict';

const STORAGE_KEY = 'scarletAdaptiveOC';
const SECTIONS = ['reading','maths','thinking'];
const SECTION_META = {
    reading: { icon: '📖', name: 'Reading', color: '#ef4444', questions: 10, time: 12 },
    maths: { icon: '🔢', name: 'Maths', color: '#22c55e', questions: 15, time: 18 },
    thinking: { icon: '🧩', name: 'Thinking Skills', color: '#3b82f6', questions: 10, time: 12 }
};
const TEST_LABELS = ['Morning','Afternoon','Evening'];
const TEST_ICONS = ['🌅','☀️','🌙'];
const MATHS_CATS = ['patterns','word','fractions','time','geometry','place_value','percentages','multistep','averages','ratios'];
const THINKING_CATS = ['logic','analogies','codes','sequences','spatial','flaw','truthliar','constraint','conditional','venn'];
const CAT_NAMES = {
    patterns:'Patterns',word:'Word Problems',fractions:'Fractions',time:'Time',geometry:'Geometry',
    place_value:'Place Value',percentages:'Percentages',multistep:'Multi-step',averages:'Averages',ratios:'Ratios',
    logic:'Logic',analogies:'Analogies',codes:'Codes & Ciphers',sequences:'Sequences',spatial:'Spatial',
    flaw:'Find the Flaw',truthliar:'Truth & Liar',constraint:'Elimination',conditional:'Conditionals',venn:'Venn Diagrams',
    inference:'Inference',vocabulary:'Vocabulary',main_idea:'Main Idea',detail:'Detail',comprehension:'Comprehension'
};

// ===== DATA =====
function getDefaultData() {
    const tests = {};
    for (let d = 1; d <= 7; d++) for (let t = 1; t <= 3; t++) {
        tests[`${d}-${t}`] = { completed: false, score: null, total: null, answers: [], sectionScores: {} };
    }
    const categoryStats = {};
    [...MATHS_CATS, ...THINKING_CATS, 'inference','vocabulary','main_idea','detail','comprehension'].forEach(c => {
        categoryStats[c] = { correct: 0, total: 0 };
    });
    return { currentDay: 1, selectedDay: 1, tests, categoryStats, dailyScores: {}, startDate: new Date().toISOString().slice(0,10) };
}

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const d = JSON.parse(saved);
            const def = getDefaultData();
            return { ...def, ...d, tests: { ...def.tests, ...d.tests }, categoryStats: { ...def.categoryStats, ...d.categoryStats } };
        }
    } catch(e) { console.error('Load error:', e); }
    return getDefaultData();
}

function saveData(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) { console.error('Save error:', e); }
}

let DATA = loadData();
let STATE = { view: 'dashboard', testKey: null, sectionIdx: 0, questionIdx: 0, questions: [], answers: [], timer: null, timeLeft: 0, sectionAnswers: {} };

const app = document.getElementById('app');

// ===== ADAPTIVE LOGIC =====
function getWeakCategories(count = 5) {
    const cats = [];
    Object.entries(DATA.categoryStats).forEach(([cat, stats]) => {
        if (stats.total >= 2) {
            cats.push({ cat, pct: Math.round(stats.correct / stats.total * 100), total: stats.total });
        }
    });
    cats.sort((a, b) => a.pct - b.pct);
    return cats.slice(0, count);
}

function getAdaptiveWeights(section) {
    const day = DATA.selectedDay || DATA.currentDay;
    if (day <= 2) return null; // Baseline days - equal distribution

    const allCats = section === 'maths' ? MATHS_CATS : THINKING_CATS;
    const weak = getWeakCategories(10).filter(w => allCats.includes(w.cat));
    if (weak.length === 0) return null;

    const weights = {};
    allCats.forEach(c => weights[c] = 1);
    weak.forEach((w, i) => { weights[w.cat] = 4 - i * 0.5; }); // Heavier weight on weakest
    return weights;
}

function pickWeightedCategory(weights) {
    if (!weights) return null;
    const entries = Object.entries(weights);
    const totalWeight = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * totalWeight;
    for (const [cat, w] of entries) { r -= w; if (r <= 0) return cat; }
    return entries[entries.length - 1][0];
}

// ===== QUESTION GENERATION =====
function generateTestQuestions(testKey) {
    const questions = [];
    const day = parseInt(testKey.split('-')[0]);

    // READING
    const readingQs = generateReadingQuestions(day);
    questions.push(...readingQs);

    // MATHS
    const mathsWeights = day > 2 ? getAdaptiveWeights('maths') : null;
    for (let i = 0; i < 15; i++) {
        const cat = pickWeightedCategory(mathsWeights);
        try {
            const q = window.hardOCGen.generateHardMathsQuestion(cat);
            q.section = 'maths';
            questions.push(q);
        } catch(e) {
            questions.push({ q: 'What is 144 ÷ 12?', options: ['10','11','12','13'], correct: 2, explanation: '144 ÷ 12 = 12', category: 'word', section: 'maths', difficulty: 'hard' });
        }
    }

    // THINKING
    const thinkingWeights = day > 2 ? getAdaptiveWeights('thinking') : null;
    for (let i = 0; i < 10; i++) {
        const cat = pickWeightedCategory(thinkingWeights);
        try {
            const q = window.hardOCGen.generateHardThinkingQuestion(cat);
            q.section = 'thinking';
            questions.push(q);
        } catch(e) {
            questions.push({ q: 'FAST is to SLOW as HOT is to ___?', options: ['WARM','COLD','HEAT','FIRE'], correct: 1, explanation: 'FAST/SLOW are opposites, like HOT/COLD', category: 'analogies', section: 'thinking', difficulty: 'hard' });
        }
    }

    return questions;
}

function generateReadingQuestions(day) {
    const passages = window.HARD_PASSAGES;
    if (!passages || passages.length === 0) {
        // Fallback: generate reasoning questions
        const qs = [];
        for (let i = 0; i < 10; i++) {
            try {
                const q = window.hardOCGen.generateHardThinkingQuestion();
                q.section = 'reading';
                qs.push(q);
            } catch(e) {
                qs.push({ q: 'What is the main purpose of a conclusion in an essay?', options: ['To introduce new ideas','To summarise key points','To provide evidence','To ask questions'], correct: 1, explanation: 'A conclusion summarises the key points.', category: 'comprehension', section: 'reading', difficulty: 'hard' });
            }
        }
        return qs;
    }

    // Pick 2 random passages
    const shuffled = [...passages].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(2, shuffled.length));
    const qs = [];
    selected.forEach(p => {
        const pqs = (p.questions || []).slice(0, 5);
        pqs.forEach(pq => {
            qs.push({ ...pq, section: 'reading', difficulty: 'hard', passageId: p.id, passageTitle: p.title, passageText: p.text, category: pq.category || 'comprehension' });
        });
    });
    // Pad if needed
    while (qs.length < 10 && passages.length > 0) {
        const p = passages[Math.floor(Math.random() * passages.length)];
        const pq = p.questions[Math.floor(Math.random() * p.questions.length)];
        qs.push({ ...pq, section: 'reading', difficulty: 'hard', passageId: p.id, passageTitle: p.title, passageText: p.text, category: pq.category || 'comprehension' });
    }
    return qs.slice(0, 10);
}


// ===== RENDERING =====
function render() {
    if (STATE.view === 'dashboard') renderDashboard();
    else if (STATE.view === 'section-intro') renderSectionIntro();
    else if (STATE.view === 'question') renderQuestion();
    else if (STATE.view === 'section-transition') renderSectionTransition();
    else if (STATE.view === 'results') renderResults();
}

function renderDashboard() {
    const day = DATA.selectedDay || DATA.currentDay;
    const totalTests = Object.values(DATA.tests).filter(t => t.completed).length;
    const weak = getWeakCategories(5);

    let html = `<h1>Scarlet's 7-Day OC Intensive</h1>`;
    html += `<p class="subtitle">Day ${DATA.currentDay} of 7 &bull; ${totalTests}/21 tests completed</p>`;

    // Day grid
    html += '<div class="day-grid">';
    for (let d = 1; d <= 7; d++) {
        const testsForDay = [1,2,3].map(t => DATA.tests[`${d}-${t}`]);
        const completedCount = testsForDay.filter(t => t.completed).length;
        const isCompleted = completedCount === 3;
        const isLocked = d > DATA.currentDay;
        const isActive = d === day;
        let cls = 'day-cell';
        if (isActive) cls += ' active';
        if (isCompleted) cls += ' completed';
        if (isLocked) cls += ' locked';
        html += `<div class="${cls}" data-action="selectDay" data-day="${d}">`;
        html += `<div class="day-num">${d}</div>`;
        html += `<div class="day-label">${d<=2?'Baseline':'Adaptive'}</div>`;
        html += '<div class="day-dots">';
        for (let t = 1; t <= 3; t++) {
            const test = DATA.tests[`${d}-${t}`];
            const dotCls = test.completed ? 'done' : (d === DATA.currentDay && !test.completed && (t===1 || DATA.tests[`${d}-${t-1}`].completed) ? 'current' : '');
            html += `<div class="day-dot ${dotCls}"></div>`;
        }
        html += '</div></div>';
    }
    html += '</div>';

    // Adaptive banner for days 3+
    if (day > 2 && weak.length > 0) {
        html += `<div class="adaptive-banner"><div class="ab-icon">🎯</div><div class="ab-text"><strong>Adaptive Mode</strong> — Today's tests focus more on your weak areas: ${weak.slice(0,3).map(w => CAT_NAMES[w.cat] || w.cat).join(', ')}. Keep pushing!</div></div>`;
    }

    // Test slots
    html += '<div class="test-slots">';
    for (let t = 1; t <= 3; t++) {
        const key = `${day}-${t}`;
        const test = DATA.tests[key];
        const isLocked = day > DATA.currentDay || (t > 1 && !DATA.tests[`${day}-${t-1}`].completed);
        let cls = `test-slot${test.completed ? ' completed' : ''}${isLocked ? ' locked' : ''}`;
        html += `<div class="${cls}" data-action="startTest" data-key="${key}">`;
        html += `<div class="slot-icon">${TEST_ICONS[t-1]}</div>`;
        html += `<div class="slot-label">${TEST_LABELS[t-1]} Test</div>`;
        html += `<div class="slot-meta">35 questions &bull; ~42 min</div>`;
        if (test.completed && test.score !== null) {
            const pct = Math.round(test.score / test.total * 100);
            html += `<div class="slot-badge">${pct}%</div>`;
        }
        if (day > 2 && !test.completed && !isLocked && weak.length > 0) {
            html += '<div class="slot-focus">';
            weak.slice(0,2).forEach(w => {
                const cls = w.pct < 40 ? 'high' : w.pct < 60 ? 'medium' : 'good';
                html += `<span class="focus-tag ${cls}">${CAT_NAMES[w.cat] || w.cat} ${w.pct}%</span>`;
            });
            html += '</div>';
        }
        html += '</div>';
    }
    html += '</div>';

    // Weakness panel
    if (weak.length > 0) {
        html += '<div class="weakness-panel"><div class="wp-title">📊 Weakest Categories</div>';
        weak.forEach(w => {
            const fillCls = w.pct < 40 ? 'red' : w.pct < 65 ? 'orange' : 'green';
            const color = w.pct < 40 ? '#ef4444' : w.pct < 65 ? '#f59e0b' : '#22c55e';
            html += `<div class="wp-row"><div class="wp-label">${CAT_NAMES[w.cat]||w.cat}</div>`;
            html += `<div class="wp-track"><div class="wp-fill" style="width:${w.pct}%;background:${color}"></div></div>`;
            html += `<div class="wp-pct" style="color:${color}">${w.pct}%</div></div>`;
        });
        html += '</div>';
    }

    // Evolution chart
    const dayScores = DATA.dailyScores;
    if (Object.keys(dayScores).length > 0) {
        html += '<div class="evo-chart"><div class="evo-title">📈 Daily Score Trends</div>';
        ['reading','maths','thinking'].forEach(sec => {
            const meta = SECTION_META[sec];
            html += `<div class="evo-row"><div class="evo-label">${meta.icon} ${meta.name}</div><div class="evo-bars">`;
            for (let d = 1; d <= 7; d++) {
                const ds = dayScores[d];
                if (ds && ds[sec] !== undefined && ds.count > 0) {
                    const pct = Math.round(ds[sec] / ds.count);
                    html += `<div class="evo-bar" style="height:${Math.max(pct, 5)}%;background:${meta.color}" data-tip="Day ${d}: ${pct}%"></div>`;
                } else {
                    html += `<div class="evo-bar" style="height:3%;background:#475569"></div>`;
                }
            }
            html += '</div></div>';
        });
        html += '</div>';
    }

    // Reset button
    html += '<div style="text-align:center;margin-top:20px"><button class="btn btn-ghost" data-action="resetData" style="font-size:0.8em">🗑️ Reset All Progress</button></div>';

    app.innerHTML = html;
}


function renderSectionIntro() {
    const sec = SECTIONS[STATE.sectionIdx];
    const meta = SECTION_META[sec];
    const sectionQs = STATE.questions.filter(q => q.section === sec);
    app.innerHTML = `
        <div class="section-trans">
            <div class="big-icon">${meta.icon}</div>
            <h2>${meta.name}</h2>
            <p class="st-meta">Section ${STATE.sectionIdx + 1} of 3</p>
            <div class="st-info">
                <span class="st-pill">${sectionQs.length} Questions</span>
                <span class="st-pill">${meta.time} Minutes</span>
            </div>
            <p style="color:#94a3b8;margin-bottom:24px;font-size:0.9em">
                ${sec === 'reading' ? 'Read each passage carefully, then answer the questions.' :
                  sec === 'maths' ? 'Show your working mentally. No calculator allowed.' :
                  'Think logically and carefully about each question.'}
            </p>
            <button class="btn btn-start" data-action="beginSection">Begin ${meta.name}</button>
        </div>`;
}

function renderQuestion() {
    const sec = SECTIONS[STATE.sectionIdx];
    const meta = SECTION_META[sec];
    const sectionQs = STATE.questions.filter(q => q.section === sec);
    const qi = STATE.questionIdx;
    const q = sectionQs[qi];
    if (!q) { finishSection(); return; }

    const answered = STATE.answers[getGlobalIdx(sec, qi)] !== undefined;
    const selectedIdx = STATE.answers[getGlobalIdx(sec, qi)];
    const mins = Math.floor(STATE.timeLeft / 60);
    const secs = STATE.timeLeft % 60;
    const timerCls = STATE.timeLeft < 60 ? 'danger' : STATE.timeLeft < 180 ? 'warning' : '';
    const progress = ((qi + 1) / sectionQs.length * 100).toFixed(0);

    let html = `<div class="test-header">
        <div class="section-badge">
            <div class="section-icon ${sec}">${meta.icon}</div>
            <div><strong>${meta.name}</strong><br><span style="font-size:0.8em;color:#94a3b8">Test ${STATE.testKey}</span></div>
        </div>
        <div class="timer-box">
            <div class="timer ${timerCls}">${mins}:${secs.toString().padStart(2,'0')}</div>
            <div class="timer-label">remaining</div>
        </div>
    </div>`;

    html += `<div class="progress-row">
        <div class="progress-bg"><div class="progress-fill ${sec}" style="width:${progress}%"></div></div>
        <span class="progress-text">Q${qi+1}/${sectionQs.length}</span>
    </div>`;

    // Passage for reading
    if (sec === 'reading' && q.passageText) {
        html += `<div class="passage-box"><div class="passage-title">📄 ${q.passageTitle || 'Passage'}</div><div class="passage-text">${q.passageText}</div></div>`;
    }

    // Question
    html += `<div class="q-box">`;
    html += `<div class="q-num"><span>Question ${qi+1} of ${sectionQs.length}</span><span class="q-category">${CAT_NAMES[q.category] || q.category}</span></div>`;
    html += `<div class="q-text">${q.q}</div>`;
    html += '<div class="options">';
    const letters = ['A','B','C','D'];
    q.options.forEach((opt, i) => {
        let cls = 'option';
        if (answered) {
            cls += ' disabled';
            if (i === q.correct) cls += ' correct';
            else if (i === selectedIdx && i !== q.correct) cls += ' incorrect';
        } else if (selectedIdx === i) {
            cls += ' selected';
        }
        html += `<div class="${cls}" data-action="selectOption" data-idx="${i}"><div class="opt-letter">${letters[i]}</div><span>${opt}</span></div>`;
    });
    html += '</div>';

    // Explanation
    if (answered) {
        html += `<div class="explanation show">${q.explanation || 'No explanation available.'}</div>`;
    }
    html += '</div>';

    // Nav
    html += '<div class="nav-row">';
    html += `<span style="font-size:0.82em;color:#64748b">${sec === 'reading' ? '📖' : sec === 'maths' ? '🔢' : '🧩'} Section ${STATE.sectionIdx+1}/3</span>`;
    if (answered) {
        const isLast = qi >= sectionQs.length - 1;
        const isLastSection = STATE.sectionIdx >= 2;
        if (isLast && isLastSection) {
            html += `<button class="btn btn-success" data-action="finishTest">Finish Test</button>`;
        } else if (isLast) {
            html += `<button class="btn btn-primary" data-action="nextSection">Next Section →</button>`;
        } else {
            html += `<button class="btn btn-primary" data-action="nextQuestion">Next →</button>`;
        }
    }
    html += '</div>';

    app.innerHTML = html;
}

function renderSectionTransition() {
    const prevSec = SECTIONS[STATE.sectionIdx - 1];
    const nextSec = SECTIONS[STATE.sectionIdx];
    const prevMeta = SECTION_META[prevSec];
    const nextMeta = SECTION_META[nextSec];

    const prevQs = STATE.questions.filter(q => q.section === prevSec);
    let prevCorrect = 0;
    prevQs.forEach((q, i) => {
        const gi = getGlobalIdx(prevSec, i);
        if (STATE.answers[gi] === q.correct) prevCorrect++;
    });

    app.innerHTML = `
        <div class="section-trans">
            <div class="big-icon">✅</div>
            <h2>${prevMeta.name} Complete!</h2>
            <p class="st-meta">${prevCorrect}/${prevQs.length} correct (${Math.round(prevCorrect/prevQs.length*100)}%)</p>
            <div style="margin:20px 0;padding:20px;background:#334155;border-radius:12px">
                <p style="margin-bottom:12px">Up next:</p>
                <div style="font-size:2em;margin-bottom:8px">${nextMeta.icon}</div>
                <h2>${nextMeta.name}</h2>
                <div class="st-info" style="margin-top:12px">
                    <span class="st-pill">${STATE.questions.filter(q=>q.section===nextSec).length} Questions</span>
                    <span class="st-pill">${nextMeta.time} Minutes</span>
                </div>
            </div>
            <button class="btn btn-start" data-action="beginSection">Begin ${nextMeta.name}</button>
        </div>`;
}

function renderResults() {
    const test = DATA.tests[STATE.testKey];
    if (!test) { STATE.view = 'dashboard'; render(); return; }

    const totalQ = STATE.questions.length;
    let totalCorrect = 0;
    const sectionResults = {};
    SECTIONS.forEach(sec => { sectionResults[sec] = { correct: 0, total: 0 }; });

    STATE.questions.forEach((q, i) => {
        const sec = q.section;
        sectionResults[sec].total++;
        if (STATE.answers[i] === q.correct) {
            totalCorrect++;
            sectionResults[sec].correct++;
        }
    });

    const pct = Math.round(totalCorrect / totalQ * 100);
    const emoji = pct >= 80 ? '🌟' : pct >= 60 ? '👍' : pct >= 40 ? '💪' : '📚';

    let html = `<div class="results">
        <div class="results-icon">${emoji}</div>
        <h1>Test ${STATE.testKey} Complete!</h1>
        <div class="final-score">${totalCorrect}/${totalQ}</div>
        <div class="final-pct">${pct}% correct</div>
    </div>`;

    // Score cards
    html += '<div class="score-cards">';
    SECTIONS.forEach(sec => {
        const r = sectionResults[sec];
        const secPct = r.total > 0 ? Math.round(r.correct / r.total * 100) : 0;
        html += `<div class="sc ${sec}"><div class="sc-label">${SECTION_META[sec].icon} ${SECTION_META[sec].name}</div><div class="sc-value">${r.correct}/${r.total}</div><div class="sc-pct">${secPct}%</div></div>`;
    });
    html += '</div>';

    // Review tabs
    html += '<div class="review-tabs">';
    ['all','reading','maths','thinking','wrong'].forEach(tab => {
        const label = tab === 'all' ? 'All' : tab === 'wrong' ? '❌ Wrong Only' : SECTION_META[tab]?.name || tab;
        html += `<button class="review-tab${tab === 'all' ? ' active' : ''}" data-action="reviewTab" data-tab="${tab}">${label}</button>`;
    });
    html += '</div>';

    // Review list
    html += '<div class="review-list" id="reviewList">';
    html += renderReviewItems('all');
    html += '</div>';

    // Back button
    html += '<div class="nav-row"><button class="btn btn-primary" data-action="backToDashboard">← Back to Dashboard</button></div>';

    app.innerHTML = html;
}

function renderReviewItems(filter) {
    let html = '';
    STATE.questions.forEach((q, i) => {
        const selected = STATE.answers[i];
        const isCorrect = selected === q.correct;
        if (filter === 'wrong' && isCorrect) return;
        if (filter !== 'all' && filter !== 'wrong' && q.section !== filter) return;

        html += `<div class="rv-item ${isCorrect ? 'correct' : 'incorrect'}">`;
        html += `<div class="rv-head"><span>Q${i+1} • ${CAT_NAMES[q.category] || q.category}</span><span class="rv-status ${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? '✓ Correct' : '✗ Wrong'}</span></div>`;
        html += `<div class="rv-q">${q.q.substring(0, 200)}${q.q.length > 200 ? '...' : ''}</div>`;
        if (!isCorrect) {
            html += `<div class="rv-answer">Your answer: ${q.options[selected] || 'Skipped'} → Correct: <strong>${q.options[q.correct]}</strong></div>`;
        }
        html += `<div class="rv-explanation">${q.explanation || ''}</div>`;
        html += '</div>';
    });
    if (!html) html = '<p style="text-align:center;color:#94a3b8;padding:20px">No questions to show.</p>';
    return html;
}

// ===== HELPERS =====
function getGlobalIdx(section, localIdx) {
    let offset = 0;
    for (const sec of SECTIONS) {
        if (sec === section) return offset + localIdx;
        offset += STATE.questions.filter(q => q.section === sec).length;
    }
    return offset + localIdx;
}

function startTimer() {
    clearInterval(STATE.timer);
    const sec = SECTIONS[STATE.sectionIdx];
    STATE.timeLeft = SECTION_META[sec].time * 60;
    STATE.timer = setInterval(() => {
        STATE.timeLeft--;
        // Update timer display
        const timerEl = app.querySelector('.timer');
        if (timerEl) {
            const mins = Math.floor(STATE.timeLeft / 60);
            const secs = STATE.timeLeft % 60;
            timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            timerEl.className = 'timer' + (STATE.timeLeft < 60 ? ' danger' : STATE.timeLeft < 180 ? ' warning' : '');
        }
        if (STATE.timeLeft <= 0) {
            clearInterval(STATE.timer);
            finishSection();
        }
    }, 1000);
}

function finishSection() {
    clearInterval(STATE.timer);
    const sec = SECTIONS[STATE.sectionIdx];
    const sectionQs = STATE.questions.filter(q => q.section === sec);
    let correct = 0;
    sectionQs.forEach((q, i) => {
        const gi = getGlobalIdx(sec, i);
        const selected = STATE.answers[gi];
        const isCorrect = selected === q.correct;
        if (isCorrect) correct++;
        // Record to category stats
        const cat = q.category;
        if (!DATA.categoryStats[cat]) DATA.categoryStats[cat] = { correct: 0, total: 0 };
        DATA.categoryStats[cat].total++;
        if (isCorrect) DATA.categoryStats[cat].correct++;
    });
    STATE.sectionAnswers[sec] = { correct, total: sectionQs.length };

    if (STATE.sectionIdx < 2) {
        STATE.sectionIdx++;
        STATE.questionIdx = 0;
        STATE.view = 'section-transition';
    } else {
        finishTest();
    }
    saveData(DATA);
    render();
}

function finishTest() {
    clearInterval(STATE.timer);
    let totalCorrect = 0;
    STATE.questions.forEach((q, i) => { if (STATE.answers[i] === q.correct) totalCorrect++; });

    const test = DATA.tests[STATE.testKey];
    test.completed = true;
    test.score = totalCorrect;
    test.total = STATE.questions.length;
    test.sectionScores = { ...STATE.sectionAnswers };

    // Update daily scores
    const day = parseInt(STATE.testKey.split('-')[0]);
    if (!DATA.dailyScores[day]) DATA.dailyScores[day] = { reading: 0, maths: 0, thinking: 0, total: 0, count: 0 };
    const ds = DATA.dailyScores[day];
    SECTIONS.forEach(sec => {
        const sa = STATE.sectionAnswers[sec];
        if (sa) ds[sec] += sa.total > 0 ? Math.round(sa.correct / sa.total * 100) : 0;
    });
    ds.total += Math.round(totalCorrect / STATE.questions.length * 100);
    ds.count++;

    // Check if day is complete
    const dayTests = [1,2,3].map(t => DATA.tests[`${day}-${t}`]);
    if (dayTests.every(t => t.completed) && DATA.currentDay === day && day < 7) {
        DATA.currentDay = day + 1;
    }

    saveData(DATA);
    STATE.view = 'results';
    render();
}

// ===== EVENT HANDLING =====
app.addEventListener('click', function(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;

    switch (action) {
        case 'selectDay': {
            const day = parseInt(el.dataset.day);
            if (day > DATA.currentDay) {
                if (confirm(`Day ${day} is locked. Skip ahead to Day ${day}? (This will unlock it)`)) {
                    DATA.currentDay = day;
                    saveData(DATA);
                }
            }
            DATA.selectedDay = day;
            render();
            break;
        }
        case 'startTest': {
            const key = el.dataset.key;
            const test = DATA.tests[key];
            if (!test || test.completed) return;
            const day = parseInt(key.split('-')[0]);
            const testNum = parseInt(key.split('-')[1]);
            if (day > DATA.currentDay) return;
            if (testNum > 1 && !DATA.tests[`${day}-${testNum-1}`].completed) return;

            STATE.testKey = key;
            STATE.questions = generateTestQuestions(key);
            STATE.answers = new Array(STATE.questions.length).fill(undefined);
            STATE.sectionIdx = 0;
            STATE.questionIdx = 0;
            STATE.sectionAnswers = {};
            STATE.view = 'section-intro';
            render();
            break;
        }
        case 'beginSection': {
            STATE.view = 'question';
            STATE.questionIdx = 0;
            startTimer();
            render();
            break;
        }
        case 'selectOption': {
            const idx = parseInt(el.dataset.idx);
            const sec = SECTIONS[STATE.sectionIdx];
            const gi = getGlobalIdx(sec, STATE.questionIdx);
            if (STATE.answers[gi] !== undefined) return; // Already answered
            STATE.answers[gi] = idx;
            render();
            break;
        }
        case 'nextQuestion': {
            STATE.questionIdx++;
            render();
            window.scrollTo(0, 0);
            break;
        }
        case 'nextSection': {
            finishSection();
            break;
        }
        case 'finishTest': {
            finishSection();
            break;
        }
        case 'backToDashboard': {
            STATE.view = 'dashboard';
            STATE.testKey = null;
            render();
            break;
        }
        case 'reviewTab': {
            const tab = el.dataset.tab;
            app.querySelectorAll('.review-tab').forEach(t => t.classList.remove('active'));
            el.classList.add('active');
            const list = document.getElementById('reviewList');
            if (list) list.innerHTML = renderReviewItems(tab);
            break;
        }
        case 'resetData': {
            if (confirm('Reset ALL progress? This cannot be undone.')) {
                localStorage.removeItem(STORAGE_KEY);
                DATA = getDefaultData();
                STATE = { view: 'dashboard', testKey: null, sectionIdx: 0, questionIdx: 0, questions: [], answers: [], timer: null, timeLeft: 0, sectionAnswers: {} };
                render();
            }
            break;
        }
    }
});

// ===== INIT =====
render();
console.log('🚀 Scarlet\'s 7-Day Adaptive OC Intensive loaded!');

})();
