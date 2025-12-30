# 🏫 OC Practice System for Beecroft Valley

## What's Included

| File | Purpose |
|------|---------|
| `js/oc-practice.js` | Main OC test system with UI, question banks, scoring |
| `js/oc-procedural.js` | **Infinite question generator** - new questions every time! |
| `js/oc-integration.js` | Hooks OC practice to school markers in game |
| `index.html` | Demo page (standalone test) |

## How It Works

### In the Game
When player clicks on any school marker (Beecroft Public School, Smart Cookies, Cheltenham Girls' High, etc.), the game automatically opens the OC Practice modal.

### Integration Code
Add to your main `index.html`:
```html
<script src="js/oc-procedural.js"></script>
<script src="js/oc-practice.js"></script>
<script src="js/oc-integration.js"></script>
```

### The `interactWithMarker` patch
The `oc-integration.js` automatically patches the game's `interactWithMarker()` to detect schools:
```javascript
if (b.isSchool || b.type === 'school') {
    this.openSchoolOCPractice(marker);
}
```

## Features

### 🎲 Always-New Questions
The **Procedural Generator** creates unique questions each session:
- **Maths**: Patterns, word problems, fractions, time, geometry, averages
- **Thinking**: Logic puzzles, analogies, codes, sequences, spatial reasoning
- Numbers, names, and values are randomized each time!

### 📊 Score Tracking
- Progress saved to localStorage
- Separate scores for Reading, Maths, Thinking
- Best streaks tracked

### 💰 Game Rewards
- +10 gold per correct answer
- Results shown with emoji feedback

### ⏱️ Optional Timed Mode
- 30 seconds per question
- Visual countdown with warning at 10s

## Question Mix (per session)

| Section | Procedural | Static Bank | Total |
|---------|------------|-------------|-------|
| Reading | 0 | 5 | 5 (passages need curation) |
| Maths | 3 | 2 | 5 |
| Thinking | 3 | 2 | 5 |

## Testing

Open `index.html` directly in a browser to test the OC system standalone (no game needed).

## Schools with OC Practice

From `markers.js`, these POIs trigger OC practice:
- Beecroft Public School 🏫
- Smart Cookies Early Learning Centre 👶  
- Cheltenham Early Education 👶
- Cheltenham Girls' High School 🏫

---

*Built for Year 3-4 OC exam preparation in Beecroft Valley*
