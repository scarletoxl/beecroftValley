// Hard OC Question Generators - Year 4-5+ difficulty
// Enhanced version of oc-procedural.js with harder questions

class HardOCGenerator {
    constructor() { this.random = Math.random; }

    randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    generateOptions(correct, count = 4) {
        const opts = [correct];
        const variants = [correct+this.randInt(1,8), correct-this.randInt(1,8), correct+this.randInt(10,30),
            correct-this.randInt(10,30), correct*2, Math.floor(correct/2), correct+this.randInt(5,15),
            correct-this.randInt(5,15)].filter(v => v > 0 && v !== correct);
        while (opts.length < count && variants.length > 0) {
            const idx = Math.floor(Math.random() * variants.length);
            if (!opts.includes(variants[idx])) opts.push(variants.splice(idx,1)[0]);
            else variants.splice(idx,1);
        }
        while (opts.length < count) {
            const v = correct + this.randInt(-30,30);
            if (v > 0 && !opts.includes(v)) opts.push(v);
        }
        return this.shuffle(opts);
    }
    makeQ(q, answer, explanation, category, section) {
        const options = this.generateOptions(answer);
        return { q, options: options.map(String), correct: options.indexOf(answer), explanation, category, section, difficulty: 'hard' };
    }
    makeQText(q, opts, correctIdx, explanation, category, section) {
        return { q, options: opts, correct: correctIdx, explanation, category, section, difficulty: 'hard' };
    }

    // ===== HARD MATHS GENERATORS =====

    generateHardPatternQuestion() {
        const patterns = [
            () => { // Alternating ×2, +5
                const start = this.randInt(2, 6);
                const mult = this.randInt(2, 3);
                const add = this.randInt(3, 7);
                const seq = [start];
                for (let i = 0; i < 5; i++) {
                    seq.push(i % 2 === 0 ? seq[seq.length-1] * mult : seq[seq.length-1] + add);
                }
                const answer = seq.length % 2 === 1 ? seq[seq.length-1] * mult : seq[seq.length-1] + add;
                const shown = seq.slice(0, 5);
                return { q: `Find the pattern: ${shown.join(', ')}, ?, ...`, answer, explanation: `Pattern alternates: ×${mult} then +${add}. ${shown[4]} ${shown.length % 2 === 0 ? '+ '+add : '× '+mult} = ${answer}` };
            },
            () => { // Fibonacci-style
                const a = this.randInt(2, 8); const b = this.randInt(3, 10);
                const seq = [a, b]; for (let i = 0; i < 4; i++) seq.push(seq[seq.length-1] + seq[seq.length-2]);
                const answer = seq[5] + seq[4];
                const shown = seq.slice(0, 6);
                return { q: `Each number is the sum of the two before it: ${shown.join(', ')}, ?`, answer, explanation: `${seq[4]} + ${seq[5]} = ${answer}` };
            },
            () => { // Cube numbers
                const start = this.randInt(1, 3);
                const seq = []; for (let i = start; i < start+4; i++) seq.push(i*i*i);
                const answer = (start+4) * (start+4) * (start+4);
                return { q: `These are cube numbers: ${seq.join(', ')}, ?`, answer, explanation: `${start+4}³ = ${start+4} × ${start+4} × ${start+4} = ${answer}` };
            },
            () => { // Decreasing with multiplication
                const start = this.randInt(500, 1000);
                const div = this.randInt(2, 3);
                const seq = [start]; for (let i = 0; i < 3; i++) seq.push(Math.floor(seq[seq.length-1] / div));
                const answer = Math.floor(seq[3] / div);
                return { q: `What comes next: ${seq.join(', ')}, ?`, answer, explanation: `Each number is divided by ${div}. ${seq[3]} ÷ ${div} = ${answer}` };
            },
            () => { // Triangular numbers
                const start = this.randInt(1, 3);
                const seq = []; let sum = 0;
                for (let i = start; i < start+5; i++) { sum += i; seq.push(sum); }
                const answer = sum + start + 5;
                return { q: `Find the next number: ${seq.join(', ')}, ?`, answer, explanation: `Differences increase by 1 each time (+${start+1}, +${start+2}, +${start+3}...). Next difference is +${start+5}, so ${seq[4]} + ${start+5} = ${answer}` };
            }
        ];
        const p = this.randChoice(patterns)();
        return this.makeQ(p.q, p.answer, p.explanation, 'patterns', 'maths');
    }

    generateHardWordProblem() {
        const names = ['Aisha','Ben','Chloe','Dev','Emma','Finn','Grace','Hugo','Isla','Jake'];
        const n = this.randChoice(names);
        const problems = [
            () => { // 3-step: buy, get change, buy more
                const has = this.randInt(50, 100);
                const item1Price = this.randInt(8, 20); const item1Qty = this.randInt(2, 4);
                const item2Price = this.randInt(3, 10); const item2Qty = this.randInt(1, 3);
                const spent = item1Price * item1Qty + item2Price * item2Qty;
                const answer = has - spent;
                return { q: `${n} has $${has}. They buy ${item1Qty} books at $${item1Price} each and ${item2Qty} pens at $${item2Price} each. How much money is left?`, answer, explanation: `Books: ${item1Qty} × $${item1Price} = $${item1Price*item1Qty}. Pens: ${item2Qty} × $${item2Price} = $${item2Price*item2Qty}. Total spent: $${spent}. Left: $${has} - $${spent} = $${answer}` };
            },
            () => { // Rate problem
                const rate = this.randInt(12, 25); const hours = this.randInt(3, 8);
                const bonus = this.randInt(20, 50);
                const answer = rate * hours + bonus;
                return { q: `${n} earns $${rate} per hour and works ${hours} hours. They also get a $${bonus} bonus. What is their total pay?`, answer, explanation: `$${rate} × ${hours} = $${rate*hours}, plus $${bonus} bonus = $${answer}` };
            },
            () => { // Remainder problem
                const students = this.randInt(25, 45); const perGroup = this.randInt(4, 8);
                const groups = Math.floor(students / perGroup);
                const answer = students - groups * perGroup;
                return { q: `${students} students are put into groups of ${perGroup}. How many students are left over?`, answer: answer === 0 ? perGroup : answer, explanation: answer === 0 ? `${students} ÷ ${perGroup} = ${groups} exactly, so ${perGroup} would be in the last group` : `${students} ÷ ${perGroup} = ${groups} groups with ${answer} left over` };
            },
            () => { // Profit/loss
                const cost = this.randInt(15, 40); const qty = this.randInt(10, 30);
                const sellPrice = cost + this.randInt(3, 12);
                const answer = (sellPrice - cost) * qty;
                return { q: `${n} buys ${qty} items at $${cost} each and sells them at $${sellPrice} each. What is the total profit?`, answer, explanation: `Profit per item: $${sellPrice} - $${cost} = $${sellPrice-cost}. Total: $${sellPrice-cost} × ${qty} = $${answer}` };
            }
        ];
        const p = this.randChoice(problems)();
        return this.makeQ(p.q, p.answer, p.explanation, 'word', 'maths');
    }

