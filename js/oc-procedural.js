// Beecroft Valley - Procedural OC Question Generator
// Creates infinite variations of OC-style questions
// This enhances the static question bank with procedurally generated questions

class ProceduralOCGenerator {
    constructor() {
        this.random = Math.random;
    }

    // ===== UTILITY METHODS =====
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    generateOptions(correct, count = 4) {
        const options = [correct];
        const variants = [
            correct + this.randInt(1, 5),
            correct - this.randInt(1, 5),
            correct + this.randInt(5, 15),
            correct - this.randInt(5, 15),
            correct * 2,
            Math.floor(correct / 2),
            correct + 10,
            correct - 10,
            correct + this.randInt(10, 30),
        ].filter(v => v > 0 && v !== correct && !options.includes(v));

        while (options.length < count && variants.length > 0) {
            const idx = Math.floor(Math.random() * variants.length);
            options.push(variants.splice(idx, 1)[0]);
        }

        while (options.length < count) {
            const v = correct + this.randInt(-20, 20);
            if (v > 0 && !options.includes(v)) options.push(v);
        }

        return this.shuffle(options);
    }

    // ===== MATHS QUESTION GENERATORS =====

    generatePatternQuestion() {
        const patterns = [
            // Multiplication pattern
            () => {
                const mult = this.randInt(2, 5);
                const start = this.randInt(1, 5);
                const seq = [];
                let val = start;
                for (let i = 0; i < 4; i++) {
                    seq.push(val);
                    val *= mult;
                }
                const answer = val;
                return {
                    q: `What comes next: ${seq.join(', ')}, __?`,
                    answer: answer,
                    explanation: `Each number is multiplied by ${mult}. ${seq[3]} × ${mult} = ${answer}`
                };
            },
            // Addition pattern
            () => {
                const add = this.randInt(3, 15);
                const start = this.randInt(2, 20);
                const seq = [];
                let val = start;
                for (let i = 0; i < 4; i++) {
                    seq.push(val);
                    val += add;
                }
                const answer = val;
                return {
                    q: `Find the next number: ${seq.join(', ')}, __?`,
                    answer: answer,
                    explanation: `Each number increases by ${add}. ${seq[3]} + ${add} = ${answer}`
                };
            },
            // Increasing addition (1,2,3,4...)
            () => {
                const start = this.randInt(1, 10);
                const seq = [start];
                let add = 1;
                for (let i = 0; i < 4; i++) {
                    seq.push(seq[seq.length - 1] + add);
                    add++;
                }
                const answer = seq[seq.length - 1] + add;
                seq.pop(); // Remove last one for question
                return {
                    q: `What comes next: ${seq.join(', ')}, __?`,
                    answer: answer,
                    explanation: `Pattern: +1, +2, +3, +4, so next is +5. ${seq[seq.length-1]} + 5 = ${answer}`
                };
            },
            // Square numbers
            () => {
                const start = this.randInt(1, 4);
                const seq = [];
                for (let i = start; i < start + 4; i++) {
                    seq.push(i * i);
                }
                const answer = (start + 4) * (start + 4);
                return {
                    q: `These are square numbers. What comes next: ${seq.join(', ')}, __?`,
                    answer: answer,
                    explanation: `Square numbers: ${start}², ${start+1}², ${start+2}², ${start+3}². Next is ${start+4}² = ${answer}`
                };
            },
            // Double and add
            () => {
                const addend = this.randInt(1, 3);
                const start = this.randInt(1, 5);
                const seq = [start];
                for (let i = 0; i < 3; i++) {
                    seq.push(seq[seq.length - 1] * 2 + addend);
                }
                const answer = seq[seq.length - 1] * 2 + addend;
                return {
                    q: `Find the pattern: ${seq.join(', ')}, __?`,
                    answer: answer,
                    explanation: `Each number is doubled then ${addend} is added. (${seq[3]} × 2) + ${addend} = ${answer}`
                };
            }
        ];

        const p = this.randChoice(patterns)();
        const options = this.generateOptions(p.answer);
        return {
            q: p.q,
            options: options.map(String),
            correct: options.indexOf(p.answer),
            explanation: p.explanation,
            category: "patterns"
        };
    }

    generateWordProblem() {
        const names = ['Tom', 'Emma', 'Jack', 'Sophie', 'Liam', 'Olivia', 'Noah', 'Ava', 'Maya', 'Ethan'];
        const name = this.randChoice(names);

        const problems = [
            // Simple multiplication
            () => {
                const perBox = this.randInt(6, 15);
                const boxes = this.randInt(3, 9);
                const answer = perBox * boxes;
                const items = this.randChoice(['pencils', 'cookies', 'stickers', 'marbles', 'cards', 'books']);
                return {
                    q: `Each box has ${perBox} ${items}. How many ${items} in ${boxes} boxes?`,
                    answer: answer,
                    explanation: `${perBox} × ${boxes} = ${answer} ${items}`
                };
            },
            // Simple division
            () => {
                const groups = this.randInt(4, 12);
                const perGroup = this.randInt(5, 15);
                const total = groups * perGroup;
                return {
                    q: `${total} students need to be divided into groups of ${perGroup}. How many groups?`,
                    answer: groups,
                    explanation: `${total} ÷ ${perGroup} = ${groups} groups`
                };
            },
            // Money spent
            () => {
                const start = this.randInt(15, 50);
                const items = this.randInt(2, 5);
                const price = this.randInt(2, 8);
                const spent = items * price;
                const answer = start - spent;
                const thing = this.randChoice(['notebooks', 'pens', 'toys', 'snacks', 'books']);
                return {
                    q: `${name} has $${start}. They buy ${items} ${thing} at $${price} each. How much money left?`,
                    answer: answer,
                    explanation: `$${start} - (${items} × $${price}) = $${start} - $${spent} = $${answer}`
                };
            },
            // Total from groups
            () => {
                const friends = this.randInt(3, 7);
                const each = this.randInt(4, 12);
                const answer = friends * each;
                const items = this.randChoice(['stickers', 'cards', 'sweets', 'coins', 'gems']);
                return {
                    q: `${friends} friends share some ${items} equally. Each gets ${each}. How many ${items} in total?`,
                    answer: answer,
                    explanation: `${friends} friends × ${each} each = ${answer} ${items}`
                };
            },
            // Bus/seats
            () => {
                const seats = this.randInt(30, 55);
                const vehicles = this.randInt(2, 5);
                const answer = seats * vehicles;
                const vehicle = this.randChoice(['bus', 'train car', 'plane']);
                return {
                    q: `A ${vehicle} holds ${seats} passengers. How many passengers in ${vehicles} full ${vehicle}${vehicles > 1 ? (vehicle.includes(' ') ? 's' : 'es') : ''}?`,
                    answer: answer,
                    explanation: `${seats} × ${vehicles} = ${answer} passengers`
                };
            },
            // Distance/speed
            () => {
                const speed = this.randInt(3, 10);
                const hours = this.randInt(2, 6);
                const answer = speed * hours;
                return {
                    q: `${name} rides a bike at ${speed} km per hour. How far in ${hours} hours?`,
                    answer: answer,
                    explanation: `${speed} km/h × ${hours} hours = ${answer} km`
                };
            }
        ];

        const p = this.randChoice(problems)();
        const options = this.generateOptions(p.answer);
        return {
            q: p.q,
            options: options.map(String),
            correct: options.indexOf(p.answer),
            explanation: p.explanation,
            category: "word"
        };
    }

