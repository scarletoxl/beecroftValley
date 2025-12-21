// Netlify Function for AI NPC Chat
// Uses Claude Haiku for cheap, fast NPC dialogue

const conversationHistory = new Map();

exports.handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'API key not configured', response: 'Sorry, I cannot chat right now.' })
        };
    }

    try {
        const { npc, message, conversationId } = JSON.parse(event.body);

        if (!npc || !message) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing npc or message' })
            };
        }

        // Get or create conversation history
        let history = conversationHistory.get(conversationId) || [];
        history.push({ role: 'user', content: message });

        // Keep only last 10 exchanges
        if (history.length > 20) {
            history = history.slice(-20);
        }

        const systemPrompt = `You are ${npc.name}, ${npc.role} at ${npc.location} in Beecroft, a leafy suburb in Sydney, Australia.

Character details:
- Name: ${npc.name}
- Role: ${npc.role}
- Location: ${npc.location}
- Personality hint: ${npc.greeting}

Rules:
- Stay in character at all times
- Keep responses SHORT (1-2 sentences max, like real conversation)
- Be friendly and Australian in tone (casual, warm)
- Reference Beecroft, local landmarks, or your workplace naturally
- If asked something you wouldn't know, deflect in character
- Never break character or mention being an AI
- Use occasional Australian slang naturally (g'day, mate, no worries, reckon, arvo)`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-haiku-20241022',
                max_tokens: 150,
                system: systemPrompt,
                messages: history
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Claude API error:', error);
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ response: npc.greeting })
            };
        }

        const data = await response.json();
        const assistantMessage = data.content[0].text;

        // Update history
        history.push({ role: 'assistant', content: assistantMessage });
        conversationHistory.set(conversationId, history);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ response: assistantMessage })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ response: 'G\'day! Sorry, bit busy right now.' })
        };
    }
};