    generateHardFractionQuestion() {
        const problems = [
            () => { // Add fractions different denominators
                const d1 = this.randChoice([3,4,5,6]); const d2 = this.randChoice([4,5,6,8].filter(x=>x!==d1));
                const n1 = this.randInt(1, d1-1); const n2 = this.randInt(1, d2-1);
                const lcd = d1 * d2; // simple LCD
                const num = n1 * d2 + n2 * d1;
                const gcd = (a,b) => b === 0 ? a : gcd(b, a%b);
                const g = gcd(num, lcd);
                const ansNum = num/g; const ansDen = lcd/g;
                const answer = ansNum; // We'll use text options for this
                const opts = this.shuffle([`${ansNum}/${ansDen}`, `${n1+n2}/${d1+d2}`, `${ansNum+1}/${ansDen}`, `${ansNum}/${ansDen+1}`]);
                return { q: `What is ${n1}/${d1} + ${n2}/${d2}? Simplify your answer.`, opts, correctAnswer: `${ansNum}/${ansDen}`, explanation: `${n1}/${d1} + ${n2}/${d2} = ${n1*d2}/${lcd} + ${n2*d1}/${lcd} = ${num}/${lcd} = ${ansNum}/${ansDen}` };
            },
            () => { // Fraction of a number (harder)
                const d = this.randChoice([5,6,7,8,9]);
                const n = this.randInt(2, d-1);
                const total = d * this.randInt(8, 20);
                const answer = (total / d) * n;
                return { q: `What is ${n}/${d} of ${total}?`, answer, explanation: `${total} ÷ ${d} = ${total/d}, then × ${n} = ${answer}` };
            },
            () => { // Mixed number to improper
                const whole = this.randInt(2, 5); const n = this.randInt(1, 3); const d = this.randInt(4, 8);
                const answer = whole * d + n;
                const opts = this.shuffle([`${answer}/${d}`, `${whole*d}/${d}`, `${answer+d}/${d}`, `${answer}/${d+1}`]);
                return { q: `Convert ${whole} ${n}/${d} to an improper fraction. What is the numerator?`, answer, explanation: `${whole} × ${d} + ${n} = ${whole*d} + ${n} = ${answer}. So the answer is ${answer}/${d}` };
            },
            () => { // Compare fractions
                const d1 = this.randChoice([3,5,7]); const d2 = this.randChoice([4,6,8]);
                const n1 = this.randInt(1,d1-1); const n2 = this.randInt(1,d2-1);
                const v1 = n1/d1; const v2 = n2/d2;
                const bigger = v1 > v2 ? `${n1}/${d1}` : `${n2}/${d2}`;
                const opts = this.shuffle([`${n1}/${d1}`, `${n2}/${d2}`, 'They are equal', 'Cannot tell']);
                return { q: `Which is larger: ${n1}/${d1} or ${n2}/${d2}?`, opts, correctAnswer: v1 === v2 ? 'They are equal' : bigger, explanation: `${n1}/${d1} = ${(v1).toFixed(3)}, ${n2}/${d2} = ${(v2).toFixed(3)}. ${v1===v2?'They are equal':bigger+' is larger.'}` };
            }
        ];
        const p = this.randChoice(problems)();
        if (p.opts) return this.makeQText(p.q, p.opts, p.opts.indexOf(p.correctAnswer), p.explanation, 'fractions', 'maths');
        return this.makeQ(p.q, p.answer, p.explanation, 'fractions', 'maths');
    }