    generateFractionQuestion() {
        const problems = [
            // Fraction of a number
            () => {
                const numerator = this.randInt(1, 4);
                const denominator = numerator + this.randInt(1, 4);
                const total = denominator * this.randInt(3, 10);
                const answer = (total / denominator) * numerator;
                return {
                    q: `What is ${numerator}/${denominator} of ${total}?`,
                    answer: answer,
                    explanation: `${total} ÷ ${denominator} = ${total/denominator}, then × ${numerator} = ${answer}`
                };
            },
            // Class fraction problem
            () => {
                const total = this.randInt(4, 10) * 5;
                const numerator = this.randInt(1, 3);
                const denominator = 5;
                const part = (total / denominator) * numerator;
                const answer = total - part;
                return {
                    q: `In a class of ${total} students, ${numerator}/${denominator} are girls. How many boys?`,
                    answer: answer,
                    explanation: `${numerator}/${denominator} of ${total} = ${part} girls. ${total} - ${part} = ${answer} boys`
                };
            },
            // Simple fraction of a number (halves, thirds, quarters)
            () => {
                const frac = this.randChoice([
                    { n: 1, d: 2, name: 'half' },
                    { n: 1, d: 4, name: 'quarter' },
                    { n: 3, d: 4, name: 'three quarters' },
                    { n: 1, d: 3, name: 'third' },
                    { n: 2, d: 3, name: 'two thirds' }
                ]);
                const total = frac.d * this.randInt(4, 12);
                const answer = (total / frac.d) * frac.n;
                return {
                    q: `What is ${frac.n}/${frac.d} of ${total}?`,
                    answer: answer,
                    explanation: `${total} ÷ ${frac.d} = ${total/frac.d}, then × ${frac.n} = ${answer}`
                };
            }
        ];

        const p = this.randChoice(problems)();
        const options = this.generateOptions(p.answer);
        return {
            q: p.q,
            options: options.map(String),
            correct: options.indexOf(p.answer),
            explanation: p.explanation,
            category: "fractions"
        };
    }

    generateTimeQuestion() {
        const problems = [
            // Duration calculation
            () => {
                const startHour = this.randInt(1, 10);
                const startMin = this.randChoice([0, 15, 30, 45]);
                const durHrs = this.randInt(1, 3);
                const durMins = this.randChoice([0, 15, 30, 45]);
                
                let endMin = startMin + durMins;
                let endHour = startHour + durHrs;
                if (endMin >= 60) {
                    endMin -= 60;
                    endHour += 1;
                }
                
                const fmt = (h, m) => `${h}:${m.toString().padStart(2, '0')}`;
                const answer = fmt(endHour, endMin);
                const wrongTimes = [
                    fmt(endHour, (endMin + 15) % 60),
                    fmt(endHour + 1, endMin),
                    fmt(endHour - 1, endMin)
                ].filter(t => t !== answer);
                
                return {
                    q: `A movie starts at ${fmt(startHour, startMin)} PM and runs for ${durHrs} hour${durHrs > 1 ? 's' : ''}${durMins > 0 ? ` and ${durMins} minutes` : ''}. When does it end?`,
                    options: this.shuffle([answer, ...wrongTimes.slice(0, 3)]),
                    correctAnswer: answer,
                    explanation: `${fmt(startHour, startMin)} + ${durHrs}h ${durMins}m = ${answer} PM`
                };
            },
            // Minutes in hours
            () => {
                const hours = this.randInt(2, 8);
                const answer = hours * 60;
                return {
                    q: `How many minutes in ${hours} hours?`,
                    answer: answer,
                    explanation: `${hours} × 60 = ${answer} minutes`
                };
            },
            // Days in weeks
            () => {
                const weeks = this.randInt(2, 8);
                const answer = weeks * 7;
                return {
                    q: `How many days in ${weeks} weeks?`,
                    answer: answer,
                    explanation: `${weeks} × 7 = ${answer} days`
                };
            }
        ];

        const p = this.randChoice(problems)();
        
        if (p.options) {
            return {
                q: p.q,
                options: p.options,
                correct: p.options.indexOf(p.correctAnswer),
                explanation: p.explanation,
                category: "time"
            };
        }
        
        const options = this.generateOptions(p.answer);
        return {
            q: p.q,
            options: options.map(String),
            correct: options.indexOf(p.answer),
            explanation: p.explanation,
            category: "time"
        };
    }

