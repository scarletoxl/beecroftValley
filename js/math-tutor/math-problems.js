// js/math-tutor/math-problems.js
// Problem generation for each skill and level

const MathProblems = {

    // Generate a problem for a specific skill and level
    generate: function(skillId, level, options = {}) {
        const generator = this.generators[skillId];
        if (!generator) {
            console.error(`No generator for skill: ${skillId}`);
            return this.generators.navigator_find(1);
        }
        return generator.call(this, level, options);
    },

    // Random integer helper
    randInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Random element from array
    randChoice: function(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    generators: {
        // === NAVIGATOR ===
        navigator_find: function(level) {
            let target;
            if (level === 1) {
                target = this.randInt(0, 50);
            } else {
                target = this.randInt(0, 99);
            }

            return {
                type: 'find',
                question: `Find ${target} on the grid`,
                answer: target,
                displayAnswer: target,
                gridHighlight: level === 1 ? 'full' : (level === 2 ? 'partial' : 'none'),
                timeLimit: level === 3 ? 3 : null,
                hint: `Look at row ${Math.floor(target / 10)} (the ${Math.floor(target / 10)}0s row)`
            };
        },

        navigator_patterns: function(level) {
            if (level === 1) {
                const mult = this.randInt(1, 9) * 10;
                return {
                    type: 'pattern',
                    question: `What column has all the numbers ending in 0? (10, 20, 30...)`,
                    answer: 0,
                    displayAnswer: 'The rightmost column (0, 10, 20, 30...)',
                    gridHighlight: 'column_10s'
                };
            }
            // Add more pattern levels...
            return this.generators.navigator_find.call(this, 1);
        },

        // === ADDITION ===
        addition_small: function(level) {
            let a, b, carry;

            switch(level) {
                case 1: // No carry
                    a = this.randInt(20, 90);
                    b = this.randInt(1, 9 - (a % 10)); // Ensure no carry
                    break;
                case 2: // With carry
                    a = this.randInt(20, 90);
                    const aUnits = a % 10;
                    b = this.randInt(10 - aUnits, 9); // Force carry
                    carry = true;
                    break;
                default: // Mixed
                    a = this.randInt(10, 90);
                    b = this.randInt(1, 9);
            }

            const answer = a + b;
            const gridPath = this.calculateGridPath(a, b, 'add');

            return {
                type: 'addition',
                question: `${a} + ${b}`,
                operands: [a, b],
                operation: '+',
                answer: answer,
                displayAnswer: answer,
                gridHighlight: level <= 2 ? 'full' : (level === 3 ? 'partial' : (level === 4 ? 'peek' : 'none')),
                gridPath: gridPath,
                hasCarry: carry || false,
                hint: carry
                    ? `${a} + ${b}: Add ${b}, but you'll cross into the next row!`
                    : `Start at ${a}, hop right ${b} times`
            };
        },

        addition_jumping: function(level) {
            let a, b;

            switch(level) {
                case 1: // +10 only
                    a = this.randInt(10, 80);
                    b = 10;
                    break;
                case 2: // +10, +20, +30
                    a = this.randInt(10, 60);
                    b = this.randChoice([10, 20, 30]);
                    break;
                case 3: // 2-digit + 2-digit, no carry
                    a = this.randInt(10, 50);
                    b = this.randInt(10, 40);
                    // Adjust to avoid carry
                    if ((a % 10) + (b % 10) >= 10) {
                        b = Math.floor(b / 10) * 10 + (9 - (a % 10));
                    }
                    break;
                case 4: // 2-digit + 2-digit, with carry
                    a = this.randInt(15, 70);
                    b = this.randInt(15, 50);
                    // Force carry if needed
                    if ((a % 10) + (b % 10) < 10) {
                        b = b + (10 - (a % 10) - (b % 10)) + this.randInt(1, 5);
                    }
                    break;
                default: // Any
                    a = this.randInt(10, 70);
                    b = this.randInt(10, 50);
            }

            // Ensure answer stays under 100
            if (a + b > 99) {
                b = 99 - a - this.randInt(0, 10);
                b = Math.max(10, b);
            }

            const answer = a + b;
            const rows = Math.floor(b / 10);
            const cols = b % 10;

            return {
                type: 'addition',
                question: `${a} + ${b}`,
                operands: [a, b],
                operation: '+',
                answer: answer,
                displayAnswer: answer,
                gridHighlight: level <= 2 ? 'full' : (level === 3 ? 'partial' : (level === 4 ? 'peek' : 'none')),
                gridPath: this.calculateGridPath(a, b, 'add'),
                hint: `Start at ${a}, jump down ${rows} row${rows !== 1 ? 's' : ''}, then right ${cols}`
            };
        },

        // === SUBTRACTION ===
        subtraction_small: function(level) {
            let a, b, borrow;

            switch(level) {
                case 1: // No borrow
                    a = this.randInt(20, 99);
                    b = this.randInt(1, a % 10); // Ensure no borrow
                    break;
                case 2: // With borrow
                    a = this.randInt(20, 99);
                    const aUnits = a % 10;
                    b = this.randInt(aUnits + 1, 9); // Force borrow
                    borrow = true;
                    break;
                default:
                    a = this.randInt(20, 99);
                    b = this.randInt(1, 9);
                    borrow = b > (a % 10);
            }

            const answer = a - b;

            return {
                type: 'subtraction',
                question: `${a} - ${b}`,
                operands: [a, b],
                operation: '-',
                answer: answer,
                displayAnswer: answer,
                gridHighlight: level <= 2 ? 'full' : (level === 3 ? 'partial' : (level === 4 ? 'peek' : 'none')),
                gridPath: this.calculateGridPath(a, b, 'subtract'),
                hasBorrow: borrow || false,
                hint: borrow
                    ? `${a} - ${b}: You'll need to go up a row!`
                    : `Start at ${a}, hop left ${b} times`
            };
        },

        subtraction_jumping: function(level) {
            let a, b;

            switch(level) {
                case 1:
                    a = this.randInt(20, 99);
                    b = 10;
                    break;
                case 2:
                    a = this.randInt(30, 99);
                    b = this.randChoice([10, 20, 30]);
                    break;
                case 3: // No borrow
                    a = this.randInt(40, 99);
                    b = this.randInt(10, 30);
                    if ((a % 10) < (b % 10)) {
                        b = Math.floor(b / 10) * 10 + (a % 10) - this.randInt(0, 2);
                    }
                    break;
                case 4: // With borrow
                    a = this.randInt(40, 99);
                    b = this.randInt(15, 40);
                    break;
                default:
                    a = this.randInt(40, 99);
                    b = this.randInt(10, a - 10);
            }

            // Ensure positive result
            if (a - b < 0) b = a - this.randInt(5, 15);

            const answer = a - b;
            const rows = Math.floor(b / 10);
            const cols = b % 10;

            return {
                type: 'subtraction',
                question: `${a} - ${b}`,
                operands: [a, b],
                operation: '-',
                answer: answer,
                displayAnswer: answer,
                gridHighlight: level <= 2 ? 'full' : (level === 3 ? 'partial' : (level === 4 ? 'peek' : 'none')),
                gridPath: this.calculateGridPath(a, b, 'subtract'),
                hint: `Start at ${a}, jump up ${rows} row${rows !== 1 ? 's' : ''}, then left ${cols}`
            };
        },

        // === MULTIPLICATION ===
        multiplication_easy: function(level) {
            let a, b;

            switch(level) {
                case 1:
                    a = this.randInt(1, 10);
                    b = 2;
                    break;
                case 2:
                    a = this.randInt(1, 10);
                    b = this.randChoice([5, 10]);
                    break;
                default:
                    a = this.randInt(1, 10);
                    b = this.randChoice([2, 5, 10]);
            }

            return {
                type: 'multiplication',
                question: `${a} × ${b}`,
                operands: [a, b],
                operation: '×',
                answer: a * b,
                displayAnswer: a * b,
                gridHighlight: level === 1 ? 'array' : 'none',
                showArray: level === 1,
                arrayDimensions: [a, b],
                hint: `${a} groups of ${b}, or skip count by ${b}: ${Array.from({length: a}, (_, i) => (i+1)*b).join(', ')}`
            };
        },

        multiplication_medium: function(level) {
            let tables;
            switch(level) {
                case 1: tables = [3, 4]; break;
                case 2: tables = [6, 7]; break;
                default: tables = [3, 4, 6, 7];
            }

            const b = this.randChoice(tables);
            const a = this.randInt(1, 10);

            return {
                type: 'multiplication',
                question: `${a} × ${b}`,
                operands: [a, b],
                operation: '×',
                answer: a * b,
                displayAnswer: a * b,
                gridHighlight: 'none',
                hint: `Think: ${a} groups of ${b}`
            };
        },

        multiplication_hard: function(level) {
            let b;
            switch(level) {
                case 1: b = 8; break;
                case 2: b = 9; break;
                default: b = this.randChoice([2, 3, 4, 5, 6, 7, 8, 9, 10]);
            }

            const a = this.randInt(1, 10);

            let hint;
            if (b === 9) {
                hint = `9 trick: ${a} × 9 = ${a} × 10 - ${a} = ${a * 10} - ${a} = ${a * 9}`;
            } else if (b === 8) {
                hint = `8 trick: ${a} × 8 = ${a} × 10 - ${a} × 2 = ${a * 10} - ${a * 2}`;
            } else {
                hint = `${a} × ${b} = ?`;
            }

            return {
                type: 'multiplication',
                question: `${a} × ${b}`,
                operands: [a, b],
                operation: '×',
                answer: a * b,
                displayAnswer: a * b,
                gridHighlight: 'none',
                hint: hint
            };
        },

        // === STRATEGIES ===
        strategy_doubles: function(level) {
            let a, b;

            switch(level) {
                case 1: // Pure doubles
                    a = this.randInt(2, 10);
                    b = a;
                    break;
                case 2: // Near doubles
                    a = this.randInt(2, 9);
                    b = a + 1;
                    break;
                default: // Big doubles/near-doubles
                    a = this.randInt(12, 45);
                    b = a + this.randChoice([0, 1]);
            }

            const isDouble = a === b;

            return {
                type: 'addition',
                question: `${a} + ${b}`,
                operands: [a, b],
                operation: '+',
                answer: a + b,
                displayAnswer: a + b,
                strategy: 'doubles',
                gridHighlight: 'none',
                hint: isDouble
                    ? `Double ${a}! That's ${a} + ${a} = ${a * 2}`
                    : `Near double! ${a} + ${a} = ${a * 2}, then add 1 more = ${a * 2 + 1}`
            };
        },

        strategy_compensation: function(level) {
            let a, b, strategy;

            switch(level) {
                case 1: // +9 = +10 - 1
                    a = this.randInt(10, 80);
                    b = 9;
                    strategy = `${a} + 9 = ${a} + 10 - 1 = ${a + 10} - 1 = ${a + 9}`;
                    break;
                case 2: // +99 = +100 - 1
                    a = this.randInt(100, 800);
                    b = 99;
                    strategy = `${a} + 99 = ${a} + 100 - 1 = ${a + 100} - 1 = ${a + 99}`;
                    break;
                default: // Mixed
                    const choice = this.randChoice([9, 19, 29, 11, 21]);
                    a = this.randInt(20, 70);
                    b = choice;
                    const rounded = Math.round(b / 10) * 10;
                    const adjust = b - rounded;
                    strategy = `${a} + ${b} = ${a} + ${rounded} ${adjust >= 0 ? '+' : ''} ${adjust} = ${a + rounded} ${adjust >= 0 ? '+' : ''} ${adjust} = ${a + b}`;
            }

            return {
                type: 'addition',
                question: `${a} + ${b}`,
                operands: [a, b],
                operation: '+',
                answer: a + b,
                displayAnswer: a + b,
                strategy: 'compensation',
                gridHighlight: 'none',
                hint: strategy
            };
        },

        // === WORD PROBLEMS ===
        word_problems: function(level) {
            const locations = [
                'Beecroft Station', 'Woolworths', 'the playground',
                'Beecroft Public School', 'the library', 'the park',
                'the bakery', 'the post office'
            ];
            const items = [
                ['gold coins', '💰'], ['apples', '🍎'], ['flowers', '🌸'],
                ['books', '📚'], ['stickers', '⭐'], ['cards', '🃏']
            ];

            const location = this.randChoice(locations);
            const [item, emoji] = this.randChoice(items);

            let question, answer, hint;

            switch(level) {
                case 1: { // Single-step addition
                    const a = this.randInt(12, 45);
                    const b = this.randInt(10, 30);
                    answer = a + b;
                    question = `Wei Wei has ${a} ${item} ${emoji}. She finds ${b} more at ${location}. How many ${item} does she have now?`;
                    hint = `This is addition: ${a} + ${b}`;
                    break;
                }
                case 2: { // Single-step subtraction
                    const a = this.randInt(30, 60);
                    const b = this.randInt(10, a - 10);
                    answer = a - b;
                    question = `Wei Wei has ${a} ${item} ${emoji}. She gives ${b} to a friend at ${location}. How many ${item} does she have left?`;
                    hint = `This is subtraction: ${a} - ${b}`;
                    break;
                }
                case 3: { // Mixed single-step
                    if (Math.random() > 0.5) {
                        return this.generators.word_problems.call(this, 1);
                    } else {
                        return this.generators.word_problems.call(this, 2);
                    }
                }
                case 4: { // Two-step
                    const a = this.randInt(20, 40);
                    const b = this.randInt(10, 25);
                    const c = this.randInt(5, 15);
                    answer = a + b - c;
                    question = `Wei Wei starts with ${a} ${item} ${emoji}. She finds ${b} more at ${location}, then gives ${c} to her friend. How many does she have now?`;
                    hint = `Two steps: First ${a} + ${b} = ${a + b}, then ${a + b} - ${c}`;
                    break;
                }
                default: { // Multi-step with multiplication
                    const groups = this.randInt(3, 6);
                    const perGroup = this.randInt(4, 8);
                    const extra = this.randInt(5, 15);
                    answer = groups * perGroup + extra;
                    question = `Wei Wei finds ${groups} bags of ${item} ${emoji} at ${location}. Each bag has ${perGroup} ${item}. She also finds ${extra} loose ones. How many ${item} does she have in total?`;
                    hint = `First multiply: ${groups} × ${perGroup} = ${groups * perGroup}. Then add: ${groups * perGroup} + ${extra}`;
                }
            }

            return {
                type: 'word_problem',
                question: question,
                answer: answer,
                displayAnswer: `${answer} ${item}`,
                gridHighlight: 'none',
                hint: hint
            };
        }
    },

    // Calculate the grid path for visualisation
    calculateGridPath: function(start, amount, operation) {
        const path = [start];
        let current = start;

        if (operation === 'add') {
            // Break into row jumps and column moves
            const rows = Math.floor(amount / 10);
            const cols = amount % 10;

            // Add row jumps
            for (let i = 0; i < rows; i++) {
                current += 10;
                path.push(current);
            }
            // Add column moves
            for (let i = 0; i < cols; i++) {
                current += 1;
                path.push(current);
            }
        } else if (operation === 'subtract') {
            const rows = Math.floor(amount / 10);
            const cols = amount % 10;

            for (let i = 0; i < rows; i++) {
                current -= 10;
                path.push(current);
            }
            for (let i = 0; i < cols; i++) {
                current -= 1;
                path.push(current);
            }
        }

        return path;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathProblems;
}