    generateHardTimeQuestion() {
        const problems = [
            () => { // Cross midnight
                const startH = this.randInt(9, 11); const startM = this.randChoice([0,15,30,45]);
                const durH = this.randInt(2, 5); const durM = this.randChoice([0,15,30,45]);
                let endH = startH + durH; let endM = startM + durM;
                if (endM >= 60) { endM -= 60; endH++; }
                const isPM = endH >= 12;
                const displayH = endH > 12 ? endH - 12 : endH;
                const fmt = (h,m) => `${h}:${m.toString().padStart(2,'0')}`;
                const answer = fmt(displayH, endM);
                const period = isPM ? 'AM' : 'AM'; // stays AM since crossing midnight
                const wrongTimes = [fmt(displayH+1,endM), fmt(displayH,(endM+15)%60), fmt(displayH===12?1:displayH-1,endM)];
                const opts = this.shuffle([answer + ' AM', ...wrongTimes.map(t=>t+' AM')]);
                return { q: `A train departs at ${fmt(startH,startM)} PM. The journey takes ${durH} hours and ${durM} minutes. What time does it arrive?`, opts, correctAnswer: answer + ' AM', explanation: `${fmt(startH,startM)} PM + ${durH}h ${durM}m = ${answer} AM (crosses midnight)` };
            },
            () => { // Multiple events scheduling
                const event1 = this.randInt(30, 60); const break1 = this.randInt(10, 20);
                const event2 = this.randInt(45, 90); const break2 = this.randInt(15, 30);
                const event3 = this.randInt(30, 60);
                const total = event1 + break1 + event2 + break2 + event3;
                const answer = total;
                return { q: `A school concert has 3 acts: ${event1} min, ${event2} min, and ${event3} min. There are breaks of ${break1} min and ${break2} min between acts. How many minutes from start to finish?`, answer, explanation: `${event1} + ${break1} + ${event2} + ${break2} + ${event3} = ${total} minutes` };
            },
            () => { // How many minutes between
                const h1 = this.randInt(9, 11); const m1 = this.randChoice([0,10,15,20,30,45]);
                const h2 = this.randInt(1, 4); const m2 = this.randChoice([0,10,15,20,30,45]);
                let diff = (12 - h1) * 60 - m1 + h2 * 60 + m2;
                const answer = diff;
                const fmt = (h,m) => `${h}:${m.toString().padStart(2,'0')}`;
                return { q: `How many minutes are there between ${fmt(h1,m1)} AM and ${fmt(h2,m2)} PM?`, answer, explanation: `From ${fmt(h1,m1)} AM to 12:00 PM = ${(12-h1)*60-m1} min. From 12:00 PM to ${fmt(h2,m2)} PM = ${h2*60+m2} min. Total = ${answer} min.` };
            }
        ];
        const p = this.randChoice(problems)();
        if (p.opts) return this.makeQText(p.q, p.opts, p.opts.indexOf(p.correctAnswer), p.explanation, 'time', 'maths');
        return this.makeQ(p.q, p.answer, p.explanation, 'time', 'maths');
    }

    generateHardGeometryQuestion() {
        const problems = [
            () => { // L-shape area
                const w1 = this.randInt(4, 10); const h1 = this.randInt(6, 14);
                const w2 = this.randInt(2, w1-1); const h2 = this.randInt(2, h1-2);
                const answer = w1 * h1 - w2 * h2;
                return { q: `An L-shaped room is made by cutting a ${w2}m × ${h2}m rectangle from a ${w1}m × ${h1}m rectangle. What is the area of the L-shape?`, answer, explanation: `Full rectangle: ${w1} × ${h1} = ${w1*h1}m². Cut out: ${w2} × ${h2} = ${w2*h2}m². L-shape: ${w1*h1} - ${w2*h2} = ${answer}m²` };
            },
            () => { // Volume
                const l = this.randInt(3, 10); const w = this.randInt(2, 8); const h = this.randInt(2, 6);
                const answer = l * w * h;
                return { q: `A box is ${l}cm long, ${w}cm wide, and ${h}cm tall. What is its volume?`, answer, explanation: `Volume = ${l} × ${w} × ${h} = ${answer}cm³` };
            },
            () => { // Angles on a straight line
                const a1 = this.randInt(30, 80); const a2 = this.randInt(20, 70);
                const answer = 180 - a1 - a2;
                if (answer < 10) return this.generateHardGeometryQuestion();
                return { q: `Three angles on a straight line measure ${a1}°, ${a2}°, and x°. What is x?`, answer, explanation: `Angles on a straight line = 180°. x = 180 - ${a1} - ${a2} = ${answer}°` };
            },
            () => { // Perimeter of compound shape
                const side = this.randInt(4, 10);
                const answer = side * 6; // hexagon-like
                return { q: `A regular hexagon has sides of ${side}cm. What is its perimeter?`, answer, explanation: `A hexagon has 6 sides. Perimeter = 6 × ${side} = ${answer}cm` };
            },
            () => { // Circle-related
                const r = this.randInt(3, 10);
                const answer = r * 2;
                return { q: `A circle has a radius of ${r}cm. What is its diameter?`, answer, explanation: `Diameter = 2 × radius = 2 × ${r} = ${answer}cm` };
            }
        ];
        const p = this.randChoice(problems)();
        return this.makeQ(p.q, p.answer, p.explanation, 'geometry', 'maths');
    }

    generateHardPlaceValueQuestion() {
        const problems = [
            () => { const n = this.randInt(100000, 999999); const d = this.randChoice([100,1000,10000]);
                const answer = Math.round(n/d)*d;
                return { q: `Round ${n.toLocaleString()} to the nearest ${d.toLocaleString()}.`, answer, explanation: `${n.toLocaleString()} rounded to nearest ${d.toLocaleString()} = ${answer.toLocaleString()}` }; },
            () => { const n = this.randInt(1000000, 9999999);
                const digit = this.randChoice(['thousands','ten thousands','hundred thousands']);
                const place = digit==='thousands'?3:digit==='ten thousands'?4:5;
                const answer = Math.floor(n / Math.pow(10, place)) % 10;
                return { q: `In the number ${n.toLocaleString()}, what digit is in the ${digit} place?`, answer, explanation: `${n.toLocaleString()} — the ${digit} digit is ${answer}` }; },
            () => { const a=this.randInt(200000,500000); const b=this.randInt(300000,600000);
                const answer=a+b;
                return { q: `${a.toLocaleString()} + ${b.toLocaleString()} = ?`, answer, explanation: `${a.toLocaleString()} + ${b.toLocaleString()} = ${answer.toLocaleString()}` }; }
        ];
        const p = this.randChoice(problems)();
        return this.makeQ(p.q, p.answer, p.explanation, 'place_value', 'maths');
    }