    generateGeometryQuestion() {
        const problems = [
            // Rectangle perimeter
            () => {
                const length = this.randInt(5, 20);
                const width = this.randInt(3, 15);
                const answer = 2 * (length + width);
                return {
                    q: `A rectangle has length ${length}cm and width ${width}cm. What is its perimeter?`,
                    answer: answer,
                    explanation: `Perimeter = 2 × (${length} + ${width}) = 2 × ${length + width} = ${answer}cm`
                };
            },
            // Square area
            () => {
                const side = this.randInt(3, 15);
                const answer = side * side;
                return {
                    q: `A square has sides of ${side}cm. What is its area?`,
                    answer: answer,
                    explanation: `Area = ${side} × ${side} = ${answer}cm²`
                };
            },
            // Triangle angles
            () => {
                const a1 = this.randInt(25, 80);
                const a2 = this.randInt(25, 80);
                const answer = 180 - a1 - a2;
                if (answer < 20 || answer > 120) return this.generateGeometryQuestion(); // regenerate if weird
                return {
                    q: `A triangle has angles of ${a1}° and ${a2}°. What is the third angle?`,
                    answer: answer,
                    explanation: `Angles in a triangle = 180°. 180 - ${a1} - ${a2} = ${answer}°`
                };
            },
            // Shape sides
            () => {
                const shapes = [
                    { name: 'pentagon', sides: 5 },
                    { name: 'hexagon', sides: 6 },
                    { name: 'octagon', sides: 8 },
                    { name: 'heptagon', sides: 7 }
                ];
                const shape = this.randChoice(shapes);
                return {
                    q: `How many sides does a ${shape.name} have?`,
                    answer: shape.sides,
                    explanation: `A ${shape.name} has ${shape.sides} sides`
                };
            },
            // Rectangle area
            () => {
                const length = this.randInt(4, 12);
                const width = this.randInt(3, 10);
                const answer = length * width;
                return {
                    q: `A rectangle is ${length}m long and ${width}m wide. What is its area?`,
                    answer: answer,
                    explanation: `Area = ${length} × ${width} = ${answer}m²`
                };
            }
        ];

        const p = this.randChoice(problems)();
        const options = this.generateOptions(p.answer);
        return {
            q: p.q,
            options: options.map(String),
            correct: options.indexOf(p.answer),
            explanation: p.explanation,
            category: "geometry"
        };
    }

    generateAverageQuestion() {
        const count = this.randInt(3, 5);
        const numbers = [];
        const target = this.randInt(10, 30);
        
        // Generate numbers that sum to a nice average
        for (let i = 0; i < count - 1; i++) {
            numbers.push(target + this.randInt(-5, 5));
        }
        const sum = numbers.reduce((a, b) => a + b, 0);
        const last = (target * count) - sum;
        numbers.push(last);
        
        const actualSum = numbers.reduce((a, b) => a + b, 0);
        const answer = actualSum / count;
        
        if (!Number.isInteger(answer)) {
            return this.generateAverageQuestion(); // Regenerate
        }

        const options = this.generateOptions(answer);
        return {
            q: `What is the average of ${numbers.join(', ')}?`,
            options: options.map(String),
            correct: options.indexOf(answer),
            explanation: `(${numbers.join(' + ')}) ÷ ${count} = ${actualSum} ÷ ${count} = ${answer}`,
            category: "averages"
        };
    }

    // ===== THINKING SKILLS GENERATORS =====

    generateLogicQuestion() {
        const problems = [
            // Syllogism
            () => {
                const creatures = ['Bloops', 'Razzles', 'Lazzles', 'Zingos', 'Plonks', 'Wibbles', 'Flurps', 'Quibbles'];
                const [a, b, c] = this.shuffle(creatures).slice(0, 3);
                return {
                    q: `All ${a} are ${b}.\nAll ${b} are ${c}.\n\nWhich must be TRUE?`,
                    options: [
                        `All ${a} are ${c}`,
                        `All ${c} are ${a}`,
                        `Some ${c} are not ${b}`,
                        `No ${a} are ${c}`
                    ],
                    correct: 0,
                    explanation: `If all ${a} are ${b}, and all ${b} are ${c}, then all ${a} must also be ${c}.`
                };
            },
            // Ordering
            () => {
                const names = this.shuffle(['Amy', 'Ben', 'Cara', 'Dan', 'Emma']).slice(0, 4);
                const [a, b, c, d] = names;
                return {
                    q: `${a} is taller than ${b}.\n${b} is taller than ${c}.\n${d} is taller than ${a}.\n\nWho is the shortest?`,
                    options: [c, b, a, d],
                    correct: 0,
                    explanation: `Order from tallest: ${d} > ${a} > ${b} > ${c}. So ${c} is shortest.`
                };
            },
            // If-then
            () => {
                const names = this.shuffle(['Alex', 'Ben', 'Cara', 'Dana']);
                const [a, b] = names;
                const activities = this.shuffle(['swimming', 'reading', 'painting', 'running', 'dancing']);
                const activity = activities[0];
                return {
                    q: `If it rains, ${a} will stay inside.\nIt is raining today.\n\nWhat can we conclude?`,
                    options: [
                        `${a} will stay inside`,
                        `${a} might stay inside`,
                        `${a} will go outside`,
                        `We cannot conclude anything`
                    ],
                    correct: 0,
                    explanation: `Since it's raining, and "${a} stays inside if it rains" is a definite statement, ${a} will stay inside.`
                };
            }
        ];

        return this.randChoice(problems)();
    }

