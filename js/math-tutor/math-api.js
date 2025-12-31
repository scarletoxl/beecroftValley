// js/math-tutor/math-api.js
// Anthropic API integration for Buzzy the math tutor

class MathTutorAPI {
    constructor() {
        this.conversationHistory = [];
        this.maxHistory = 10;

        // Buzzy's personality
        this.systemPrompt = `You are Buzzy, a friendly bee who runs the Number Garden math tutoring centre in Beecroft, NSW, Australia. You help Year 3 students (around 7-8 years old) learn mental arithmetic.

PERSONALITY:
- Warm, silly, encouraging, patient
- Use bee puns occasionally ("Bee-rilliant!", "Buzz-tastic!", "Let's bee brave!")
- Australian casual tone (g'day, mate, no worries)
- Never shaming, always curious and supportive
- Keep responses SHORT (1-3 sentences max)

THE NUMBER GARDEN:
- You teach math using a 10×10 grid (0-99) visualised as a flower garden
- Each row is a different coloured flower
- Addition = flying right/down, Subtraction = flying left/up
- You help kids "see" the numbers and navigate the grid mentally

TEACHING APPROACH:
- When a student is correct: Brief celebration, then move on
- When struggling: Ask guiding questions, don't give answers directly
- Use the grid as a mental model: "Where would you land if you started at 34 and hopped down 2 rows?"
- Encourage visualisation: "Can you picture where 47 is on our garden?"

ADAPTIVE RESPONSES:
- If student seems distracted: Gently suggest a break
- If frustrated: Slow down, offer easier problem, be extra encouraging
- If bored: Acknowledge their skill, offer a challenge
- If improving: Celebrate growth specifically

Never break character. Never mention being an AI. Keep it fun and garden-themed!`;
    }

    // Generate greeting based on session state
    async generateGreeting(studentName, lastSession = null) {
        let prompt;

        if (lastSession) {
            prompt = `Student "${studentName}" is returning to the Number Garden. Last session: ${lastSession.skillsWorked.join(', ')}, accuracy ${lastSession.accuracy}%. Generate a warm, personalized welcome (1-2 sentences).`;
        } else {
            prompt = `New student "${studentName}" is visiting the Number Garden for the first time. Generate an excited, welcoming greeting (1-2 sentences). Briefly mention the flower garden theme.`;
        }

        return this.callAPI(prompt, 'greeting');
    }

    // Generate response to correct answer
    async generateCorrectResponse(problem, timeSeconds, streak) {
        const prompt = `Student answered "${problem.question}" correctly in ${timeSeconds} seconds. Current streak: ${streak} correct. Generate brief celebration (1 sentence). ${streak >= 3 ? 'Mention the streak!' : ''}`;

        return this.callAPI(prompt, 'feedback');
    }

    // Generate response to incorrect answer
    async generateIncorrectResponse(problem, studentAnswer, studentState) {
        const prompt = `Student answered "${problem.question}" with "${studentAnswer}" but the answer is ${problem.answer}.
Student state: ${studentState}.
Hint available: "${problem.hint}"
Generate a supportive response (2-3 sentences). Don't give the answer directly. Guide them using the grid visualization concept. ${studentState === 'frustrated' ? 'Be extra gentle.' : ''}`;

        return this.callAPI(prompt, 'feedback');
    }

    // Generate hint
    async generateHint(problem, attemptNumber) {
        const prompt = `Student needs help with "${problem.question}". This is attempt #${attemptNumber}.
Base hint: "${problem.hint}"
Generate a Socratic hint that uses the Number Garden grid concept. ${attemptNumber > 1 ? 'Be more direct this time.' : 'Start gently.'}`;

        return this.callAPI(prompt, 'hint');
    }

    // Generate distraction/break suggestion
    async generateBreakSuggestion(reason) {
        const prompts = {
            distracted: "Student seems distracted (long pauses). Gently suggest taking a break. Mention that the flowers will still be here when they return.",
            frustrated: "Student seems frustrated (fast wrong answers). Suggest a break in a caring way. Maybe they need a snack or fresh air?",
            declining: "Student's performance is declining. They might be tired. Suggest wrapping up for now and celebrating what they accomplished."
        };

        return this.callAPI(prompts[reason] || prompts.distracted, 'break');
    }

    // Generate session summary
    async generateSessionSummary(summary, medalsEarned = [], goldEarned = 0) {
        const prompt = `Generate a session wrap-up for a student who just finished:
- Problems attempted: ${summary.totalProblems}
- Accuracy: ${summary.accuracy}%
- Skills practiced: ${summary.skillsWorked.join(', ')}
- Session length: ${summary.duration} minutes
- Gold earned: ${goldEarned}
${medalsEarned.length > 0 ? `- Medals earned: ${medalsEarned.join(', ')}!` : ''}

Be specific about what they did well. Mention one thing to work on next time. Keep it warm and encouraging (3-4 sentences max).`;

        return this.callAPI(prompt, 'summary');
    }

    // Generate word problem with Beecroft context
    async generateWordProblem(skill, difficulty) {
        const prompt = `Generate a Year 3 word problem for ${skill} at difficulty ${difficulty}/5.
Use Beecroft, NSW locations: railway station, Woolworths, playground, library, school.
Main character: Wei Wei (a young girl).
Include the question, answer, and a hint. Format as JSON:
{"question": "...", "answer": number, "hint": "..."}`;

        const response = await this.callAPI(prompt, 'word_problem');

        try {
            // Try to parse as JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error('Failed to parse word problem JSON:', e);
        }

        // Fallback
        return null;
    }

    // Core API call
    async callAPI(userMessage, messageType = 'general') {
        // Add context to history
        this.conversationHistory.push({
            role: 'user',
            content: `[${messageType}] ${userMessage}`
        });

        // Trim history
        if (this.conversationHistory.length > this.maxHistory * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistory * 2);
        }

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 200,
                    system: this.systemPrompt,
                    messages: this.conversationHistory
                })
            });

            if (!response.ok) {
                console.error('API error:', response.status);
                return this.getFallbackResponse(messageType);
            }

            const data = await response.json();
            const assistantMessage = data.content[0].text;

            // Add to history
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            return assistantMessage;

        } catch (error) {
            console.error('API call failed:', error);
            return this.getFallbackResponse(messageType);
        }
    }

    // Fallback responses when API fails
    getFallbackResponse(messageType) {
        const fallbacks = {
            greeting: "Buzz buzz! Welcome to the Number Garden! Let's have some fun with numbers today!",
            feedback: "Good try! Let's keep going!",
            hint: "Think about where that number lives in our garden...",
            break: "Hey friend, want to take a little break? The flowers will wait for you!",
            summary: "Great practice today! You're getting better every time. See you next time!",
            word_problem: null,
            general: "Let's keep buzzing along!"
        };

        return fallbacks[messageType] || fallbacks.general;
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathTutorAPI;
}