    generateHardPercentageQuestion() {
        const problems = [
            () => { const total=this.randInt(40,200); const pct=this.randChoice([10,15,20,25,30,40,50,75]);
                const answer=total*pct/100;
                return { q: `What is ${pct}% of ${total}?`, answer, explanation: `${pct}% of ${total} = ${total} × ${pct}/100 = ${answer}` }; },
            () => { const price=this.randInt(40,150); const discount=this.randChoice([10,15,20,25,30,50]);
                const answer=price-price*discount/100;
                return { q: `A $${price} item has a ${discount}% discount. What is the sale price?`, answer, explanation: `Discount: $${price} × ${discount}% = $${price*discount/100}. Sale: $${price} - $${price*discount/100} = $${answer}` }; },
            () => { const original=this.randInt(50,200); const increase=this.randChoice([10,20,25,50]);
                const answer=original+original*increase/100;
                return { q: `A shop increases prices by ${increase}%. An item was $${original}. What is the new price?`, answer, explanation: `Increase: $${original} × ${increase}% = $${original*increase/100}. New: $${original} + $${original*increase/100} = $${answer}` }; }
        ];
        const p = this.randChoice(problems)();
        return this.makeQ(p.q, p.answer, p.explanation, 'percentages', 'maths');
    }

    generateHardMultiStepQuestion() {
        const names=['Aisha','Ben','Chloe','Dev','Emma','Finn'];
        const n=this.randChoice(names);
        const problems = [
            () => { // Work backwards
                const answer=this.randInt(20,60); const doubled=answer*2; const added=this.randInt(5,15); const result=doubled+added;
                return { q: `${n} thinks of a number, doubles it, then adds ${added}. The result is ${result}. What was the number?`, answer, explanation: `Work backwards: ${result} - ${added} = ${doubled}. ${doubled} ÷ 2 = ${answer}` }; },
            () => { // Unequal sharing
                const total=this.randInt(60,200); const ratio1=this.randInt(2,4); const ratio2=ratio1+this.randInt(1,3);
                const parts=ratio1+ratio2; const perPart=total/parts;
                if(!Number.isInteger(perPart)) return this.generateHardMultiStepQuestion();
                const answer=ratio2*perPart;
                return { q: `${n} and a friend share $${total}. ${n} gets $${ratio1} for every $${ratio2} their friend gets. How much does the friend get?`, answer, explanation: `Ratio ${ratio1}:${ratio2} = ${parts} parts. Each part = $${total}/${parts} = $${perPart}. Friend: ${ratio2} × $${perPart} = $${answer}` }; },
            () => { // Multi-buy
                const items=this.randInt(3,6); const price=this.randInt(8,25);
                const taxPct=10; const total=items*price; const tax=total*taxPct/100; const answer=total+tax;
                return { q: `${n} buys ${items} items at $${price} each. A ${taxPct}% tax is added. What is the total cost?`, answer, explanation: `${items} × $${price} = $${total}. Tax: $${total} × 10% = $${tax}. Total: $${total} + $${tax} = $${answer}` }; }
        ];
        const p = this.randChoice(problems)();
        return this.makeQ(p.q, p.answer, p.explanation, 'multistep', 'maths');
    }

    generateHardAverageQuestion() {
        const problems = [
            () => { // Find missing number given average
                const count=this.randInt(4,6); const target=this.randInt(15,35);
                const nums=[]; for(let i=0;i<count-1;i++) nums.push(target+this.randInt(-8,8));
                const sum=nums.reduce((a,b)=>a+b,0); const answer=target*count-sum;
                if(answer<0) return this.generateHardAverageQuestion();
                return { q: `The average of ${count} numbers is ${target}. The numbers are ${nums.join(', ')} and one unknown. What is the unknown number?`, answer, explanation: `Total needed: ${target} × ${count} = ${target*count}. Sum so far: ${sum}. Missing: ${target*count} - ${sum} = ${answer}` }; },
            () => { // Mean vs median
                const nums=this.shuffle([this.randInt(2,10),this.randInt(10,20),this.randInt(20,30),this.randInt(30,40),this.randInt(40,50)]);
                const sorted=[...nums].sort((a,b)=>a-b);
                const median=sorted[2]; const mean=Math.round(nums.reduce((a,b)=>a+b,0)/5);
                const answer=median;
                return { q: `Find the median of: ${nums.join(', ')}`, answer, explanation: `Sorted: ${sorted.join(', ')}. The median (middle value) is ${median}.` }; },
            () => { // Weighted average (test scores)
                const s1=this.randInt(60,90); const s2=this.randInt(70,95); const s3=this.randInt(50,85);
                const answer=Math.round((s1+s2+s3)/3);
                return { q: `Test scores: ${s1}, ${s2}, ${s3}. What is the mean score (rounded)?`, answer, explanation: `(${s1} + ${s2} + ${s3}) ÷ 3 = ${s1+s2+s3} ÷ 3 = ${((s1+s2+s3)/3).toFixed(1)} ≈ ${answer}` }; }
        ];
        const p = this.randChoice(problems)();
        return this.makeQ(p.q, p.answer, p.explanation, 'averages', 'maths');
    }

    generateHardRatioQuestion() {
        const problems = [
            () => { // Share in ratio
                const r1=this.randInt(2,5); const r2=this.randInt(1,4); const r3=this.randInt(1,3);
                const total=(r1+r2+r3)*this.randInt(5,15); const perPart=total/(r1+r2+r3);
                const answer=r1*perPart;
                return { q: `Share $${total} in the ratio ${r1}:${r2}:${r3}. What is the largest share?`, answer, explanation: `Total parts: ${r1+r2+r3}. Per part: $${total}/${r1+r2+r3} = $${perPart}. Largest (${r1}): ${r1} × $${perPart} = $${answer}` }; },
            () => { // Scale recipe
                const orig=this.randInt(4,8); const scale=this.randInt(2,4);
                const ingredient=this.randInt(100,500);
                const answer=ingredient*scale/orig*orig; // simplified: ingredient * scale
                return { q: `A recipe for ${orig} people uses ${ingredient}g of flour. How much flour for ${orig*scale} people?`, answer: ingredient*scale, explanation: `${orig*scale} ÷ ${orig} = ${scale} times the recipe. ${ingredient}g × ${scale} = ${ingredient*scale}g` }; },
            () => { // Map scale
                const scale=this.randChoice([1000,2000,5000,10000]);
                const mapDist=this.randInt(3,15);
                const answer=mapDist*scale/100; // in metres
                return { q: `On a map, 1cm = ${(scale/100)}m. Two places are ${mapDist}cm apart on the map. What is the real distance in metres?`, answer, explanation: `${mapDist}cm × ${scale/100}m = ${answer}m` }; }
        ];
        const p = this.randChoice(problems)();
        return this.makeQ(p.q, p.answer, p.explanation, 'ratios', 'maths');
    }