    generateAnalogyQuestion() {
        const analogies = [
            { a: 'CAT', b: 'KITTEN', c: 'DOG', answer: 'PUPPY', wrong: ['BARK', 'COLLAR', 'BONE'] },
            { a: 'BIRD', b: 'FLY', c: 'FISH', answer: 'SWIM', wrong: ['SCALE', 'WATER', 'FINS'] },
            { a: 'DAY', b: 'NIGHT', c: 'SUMMER', answer: 'WINTER', wrong: ['SPRING', 'HOT', 'AUTUMN'] },
            { a: 'BOOK', b: 'READ', c: 'SONG', answer: 'LISTEN', wrong: ['MUSIC', 'SING', 'DANCE'] },
            { a: 'HAND', b: 'GLOVE', c: 'FOOT', answer: 'SOCK', wrong: ['SHOE', 'TOE', 'WALK'] },
            { a: 'TEACHER', b: 'SCHOOL', c: 'DOCTOR', answer: 'HOSPITAL', wrong: ['NURSE', 'SICK', 'MEDICINE'] },
            { a: 'PENCIL', b: 'WRITE', c: 'KNIFE', answer: 'CUT', wrong: ['SHARP', 'FORK', 'BLADE'] },
            { a: 'EYE', b: 'SEE', c: 'EAR', answer: 'HEAR', wrong: ['SOUND', 'LOUD', 'MUSIC'] },
            { a: 'FAST', b: 'SLOW', c: 'UP', answer: 'DOWN', wrong: ['HIGH', 'TOP', 'SKY'] },
            { a: 'KING', b: 'QUEEN', c: 'PRINCE', answer: 'PRINCESS', wrong: ['PALACE', 'CROWN', 'ROYAL'] },
            { a: 'MILK', b: 'DRINK', c: 'BREAD', answer: 'EAT', wrong: ['TOAST', 'BUTTER', 'WHEAT'] },
            { a: 'CAR', b: 'GARAGE', c: 'PLANE', answer: 'HANGAR', wrong: ['AIRPORT', 'FLY', 'WING'] }
        ];

        const an = this.randChoice(analogies);
        const options = this.shuffle([an.answer, ...an.wrong]);

        return {
            q: `${an.a} is to ${an.b} as ${an.c} is to ___?`,
            options: options,
            correct: options.indexOf(an.answer),
            explanation: `${an.a} → ${an.b} shows the same relationship as ${an.c} → ${an.answer}`
        };
    }

    generateCodeQuestion() {
        const problems = [
            // Letter sum (A=1, B=2...)
            () => {
                const words = ['CAT', 'DOG', 'BAT', 'HAT', 'PEN', 'SUN', 'CUP', 'BUS', 'TOP', 'BOX', 'MAN', 'VAN'];
                const word = this.randChoice(words);
                let sum = 0;
                for (let c of word) {
                    sum += c.charCodeAt(0) - 64;
                }
                const breakdown = word.split('').map(c => `${c}=${c.charCodeAt(0)-64}`).join(' + ');
                return {
                    q: `If A=1, B=2, C=3... what does ${word} equal when you add up the letters?`,
                    answer: sum,
                    explanation: `${breakdown} = ${sum}`
                };
            },
            // Number code pattern
            () => {
                const mult = this.randInt(2, 4);
                const start = this.randInt(2, 5);
                const a = start;
                const b = start * mult;
                const c = start * mult * mult;
                const answer = start * mult * mult * mult;
                return {
                    q: `In a code: A=${a}, B=${b}, C=${c}\n\nWhat does D equal?`,
                    answer: answer,
                    explanation: `Each value is multiplied by ${mult}. D = ${c} × ${mult} = ${answer}`
                };
            },
            // Reverse/shift alphabet
            () => {
                const originalWords = ['AT', 'GO', 'UP', 'IN', 'NO'];
                const word = this.randChoice(originalWords);
                const shift = this.randInt(1, 3);
                let encoded = '';
                for (let c of word) {
                    encoded += String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
                }
                const wrongAnswers = originalWords.filter(w => w !== word);
                return {
                    q: `In a secret code, each letter shifts ${shift} forward (A→${String.fromCharCode(65+shift)}, B→${String.fromCharCode(66+shift)}, etc.)\n\nWhat does "${encoded}" decode to?`,
                    options: this.shuffle([word, ...wrongAnswers.slice(0, 3)]),
                    correctAnswer: word,
                    explanation: `Shift each letter back by ${shift}: ${encoded} → ${word}`
                };
            }
        ];

        const p = this.randChoice(problems)();
        
        if (p.options) {
            return {
                q: p.q,
                options: p.options,
                correct: p.options.indexOf(p.correctAnswer),
                explanation: p.explanation
            };
        }
        
        const options = this.generateOptions(p.answer);
        return {
            q: p.q,
            options: options.map(String),
            correct: options.indexOf(p.answer),
            explanation: p.explanation
        };
    }

    generateSequenceQuestion() {
        const problems = [
            // Emoji pattern
            () => {
                const emojis = ['🔴', '🔵', '🟢', '🟡'];
                const patterns = [
                    { seq: [0, 1, 0, 1, 0, 1, 0], next: 1, rule: 'alternating' },
                    { seq: [0, 0, 1, 0, 0, 1, 0, 0], next: 1, rule: 'AAB repeating' },
                    { seq: [0, 1, 1, 0, 1, 1, 0, 1], next: 1, rule: 'ABB repeating' },
                    { seq: [0, 1, 2, 0, 1, 2, 0], next: 1, rule: 'ABC repeating' }
                ];
                const pat = this.randChoice(patterns);
                const seqStr = pat.seq.map(i => emojis[i]).join('');
                const answer = emojis[pat.next];
                const wrong = emojis.filter(e => e !== answer);
                
                return {
                    q: `What comes next?\n\n${seqStr} ?`,
                    options: this.shuffle([answer, ...wrong.slice(0, 3)]),
                    correctAnswer: answer,
                    explanation: `The pattern is ${pat.rule}, so ${answer} comes next.`
                };
            },
            // Number patterns with different rules
            () => {
                const start = this.randInt(2, 10);
                const step = this.randInt(2, 5);
                const seq = [];
                let val = start;
                for (let i = 0; i < 4; i++) {
                    seq.push(val);
                    val += step;
                }
                const answer = val;
                return {
                    q: `What comes next: ${seq.join(', ')}, __?`,
                    answer: answer,
                    explanation: `Each number increases by ${step}. ${seq[3]} + ${step} = ${answer}`
                };
            }
        ];

        const p = this.randChoice(problems)();
        
        if (p.options) {
            return {
                q: p.q,
                options: p.options,
                correct: p.options.indexOf(p.correctAnswer),
                explanation: p.explanation
            };
        }
        
        const options = this.generateOptions(p.answer);
        return {
            q: p.q,
            options: options.map(String),
            correct: options.indexOf(p.answer),
            explanation: p.explanation
        };
    }

