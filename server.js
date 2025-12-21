// Beecroft Valley - Game Server with AI NPC Conversations
// Uses Claude Haiku for cheap, fast NPC dialogue

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// MIME types for static files
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// NPC conversation history (in-memory, per session)
const conversationHistory = new Map();

// Call Claude API
async function callClaude(npcContext, playerMessage, conversationId) {
    if (!ANTHROPIC_API_KEY) {
        return { error: 'API key not configured', response: npcContext.greeting };
    }

    // Get or create conversation history
    let history = conversationHistory.get(conversationId) || [];

    // Add player message to history
    history.push({ role: 'user', content: playerMessage });

    // Keep only last 10 exchanges to save tokens
    if (history.length > 20) {
        history = history.slice(-20);
    }

    const systemPrompt = `You are ${npcContext.name}, ${npcContext.role} at ${npcContext.location} in Beecroft, a leafy suburb in Sydney, Australia.

Character details:
- Name: ${npcContext.name}
- Role: ${npcContext.role}
- Location: ${npcContext.location}
- Personality hint: ${npcContext.greeting}

Rules:
- Stay in character at all times
- Keep responses SHORT (1-2 sentences max, like real conversation)
- Be friendly and Australian in tone (casual, warm)
- Reference Beecroft, local landmarks, or your workplace naturally
- If asked something you wouldn't know, deflect in character
- Never break character or mention being an AI
- Use occasional Australian slang naturally (g'day, mate, no worries, reckon, arvo)`;

    try {
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
            return { error: 'API error', response: npcContext.greeting };
        }

        const data = await response.json();
        const assistantMessage = data.content[0].text;

        // Add assistant response to history
        history.push({ role: 'assistant', content: assistantMessage });
        conversationHistory.set(conversationId, history);

        return { response: assistantMessage };
    } catch (error) {
        console.error('Error calling Claude:', error);
        return { error: error.message, response: npcContext.greeting };
    }
}

// Handle API requests
async function handleAPI(req, res, body) {
    if (req.url === '/api/chat' && req.method === 'POST') {
        try {
            const data = JSON.parse(body);
            const { npc, message, conversationId } = data;

            if (!npc || !message) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing npc or message' }));
                return;
            }

            const result = await callClaude(npc, message, conversationId || 'default');

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(result));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    if (req.url === '/api/chat/clear' && req.method === 'POST') {
        try {
            const data = JSON.parse(body);
            conversationHistory.delete(data.conversationId || 'default');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
}

// Serve static files
function serveStatic(req, res) {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath.split('?')[0]);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
}

// Create server
const server = http.createServer((req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // API routes
    if (req.url.startsWith('/api/')) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => handleAPI(req, res, body));
        return;
    }

    // Static files
    serveStatic(req, res);
});

server.listen(PORT, () => {
    console.log(`🐝 Beecroft Valley server running at http://localhost:${PORT}`);
    if (ANTHROPIC_API_KEY) {
        console.log('✨ AI NPC conversations enabled (Claude Haiku)');
    } else {
        console.log('⚠️  No ANTHROPIC_API_KEY - NPCs will use static dialogues');
    }
});