    // ===== HARD THINKING GENERATORS =====

    generateHardLogicQuestion() {
        const allNames = ['Amy','Ben','Cara','Dan','Eva','Finn','Grace','Hugo','Ivy','Jake','Kai','Luna'];
        const problems = [
            () => { // 4-person ordering
                const ns = this.shuffle(allNames).slice(0,4);
                return { q: `${ns[0]} is older than ${ns[1]}.\n${ns[2]} is younger than ${ns[1]}.\n${ns[3]} is older than ${ns[0]}.\nWho is the youngest?`, opts: this.shuffle([ns[2],ns[1],ns[0],ns[3]]), correctAnswer: ns[2], explanation: `Order: ${ns[3]} > ${ns[0]} > ${ns[1]} > ${ns[2]}. ${ns[2]} is youngest.` }; },
            () => { // Syllogism with negation
                const groups = this.shuffle(['Bloops','Razzles','Quibs','Zings','Plonks']).slice(0,3);
                return { q: `All ${groups[0]} are ${groups[1]}.\nNo ${groups[1]} are ${groups[2]}.\nWhich must be TRUE?`, opts: this.shuffle([`No ${groups[0]} are ${groups[2]}`,`All ${groups[2]} are ${groups[0]}`,`Some ${groups[0]} are ${groups[2]}`,`All ${groups[1]} are ${groups[0]}`]), correctAnswer: `No ${groups[0]} are ${groups[2]}`, explanation: `All ${groups[0]} are ${groups[1]}, and no ${groups[1]} are ${groups[2]}, so no ${groups[0]} can be ${groups[2]}.` }; },
            () => { // 5-person seating
                const ns = this.shuffle(allNames).slice(0,5);
                return { q: `Five friends sit in a row.\n${ns[0]} sits in the middle.\n${ns[1]} sits to the right of ${ns[0]}.\n${ns[2]} sits at the far left.\nWho sits between ${ns[2]} and ${ns[0]}?`, opts: this.shuffle([ns[3],ns[1],ns[4],ns[2]]), correctAnswer: ns[3], explanation: `Left to right: ${ns[2]}, ${ns[3]}, ${ns[0]}, ${ns[1]}, ${ns[4]}. ${ns[3]} is between ${ns[2]} and ${ns[0]}.` }; }
        ];
        const p = this.randChoice(problems)();
        return this.makeQText(p.q, p.opts, p.opts.indexOf(p.correctAnswer), p.explanation, 'logic', 'thinking');
    }

    generateHardAnalogyQuestion() {
        const analogies = [
            { a:'HAMMER', b:'CARPENTER', c:'SCALPEL', answer:'SURGEON', wrong:['KNIFE','DOCTOR','PATIENT'] },
            { a:'TELESCOPE', b:'ASTRONOMER', c:'MICROSCOPE', answer:'BIOLOGIST', wrong:['SMALL','SCIENTIST','LENS'] },
            { a:'DROUGHT', b:'FAMINE', c:'EARTHQUAKE', answer:'TSUNAMI', wrong:['RAIN','BUILDING','SHAKE'] },
            { a:'CHAPTER', b:'BOOK', c:'VERSE', answer:'POEM', wrong:['SONG','BIBLE','LINE'] },
            { a:'COMPASS', b:'DIRECTION', c:'THERMOMETER', answer:'TEMPERATURE', wrong:['HEAT','MERCURY','WEATHER'] },
            { a:'PUPIL', b:'EYE', c:'VALVE', answer:'HEART', wrong:['BLOOD','VEIN','LUNG'] },
            { a:'ARCHIPELAGO', b:'ISLANDS', c:'CONSTELLATION', answer:'STARS', wrong:['SKY','PLANETS','SPACE'] },
            { a:'SEED', b:'TREE', c:'EGG', answer:'BIRD', wrong:['NEST','CHICK','SHELL'] },
            { a:'GUILTY', b:'INNOCENT', c:'ANCIENT', answer:'MODERN', wrong:['OLD','NEW','FUTURE'] },
            { a:'CONDUCTOR', b:'ORCHESTRA', c:'CAPTAIN', answer:'TEAM', wrong:['SHIP','ARMY','SPORT'] }
        ];
        const an = this.randChoice(analogies);
        const opts = this.shuffle([an.answer, ...an.wrong]);
        return this.makeQText(`${an.a} is to ${an.b} as ${an.c} is to ___?`, opts, opts.indexOf(an.answer), `${an.a} → ${an.b} shows the same relationship as ${an.c} → ${an.answer}`, 'analogies', 'thinking');
    }