    generateSpatialQuestion() {
        const problems = [
            // Position puzzle
            () => {
                const names = this.shuffle(['Amy', 'Ben', 'Cara', 'Dan', 'Emma']).slice(0, 5);
                return {
                    q: `Five children stand in a line.\n• ${names[2]} is in the middle (position 3).\n• ${names[1]} is directly to the left of ${names[2]}.\n• ${names[4]} is at the right end.\n\nWho is in position 2?`,
                    options: [names[1], names[2], names[4], names[0]],
                    correct: 0,
                    explanation: `${names[2]} is position 3. ${names[1]} is directly left = position 2.`
                };
            },
            // Paper folding
            () => {
                const folds = this.randInt(1, 3);
                const holes = Math.pow(2, folds);
                return {
                    q: `Paper folded ${folds} time${folds > 1 ? 's' : ''}, then 1 hole punched. How many holes when unfolded?`,
                    answer: holes,
                    explanation: `${folds} fold${folds > 1 ? 's' : ''} = ${holes} layers = ${holes} holes`
                };
            },
            // Mirror letter
            () => {
                const pairs = [
                    { letter: 'b', mirror: 'd' },
                    { letter: 'd', mirror: 'b' },
                    { letter: 'p', mirror: 'q' },
                    { letter: 'q', mirror: 'p' }
                ];
                const pair = this.randChoice(pairs);
                return {
                    q: `What does the letter "${pair.letter}" look like in a mirror?`,
                    options: this.shuffle(['b', 'd', 'p', 'q']),
                    correctAnswer: pair.mirror,
                    explanation: `A mirror flips horizontally: "${pair.letter}" becomes "${pair.mirror}"`
                };
            }
        ];

        const p = this.randChoice(problems)();
        
        if (p.options && p.correctAnswer) {
            return {
                q: p.q,
                options: p.options,
                correct: p.options.indexOf(p.correctAnswer),
                explanation: p.explanation
            };
        }
        
        if (p.answer !== undefined) {
            const options = this.generateOptions(p.answer);
            return {
                q: p.q,
                options: options.map(String),
                correct: options.indexOf(p.answer),
                explanation: p.explanation
            };
        }
        
        return p;
    }

    // ===== NEW THINKING SKILLS GENERATORS =====

    generateFindTheFlawQuestion() {
        const names = ['Mia', 'Jake', 'Lily', 'Noah', 'Ava', 'Liam', 'Zoe', 'Kai', 'Ruby', 'Oscar', 'Ella', 'Max', 'Chloe', 'Ryan', 'Sophie'];
        const name = this.randChoice(names);

        const templates = [
            // Correlation != Causation
            {
                scenario: (n) => `${n} wore a green hat to the spelling test and got every word right. ${n} says: "My green hat made me spell better!"`,
                correct: "Wearing a hat cannot affect spelling ability — it was just a coincidence",
                wrong: ["The hat might actually be lucky", `${name} should wear it to every test`, "Green is a lucky colour"],
                category: "flaw"
            },
            {
                scenario: (n) => `${n} noticed it rained every time they walked to school. ${n} says: "My walking to school causes rain!"`,
                correct: "Two things happening together does not mean one causes the other",
                wrong: [`${name} should get a lift instead`, "Walking does affect weather patterns", `${name} should carry an umbrella`],
                category: "flaw"
            },
            {
                scenario: (n) => `${n} ate a banana before the race and won. ${n} says: "Bananas make you run faster!"`,
                correct: "Winning after eating a banana does not prove the banana caused the win",
                wrong: ["Bananas do give you energy", `${name} should eat two bananas next time`, "All athletes eat bananas"],
                category: "flaw"
            },
            // Hasty Generalisation
            {
                scenario: (n) => `${n} met two unfriendly cats and says: "All cats are unfriendly!"`,
                correct: "Two cats is far too few to judge all cats — that is a hasty generalisation",
                wrong: ["Cats are actually unfriendly", `${name} should meet more cats`, "Dogs are friendlier than cats"],
                category: "flaw"
            },
            {
                scenario: (n) => `${n} visited one beach that was dirty and says: "All beaches in Australia are dirty."`,
                correct: "One dirty beach cannot represent all beaches — the sample is too small",
                wrong: ["Australian beaches are actually clean", `${name} should visit more beaches`, "That beach needs to be cleaned"],
                category: "flaw"
            },
            {
                scenario: (n) => `${n} asked 2 friends their favourite colour and both said blue. ${n} says: "Blue is everyone's favourite colour!"`,
                correct: "Two friends cannot represent everyone — the sample is far too small",
                wrong: ["Blue is actually the most popular colour", `${name} should ask more people`, "Friends often like the same things"],
                category: "flaw"
            },
            // False Dichotomy
            {
                scenario: (n) => `${n} says: "You are either good at maths or good at art. You cannot be good at both."`,
                correct: "This is a false choice — many people are good at both maths and art",
                wrong: ["Most people are better at one", "Maths and art use different parts of the brain", `${name} is right — you have to choose`],
                category: "flaw"
            },
            {
                scenario: (n) => `${n} says: "Either we go to the park or we stay home. There is nothing else to do."`,
                correct: "There are many other options besides just the park or home",
                wrong: ["The park is the best option", "Staying home is boring", `${name} should ask a parent`],
                category: "flaw"
            },
            // Circular Reasoning
            {
                scenario: (n) => `${n} says: "This is a great book because it is so well-written, and it is well-written because it is a great book."`,
                correct: "This is circular reasoning — the conclusion is being used as its own proof",
                wrong: ["The book really is great", `${name} has good taste in books`, "Well-written books are always great"],
                category: "flaw"
            },
            {
                scenario: (n) => `${n} says: "I am the best swimmer because nobody swims better than me."`,
                correct: "Saying nobody is better is just restating the claim — it is not evidence",
                wrong: [`${name} probably is the best`, "Confidence helps in swimming", `${name} should enter a competition to prove it`],
                category: "flaw"
            },
            // Appeal to Popularity
            {
                scenario: (n) => `${n} says: "This TV show must be good because millions of people watch it."`,
                correct: "Something being popular does not prove it is good",
                wrong: ["Popular shows are always good", "Millions of people cannot be wrong", `${name} should watch it to find out`],
                category: "flaw"
            },
            {
                scenario: (n) => `${n} says: "Everyone in my class wants pizza, so pizza must be the healthiest food."`,
                correct: "Popularity does not equal healthiness — many people liking something does not make it healthy",
                wrong: ["Pizza is actually quite healthy", "Children know what is good for them", `${name} should ask a dietitian`],
                category: "flaw"
            },
            // Irrelevant Evidence
            {
                scenario: (n) => `${n} says: "Tall people must be better at science because my tall cousin got an A in science."`,
                correct: "Height has nothing to do with science ability — the evidence is irrelevant",
                wrong: ["Tall people can see the board better", `${name}'s cousin studied hard`, "One example is enough to prove it"],
                category: "flaw"
            },
            {
                scenario: (n) => `${n} says: "We should listen to the new student's idea because they have cool shoes."`,
                correct: "Having cool shoes is irrelevant to whether an idea is good or bad",
                wrong: ["People with good taste have good ideas", "New students try harder", `${name} should judge ideas by who suggests them`],
                category: "flaw"
            },
            // Cherry-picking
            {
                scenario: (n) => `${n} says: "Our cricket team is great! We won 2 games!" But ${n} does not mention they lost 8 games.`,
                correct: "Only mentioning the wins while hiding the losses is cherry-picking evidence",
                wrong: ["2 wins is still good", "The losses were not important", `${name} is being a good team supporter`],
                category: "flaw"
            },
            // Anecdotal vs Data
            {
                scenario: (n) => `${n} says: "My grandpa never exercised and lived to 90, so exercise is not important."`,
                correct: "One person's story does not disprove what studies of thousands of people have shown",
                wrong: ["Exercise is overrated", "Some people are naturally healthy", `${name}'s grandpa was special`],
                category: "flaw"
            },
            // Confusing Necessary and Sufficient
            {
                scenario: (n) => `${n} says: "You need flour to make a cake. I have flour, so I can make a cake!"`,
                correct: "Flour is necessary but not sufficient — you also need eggs, sugar, and other ingredients",
                wrong: ["Flour is the most important ingredient", `${name} is a good baker`, "You can make a cake with just flour and water"],
                category: "flaw"
            },
            {
                scenario: (n) => `${n} says: "You need a ticket to enter the concert. I have a ticket, so they MUST let me in."`,
                correct: "A ticket is necessary but other conditions might also apply (like arriving on time, correct date)",
                wrong: ["A ticket guarantees entry", `${name} should arrive early`, "Tickets always work"],
                category: "flaw"
            },
            // Appeal to Authority
            {
                scenario: (n) => `${n} says: "My uncle says this is the best car, and he is really smart, so it must be true."`,
                correct: "Being smart does not make someone an expert on cars — an opinion is not a fact",
                wrong: ["Smart people know about cars", `${name}'s uncle is probably right`, "Family members do not lie"],
                category: "flaw"
            },
            // Post hoc
            {
                scenario: (n) => `${n} says: "I washed my hands and then it started raining. Hand washing must cause rain!"`,
                correct: "Just because one thing happened before another does not mean it caused it",
                wrong: ["Water attracts more water", `${name} should test this theory`, "Rain often follows hand washing"],
                category: "flaw"
            }
        ];

        const template = this.randChoice(templates);
        const scenario = template.scenario(name);
        const options = this.shuffle([template.correct, ...template.wrong]);

        return {
            q: `${scenario} What is wrong with this reasoning?`,
            options: options,
            correct: options.indexOf(template.correct),
            explanation: template.correct,
            category: "flaw"
        };
    }

