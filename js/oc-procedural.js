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
            () => this.generateSpatialQuestion()
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