    generateHardCodeQuestion() {
        const problems = [
            () => { // Two-step: shift then reverse
                const shift = this.randInt(1,3);
                const words = ['HELP','STOP','GAME','PLAY','MIND','TALK'];
                const word = this.randChoice(words);
                let encoded = '';
                for (const c of word) encoded += String.fromCharCode(((c.charCodeAt(0)-65+shift)%26)+65);
                encoded = encoded.split('').reverse().join('');
                const wrongs = words.filter(w=>w!==word).slice(0,3);
                return { q: `A code shifts each letter forward by ${shift} (A→${String.fromCharCode(65+shift)}), then reverses the word.\n"${encoded}" decodes to:`, opts: this.shuffle([word,...wrongs]), correctAnswer: word, explanation: `Reverse "${encoded}" = ${encoded.split('').reverse().join('')}, then shift back ${shift}: ${word}` };
            },
            () => { // Letter value sums (A=1..Z=26)
                const words = ['BRAIN','SMART','THINK','LOGIC','SOLVE'];
                const word = this.randChoice(words);
                let sum = 0; for (const c of word) sum += c.charCodeAt(0) - 64;
                const breakdown = word.split('').map(c=>`${c}=${c.charCodeAt(0)-64}`).join('+');
                return { q: `If A=1, B=2, C=3...Z=26, what is the value of ${word}?`, answer: sum, explanation: `${breakdown} = ${sum}` };
            },
            () => { // Number code with operation
                const mult = this.randInt(2,4); const add = this.randInt(1,5);
                const letters = [['A',1],['B',2],['C',3],['D',4],['E',5]];
                const coded = letters.map(([l,v]) => [l, v*mult+add]);
                const target = this.randChoice(['F','G','H']);
                const tVal = (target.charCodeAt(0)-64)*mult+add;
                return { q: `In a code: ${coded.slice(0,3).map(([l,v])=>`${l}=${v}`).join(', ')}\nWhat does ${target} equal?`, answer: tVal, explanation: `Pattern: letter position × ${mult} + ${add}. ${target} is position ${target.charCodeAt(0)-64}: ${target.charCodeAt(0)-64} × ${mult} + ${add} = ${tVal}` };
            }
        ];
        const p = this.randChoice(problems)();
        if (p.opts) return this.makeQText(p.q, p.opts, p.opts.indexOf(p.correctAnswer), p.explanation, 'codes', 'thinking');
        return this.makeQ(p.q, p.answer, p.explanation, 'codes', 'thinking');
    }

    generateHardSequenceQuestion() {
        const problems = [
            () => { // Alternating operations
                const start = this.randInt(2,8); const mult = this.randInt(2,3); const add = this.randInt(3,10);
                const seq = [start]; for(let i=0;i<5;i++) seq.push(i%2===0 ? seq[seq.length-1]*mult : seq[seq.length-1]+add);
                const answer = seq.length%2===1 ? seq[seq.length-1]*mult : seq[seq.length-1]+add;
                return { q: `What comes next: ${seq.slice(0,5).join(', ')}, ?`, answer, explanation: `Alternating: ×${mult}, +${add}. Answer = ${answer}` };
            },
            () => { // Letter + number combined
                const startL = this.randInt(0,10); const stepL = this.randInt(2,3);
                const startN = this.randInt(1,5); const stepN = this.randInt(3,7);
                const seq = []; for(let i=0;i<4;i++) seq.push(String.fromCharCode(65+startL+i*stepL)+(startN+i*stepN));
                const ansL = String.fromCharCode(65+startL+4*stepL);
                const ansN = startN+4*stepN;
                const answer = ansL+ansN;
                const wrongs = [String.fromCharCode(65+startL+3*stepL)+ansN, ansL+(ansN+stepN), String.fromCharCode(65+startL+5*stepL)+(ansN-stepN)];
                return { q: `What comes next: ${seq.join(', ')}, ?`, opts: this.shuffle([answer,...wrongs]), correctAnswer: answer, explanation: `Letters go +${stepL} (${seq.map(s=>s[0]).join(',')}), numbers +${stepN}. Next: ${answer}` };
            }
        ];
        const p = this.randChoice(problems)();
        if (p.opts) return this.makeQText(p.q, p.opts, p.opts.indexOf(p.correctAnswer), p.explanation, 'sequences', 'thinking');
        return this.makeQ(p.q, p.answer, p.explanation, 'sequences', 'thinking');
    }

    generateHardSpatialQuestion() {
        const problems = [
            () => { // Paper folds
                const folds = this.randInt(2,4); const holes = this.randInt(1,2);
                const answer = holes * Math.pow(2, folds);
                return { q: `A piece of paper is folded ${folds} times, then ${holes} hole${holes>1?'s are':' is'} punched through all layers. How many holes when unfolded?`, answer, explanation: `${folds} folds = ${Math.pow(2,folds)} layers. ${holes} × ${Math.pow(2,folds)} = ${answer} holes` };
            },
            () => { // Cube net - opposite faces
                const faces = [['top','bottom'],['front','back'],['left','right']];
                const pair = this.randChoice(faces);
                const labels = this.shuffle(['A','B','C','D','E','F']);
                return { q: `On a cube, ${labels[0]} is opposite ${labels[1]}, ${labels[2]} is opposite ${labels[3]}. Which face is opposite ${labels[4]}?`, opts: this.shuffle([labels[5],labels[0],labels[2],labels[3]]), correctAnswer: labels[5], explanation: `${labels[0]}↔${labels[1]}, ${labels[2]}↔${labels[3]}, so ${labels[4]}↔${labels[5]}` };
            },
            () => { // Rotation
                const shapes = ['arrow pointing up','arrow pointing right','arrow pointing down','arrow pointing left'];
                const rotations = [90,180,270];
                const rot = this.randChoice(rotations);
                const start = 0; const endIdx = (start + rot/90) % 4;
                return { q: `An ${shapes[0]} is rotated ${rot}° clockwise. Which direction does it point?`, opts: this.shuffle(['Up','Right','Down','Left']), correctAnswer: ['Up','Right','Down','Left'][endIdx], explanation: `${rot}° clockwise from up → ${shapes[endIdx].replace('arrow pointing ','')}` };
            }
        ];
        const p = this.randChoice(problems)();
        if (p.opts) return this.makeQText(p.q, p.opts, p.opts.indexOf(p.correctAnswer), p.explanation, 'spatial', 'thinking');
        return this.makeQ(p.q, p.answer, p.explanation, 'spatial', 'thinking');
    }