    generateTruthLiarQuestion() {
        const names = this.shuffle(['Amy', 'Ben', 'Cara', 'Dan', 'Emma', 'Finn', 'Grace', 'Hugo', 'Ivy', 'Jack', 'Kate', 'Leo', 'Mia', 'Nate', 'Olive']);
        const truthTeller = names[0];
        const liar = names[1];

        const scenarios = [
            // "Who did it?" scenarios
            () => {
                const action = this.randChoice(['ate the last cookie', 'broke the vase', 'drew on the wall', 'took the toy', 'left the door open']);
                // Liar says they did NOT do it
                return {
                    q: `${truthTeller} always tells the truth. ${liar} always lies. ${liar} says: "I did NOT ${action.replace('ate', 'eat').replace('broke', 'break').replace('drew', 'draw').replace('took', 'take').replace('left', 'leave')} ${action.includes('ate') || action.includes('broke') || action.includes('drew') || action.includes('took') || action.includes('left') ? '' : ''}." What really happened?`,
                    options: [
                        `${liar} did ${action}`,
                        `${liar} did not ${action}`,
                        `${truthTeller} did it`,
                        `We cannot tell`
                    ],
                    correct: 0,
                    explanation: `${liar} always lies. Saying "I did not do it" means ${liar} DID do it.`
                };
            },
            // "What would they say?" scenarios
            () => {
                const item = this.randChoice(['treasure', 'prize', 'answer key', 'secret message']);
                const placeA = this.randChoice(['Box A', 'Drawer 1', 'the red bag']);
                return {
                    q: `${truthTeller} always tells truth. ${liar} always lies. ${truthTeller} says: "${liar} would tell you the ${item} is in ${placeA}." Where is the ${item}?`,
                    options: [
                        `In ${placeA}`,
                        `Not in ${placeA}`,
                        `We need more clues`,
                        `In both places`
                    ],
                    correct: 1,
                    explanation: `${truthTeller} truthfully reports what ${liar} would say. ${liar} would lie. So the ${item} is NOT in ${placeA}.`
                };
            },
            // "Statements about each other"
            () => {
                return {
                    q: `${truthTeller} always tells truth. ${liar} always lies. ${liar} says: "${truthTeller} is a liar." Is this correct?`,
                    options: [
                        `Yes, ${truthTeller} is a liar`,
                        `No — ${liar} is lying, so ${truthTeller} is actually truthful`,
                        `Both are liars`,
                        `We cannot tell`
                    ],
                    correct: 1,
                    explanation: `${liar} always lies. Saying "${truthTeller} is a liar" is a lie. So ${truthTeller} is truthful (which we already knew).`
                };
            },
            // Self-referential
            () => {
                return {
                    q: `One of ${truthTeller} and ${liar} always tells truth, the other always lies. ${liar} says: "I always tell the truth." What do we know?`,
                    options: [
                        `${liar} is the truth-teller`,
                        `${liar} is the liar`,
                        `Both tell the truth`,
                        `We cannot determine who is who from this alone`
                    ],
                    correct: 3,
                    explanation: `Both a truth-teller AND a liar could say "I always tell the truth" — the truth-teller honestly and the liar dishonestly. This statement alone does not help us.`
                };
            }
        ];

        const gen = this.randChoice(scenarios);
        const result = gen();
        result.category = "truthliar";
        return result;
    }