    generateHardFlawQuestion() {
        const names = ['Mia','Jake','Lily','Noah','Ava','Liam','Zoe','Kai'];
        const n = this.randChoice(names);
        const templates = [
            { scenario: n => `${n} says: "If we allow students to use calculators in maths, next they'll want to use them in spelling tests, and then they won't learn anything at all!"`,
              correct: "This is a slippery slope — jumping to extreme conclusions without evidence each step will happen",
              wrong: ["Calculators do lead to less learning","Students should never use calculators","The school should decide"], category: 'flaw' },
            { scenario: n => `${n} says: "You think we should eat less meat? So you want everyone to starve?"`,
              correct: "This is a straw man — exaggerating the argument to make it easier to attack",
              wrong: ["Eating less meat does cause starvation","Meat is essential for survival","The argument is valid"], category: 'flaw' },
            { scenario: n => `${n}'s team lost. ${n} says: "The referee was unfair, it was raining, and the field was muddy." But the other team played in the same conditions.`,
              correct: "These are irrelevant excuses — both teams faced identical conditions, so they don't explain the loss",
              wrong: ["Rain does affect performance","The referee might have been unfair","Muddy fields help some teams"], category: 'flaw' },
            { scenario: n => `${n} says: "My favourite singer says this brand of shoes is the best, so they must be the best shoes."`,
              correct: "This is a false appeal to authority — being a good singer doesn't make someone an expert on shoes",
              wrong: ["Famous people know quality","The shoes are probably good","Singers walk a lot so they know shoes"], category: 'flaw' },
            { scenario: n => `${n} says: "We should feel sorry for the company that was fined for polluting — their workers might lose jobs!" But the question was whether pollution should be punished.`,
              correct: "This is an appeal to emotion — using sympathy to distract from the real question about accountability",
              wrong: ["Workers' jobs are the most important issue","Companies should never be fined","Pollution is not that serious"], category: 'flaw' },
            { scenario: n => `${n} says: "Getting a 70% on a test is basically the same as failing, because you still got 30% wrong."`,
              correct: "This is a false equivalence — 70% correct is very different from failing, even though some answers were wrong",
              wrong: ["70% really is close to failing","Getting anything wrong means you failed","Only 100% is passing"], category: 'flaw' }
        ];
        const t = this.randChoice(templates);
        const scenario = t.scenario(n);
        const opts = this.shuffle([t.correct, ...t.wrong]);
        return this.makeQText(`${scenario}\n\nWhat is wrong with this reasoning?`, opts, opts.indexOf(t.correct), t.correct, 'flaw', 'thinking');
    }

    generateHardTruthLiarQuestion() {
        const ns = this.shuffle(['Amy','Ben','Cara','Dan','Eva','Finn']).slice(0,3);
        const problems = [
            () => { // 3 people: truth-teller, liar, identify who
                return { q: `${ns[0]} always tells truth. ${ns[1]} always lies. ${ns[2]}'s behaviour is unknown.\n\n${ns[1]} says: "${ns[0]} is a liar."\n${ns[0]} says: "${ns[2]} told the truth yesterday."\n\nWhat do we know for certain?`,
                    opts: this.shuffle([`${ns[1]} is lying about ${ns[0]}`,`${ns[0]} is actually the liar`,`${ns[2]} always tells truth`,`Nothing can be determined`]),
                    correctAnswer: `${ns[1]} is lying about ${ns[0]}`, explanation: `We know ${ns[1]} always lies. So "${ns[0]} is a liar" is false — ${ns[0]} tells truth (which we already knew).` }; },
            () => { // What's in the box
                return { q: `${ns[0]} always tells truth. ${ns[1]} always lies.\nThere is a prize in either Box A or Box B.\n${ns[1]} says: "The prize is in Box A."\nWhere is the prize?`,
                    opts: this.shuffle(['Box B','Box A','Could be either','Neither box']),
                    correctAnswer: 'Box B', explanation: `${ns[1]} always lies. If they say "Box A", the prize must be in Box B.` }; },
            () => { // Double negation
                return { q: `${ns[0]} always tells truth. ${ns[1]} always lies.\n${ns[0]} says: "${ns[1]} would say the answer is 42."\nIf ${ns[1]} would lie about the answer, what is the real answer?`,
                    opts: this.shuffle(['Not 42','42','We cannot tell','Both could be right']),
                    correctAnswer: 'Not 42', explanation: `${ns[0]} truthfully tells us what ${ns[1]} would say. ${ns[1]} would lie. So if ${ns[1]} would say 42, the real answer is NOT 42.` }; }
        ];
        const p = this.randChoice(problems)();
        return this.makeQText(p.q, p.opts, p.opts.indexOf(p.correctAnswer), p.explanation, 'truthliar', 'thinking');
    }

    generateHardConstraintQuestion() {
        const ns = this.shuffle(['Ali','Bea','Cal','Dee','Eve','Fay','Gus']).slice(0,4);
        const catData = [
            { label:'pet', items:['a cat','a dog','a fish','a bird'] },
            { label:'colour', items:['red','blue','green','yellow'] },
            { label:'sport', items:['tennis','soccer','swimming','basketball'] },
            { label:'instrument', items:['piano','guitar','drums','violin'] }
        ];
        const cat = this.randChoice(catData);
        const items = this.shuffle([...cat.items]);
        // Assignment: ns[i] -> items[i]
        const clue1 = `${ns[1]} has ${items[1]}.`;
        const clue2 = `${ns[2]} has ${items[2]}.`;
        const clue3 = `${ns[0]} does not have ${items[3]}.`;
        const opts = this.shuffle([items[0], items[1], items[2], items[3]]);
        return this.makeQText(
            `${ns.join(', ')} each have a different ${cat.label}: ${items.join(', ')}.\n${clue1}\n${clue2}\n${clue3}\nWhat does ${ns[0]} have?`,
            opts, opts.indexOf(items[0]),
            `${ns[1]}=${items[1]}, ${ns[2]}=${items[2]}. ${ns[0]} doesn't have ${items[3]}, and ${items[1]} and ${items[2]} are taken, so ${ns[0]} has ${items[0]}.`,
            'constraint', 'thinking'
        );
    }