    generateConstraintPuzzle() {
        const allNames = this.shuffle(['Ali', 'Bea', 'Cal', 'Dee', 'Eve', 'Fay', 'Gus', 'Hal', 'Ida', 'Jan', 'Kim', 'Lou', 'Mel', 'Nia', 'Oz']);
        const names = allNames.slice(0, 3);

        const categoryData = [
            { label: 'pet', items: ['a cat', 'a dog', 'a fish'] },
            { label: 'colour', items: ['red', 'blue', 'green'] },
            { label: 'fruit', items: ['an apple', 'a banana', 'a mango'] },
            { label: 'sport', items: ['tennis', 'soccer', 'swimming'] },
            { label: 'instrument', items: ['piano', 'guitar', 'drums'] }
        ];

        const cat = this.randChoice(categoryData);
        const items = this.shuffle([...cat.items]);

        // Assign: names[0]→items[0], names[1]→items[1], names[2]→items[2]
        // Clue 1: names[1] has items[1]
        // Clue 2: names[0] does NOT have items[1] and does NOT have items[2]
        // Question: What does names[0] have? → items[0]

        const clue1 = `${names[1]} has ${items[1]}.`;
        const clue2 = `${names[0]} does not have ${items[2]}.`;

        const options = this.shuffle([items[0], items[1], items[2], 'Cannot tell']);
        return {
            q: `${names[0]}, ${names[1]}, and ${names[2]} each have a different ${cat.label}: ${items[0]}, ${items[1]}, and ${items[2]}. ${clue1} ${clue2} What does ${names[0]} have?`,
            options: options,
            correct: options.indexOf(items[0]),
            explanation: `${names[1]} has ${items[1]}. ${names[0]} does not have ${items[2]}, and ${items[1]} is taken, so ${names[0]} has ${items[0]}.`,
            category: "elimination"
        };
    }

    generateOddOneOutQuestion() {
        const problems = [
            // Number-based: primes
            () => {
                const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
                const selected = this.shuffle(primes).slice(0, 4);
                const nonPrimes = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28];
                const oddOne = this.randChoice(nonPrimes);
                const all = this.shuffle([...selected, oddOne]);
                const options = all.map(String);
                return {
                    q: `Which number does NOT belong: ${all.join(', ')}?`,
                    options: [options[all.indexOf(oddOne)], options[(all.indexOf(oddOne) + 1) % 5], options[(all.indexOf(oddOne) + 2) % 5], options[(all.indexOf(oddOne) + 3) % 5]],
                    correct: 0,
                    explanation: `${selected.join(', ')} are prime numbers. ${oddOne} is not prime.`
                };
            },
            // Number-based: perfect squares
            () => {
                const squares = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
                const selected = this.shuffle(squares).slice(0, 4);
                const nonSquare = this.randChoice([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20].filter(n => !selected.includes(n)));
                const all = this.shuffle([...selected, nonSquare]);
                return {
                    q: `Which number does NOT belong: ${all.join(', ')}?`,
                    options: [String(nonSquare), String(selected[0]), String(selected[1]), String(selected[2])],
                    correct: 0,
                    explanation: `${selected.join(', ')} are perfect squares. ${nonSquare} is not a perfect square.`
                };
            },
            // Number-based: even numbers
            () => {
                const evens = this.shuffle([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]).slice(0, 4);
                const oddNum = this.randChoice([3, 5, 7, 9, 11, 13, 15, 17, 19]);
                const all = this.shuffle([...evens, oddNum]);
                return {
                    q: `Which number does NOT belong: ${all.join(', ')}?`,
                    options: [String(oddNum), String(evens[0]), String(evens[1]), String(evens[2])],
                    correct: 0,
                    explanation: `${evens.join(', ')} are even numbers. ${oddNum} is odd.`
                };
            },
            // Word-based
            () => {
                const groups = [
                    { members: ['eagle', 'sparrow', 'robin', 'parrot'], oddOne: 'crocodile', rule: 'birds', oddRule: 'a reptile' },
                    { members: ['apple', 'pear', 'peach', 'plum'], oddOne: 'potato', rule: 'fruits', oddRule: 'a vegetable' },
                    { members: ['France', 'Japan', 'Brazil', 'Egypt'], oddOne: 'Sydney', rule: 'countries', oddRule: 'a city' },
                    { members: ['addition', 'subtraction', 'multiplication', 'division'], oddOne: 'paragraph', rule: 'maths operations', oddRule: 'a writing term' },
                    { members: ['hammer', 'screwdriver', 'wrench', 'pliers'], oddOne: 'pencil', rule: 'tools', oddRule: 'a writing instrument' }
                ];
                const g = this.randChoice(groups);
                return {
                    q: `Which does NOT belong: ${this.shuffle([...g.members, g.oddOne]).join(', ')}?`,
                    options: [g.oddOne, g.members[0], g.members[1], g.members[2]],
                    correct: 0,
                    explanation: `${g.members.join(', ')} are ${g.rule}. ${g.oddOne} is ${g.oddRule}.`
                };
            }
        ];

        const result = this.randChoice(problems)();
        result.category = "oddoneout";
        return result;
    }

    generateConditionalLogicQuestion() {
        const names = this.shuffle(['Alex', 'Beth', 'Chris', 'Dana', 'Ethan', 'Fiona', 'Gabe', 'Holly', 'Ian', 'Jess', 'Kyle', 'Luna', 'Miles', 'Nina', 'Owen']);
        const name = names[0];

        const scenarios = [
            // Modus Ponens (valid: if P then Q, P is true → Q is true)
            () => {
                const pairs = [
                    { cond: 'it rains', result: `${name} will bring an umbrella`, obs: 'It is raining today' },
                    { cond: `${name} finishes homework`, result: `${name} can play outside`, obs: `${name} finished homework` },
                    { cond: 'the bell rings', result: 'class is over', obs: 'The bell just rang' },
                    { cond: `${name} eats breakfast`, result: `${name} will have energy`, obs: `${name} ate breakfast` }
                ];
                const p = this.randChoice(pairs);
                return {
                    q: `If ${p.cond}, then ${p.result}. ${p.obs}. What can we conclude?`,
                    options: [
                        p.result,
                        `${p.result} might happen`,
                        `We cannot conclude anything`,
                        `The opposite of "${p.result}" is true`
                    ],
                    correct: 0,
                    explanation: `The condition is met, so the result must follow. This is valid reasoning (modus ponens).`
                };
            },
            // Modus Tollens (valid: if P then Q, Q is false → P is false)
            () => {
                const pairs = [
                    { cond: 'the alarm sounds', result: 'everyone evacuates', obsNeg: 'Nobody evacuated' },
                    { cond: `${name} studies`, result: `${name} passes the test`, obsNeg: `${name} did not pass the test` },
                    { cond: 'there is a storm', result: 'the match is cancelled', obsNeg: 'The match was not cancelled' }
                ];
                const p = this.randChoice(pairs);
                return {
                    q: `If ${p.cond}, then ${p.result}. ${p.obsNeg}. What can we conclude?`,
                    options: [
                        `It is not true that ${p.cond}`,
                        `${p.cond} is true`,
                        `We cannot tell`,
                        `${p.result} will happen later`
                    ],
                    correct: 0,
                    explanation: `If the result did not happen, then the condition must not have been true either. This is valid reasoning (modus tollens).`
                };
            },
            // Affirming the Consequent TRAP (invalid: if P then Q, Q is true → P might or might not be true)
            () => {
                const pairs = [
                    { cond: 'it rains', result: 'the ground is wet', obs: 'The ground is wet' },
                    { cond: `${name} practises piano`, result: `${name} plays well`, obs: `${name} plays well` },
                    { cond: 'a dog barks', result: 'there is noise', obs: 'There is noise' }
                ];
                const p = this.randChoice(pairs);
                return {
                    q: `If ${p.cond}, then ${p.result}. ${p.obs}. What can we conclude?`,
                    options: [
                        `${p.cond} is definitely true`,
                        `${p.cond} is definitely false`,
                        `${p.cond} might be true, but there could be other explanations`,
                        `The rule is wrong`
                    ],
                    correct: 2,
                    explanation: `This is a common trap! The result is true, but it could have other causes. We cannot be sure the condition is what caused it.`
                };
            },
            // Denying the Antecedent TRAP (invalid: if P then Q, P is false → we cannot be sure about Q)
            () => {
                const pairs = [
                    { cond: `${name} eats vegetables`, result: `${name} is healthy`, obsNeg: `${name} did not eat vegetables` },
                    { cond: 'it is Saturday', result: 'there is no school', obsNeg: 'It is not Saturday' },
                    { cond: `${name} runs every day`, result: `${name} is fit`, obsNeg: `${name} does not run every day` }
                ];
                const p = this.randChoice(pairs);
                return {
                    q: `If ${p.cond}, then ${p.result}. ${p.obsNeg}. What can we conclude?`,
                    options: [
                        `${p.result} is definitely not true`,
                        `${p.result} is definitely true`,
                        `We cannot be sure — ${p.result} might still be true for other reasons`,
                        `The rule does not apply anymore`
                    ],
                    correct: 2,
                    explanation: `Another common trap! Just because the condition is false does not mean the result is false. There could be other ways to achieve the result.`
                };
            }
        ];

        const result = this.randChoice(scenarios)();
        result.category = "conditional";
        return result;
    }

    // ===== MAIN GENERATORS =====

    generateMathsQuestion() {
        const generators = [
            () => this.generatePatternQuestion(),
            () => this.generateWordProblem(),
            () => this.generateFractionQuestion(),
            () => this.generateTimeQuestion(),
            () => this.generateGeometryQuestion(),
            () => this.generateAverageQuestion()
        ];
        return this.randChoice(generators)();
    }

    generateThinkingQuestion() {
        const generators = [
            () => this.generateLogicQuestion(),
            () => this.generateAnalogyQuestion(),
            () => this.generateCodeQuestion(),
            () => this.generateSequenceQuestion(),
            () => this.generateSpatialQuestion(),
            () => this.generateFindTheFlawQuestion(),
            () => this.generateTruthLiarQuestion(),
            () => this.generateConstraintPuzzle(),
            () => this.generateOddOneOutQuestion(),
            () => this.generateConditionalLogicQuestion()
        ];
        return this.randChoice(generators)();
    }

    // Generate a batch of questions for a session
    generateBatch(count = 5, type = 'mixed') {
        const questions = [];
        for (let i = 0; i < count; i++) {
            if (type === 'maths') {
                questions.push(this.generateMathsQuestion());
            } else if (type === 'thinking') {
                questions.push(this.generateThinkingQuestion());
            } else {
                questions.push(Math.random() < 0.5 
                    ? this.generateMathsQuestion() 
                    : this.generateThinkingQuestion()
                );
            }
        }
        return questions;
    }
}

// Export for use
window.ProceduralOCGenerator = ProceduralOCGenerator;
window.proceduralOC = new ProceduralOCGenerator();
console.log('🎲 Procedural OC Question Generator loaded!');