    generateHardConditionalQuestion() {
        const ns = this.shuffle(['Alex','Beth','Chris','Dana','Ethan']).slice(0,3);
        const problems = [
            () => { // Chain of 3 conditionals
                return { q: `If ${ns[0]} goes to the party, ${ns[1]} will go.\nIf ${ns[1]} goes, ${ns[2]} will go.\n${ns[0]} goes to the party.\n\nWhat must be true?`,
                    opts: this.shuffle([`Both ${ns[1]} and ${ns[2]} will go`,`Only ${ns[1]} will go`,`Only ${ns[2]} will go`,`Neither will go`]),
                    correctAnswer: `Both ${ns[1]} and ${ns[2]} will go`, explanation: `${ns[0]} goes → ${ns[1]} goes → ${ns[2]} goes. Both must go.` }; },
            () => { // Contrapositive
                return { q: `If it is raining, the ground is wet.\nThe ground is NOT wet.\n\nWhat can we conclude?`,
                    opts: this.shuffle(['It is not raining','It might be raining','The ground is sometimes dry when it rains','Nothing']),
                    correctAnswer: 'It is not raining', explanation: `Contrapositive: if NOT wet → NOT raining. Since ground is not wet, it is not raining.` }; },
            () => { // Biconditional
                return { q: `The alarm rings if AND ONLY IF there is a fire.\nThe alarm is ringing.\n\nWhat do we know?`,
                    opts: this.shuffle(['There is definitely a fire','There might be a fire','There is no fire','The alarm is broken']),
                    correctAnswer: 'There is definitely a fire', explanation: `"If and only if" means the alarm rings ↔ fire. Alarm is ringing, so there must be a fire.` }; }
        ];
        const p = this.randChoice(problems)();
        return this.makeQText(p.q, p.opts, p.opts.indexOf(p.correctAnswer), p.explanation, 'conditional', 'thinking');
    }

    generateHardVennQuestion() {
        const problems = [
            () => { // 3-circle Venn
                const total = this.randInt(30,50);
                const a = this.randInt(12,20); const b = this.randInt(10,18); const c = this.randInt(8,15);
                const ab = this.randInt(3,6); const bc = this.randInt(2,5); const ac = this.randInt(2,4);
                const abc = this.randInt(1,2);
                const none = total - (a+b+c-ab-bc-ac+abc);
                if (none < 0) return this.generateHardVennQuestion();
                const answer = none;
                return { q: `In a class of ${total}: ${a} play soccer, ${b} play cricket, ${c} play tennis.\n${ab} play soccer AND cricket, ${bc} play cricket AND tennis, ${ac} play soccer AND tennis.\n${abc} play all three.\n\nHow many play NONE of these sports?`, answer, explanation: `Using inclusion-exclusion: ${a}+${b}+${c}-${ab}-${bc}-${ac}+${abc} = ${a+b+c-ab-bc-ac+abc}. None: ${total} - ${a+b+c-ab-bc-ac+abc} = ${answer}` };
            },
            () => { // 2-circle overlap
                const total = this.randInt(25,40);
                const a = this.randInt(15,25); const b = this.randInt(12,22);
                const neither = this.randInt(2,6);
                const answer = a + b - (total - neither);
                if (answer < 1) return this.generateHardVennQuestion();
                return { q: `${total} students were surveyed. ${a} like chocolate, ${b} like vanilla, and ${neither} like neither.\n\nHow many like BOTH chocolate and vanilla?`, answer, explanation: `Total who like at least one: ${total} - ${neither} = ${total-neither}. Both: ${a} + ${b} - ${total-neither} = ${answer}` };
            }
        ];
        const p = this.randChoice(problems)();
        return this.makeQ(p.q, p.answer, p.explanation, 'venn', 'thinking');
    }

    // ===== MAIN GENERATORS =====

    generateHardMathsQuestion(category) {
        const generators = {
            patterns: () => this.generateHardPatternQuestion(),
            word: () => this.generateHardWordProblem(),
            fractions: () => this.generateHardFractionQuestion(),
            time: () => this.generateHardTimeQuestion(),
            geometry: () => this.generateHardGeometryQuestion(),
            place_value: () => this.generateHardPlaceValueQuestion(),
            percentages: () => this.generateHardPercentageQuestion(),
            multistep: () => this.generateHardMultiStepQuestion(),
            averages: () => this.generateHardAverageQuestion(),
            ratios: () => this.generateHardRatioQuestion()
        };
        if (category && generators[category]) return generators[category]();
        const keys = Object.keys(generators);
        return generators[this.randChoice(keys)]();
    }

    generateHardThinkingQuestion(category) {
        const generators = {
            logic: () => this.generateHardLogicQuestion(),
            analogies: () => this.generateHardAnalogyQuestion(),
            codes: () => this.generateHardCodeQuestion(),
            sequences: () => this.generateHardSequenceQuestion(),
            spatial: () => this.generateHardSpatialQuestion(),
            flaw: () => this.generateHardFlawQuestion(),
            truthliar: () => this.generateHardTruthLiarQuestion(),
            constraint: () => this.generateHardConstraintQuestion(),
            conditional: () => this.generateHardConditionalQuestion(),
            venn: () => this.generateHardVennQuestion()
        };
        if (category && generators[category]) return generators[category]();
        const keys = Object.keys(generators);
        return generators[this.randChoice(keys)]();
    }

    // Get all available maths categories
    get mathsCategories() {
        return ['patterns','word','fractions','time','geometry','place_value','percentages','multistep','averages','ratios'];
    }

    // Get all available thinking categories
    get thinkingCategories() {
        return ['logic','analogies','codes','sequences','spatial','flaw','truthliar','constraint','conditional','venn'];
    }
}

// Export
window.HardOCGenerator = HardOCGenerator;
window.hardOCGen = new HardOCGenerator();
console.log('🧠 Hard OC Question Generator loaded!');
