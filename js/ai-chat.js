// Beecroft Valley - AI NPC Conversation System
// Connects to server for Claude Haiku-powered dialogues

class AIChat {
    constructor() {
        this.currentNPC = null;
        this.conversationId = null;
        this.isLoading = false;
        this.chatHistory = [];
    }

    // Start a conversation with an NPC
    startConversation(npc, location) {
        this.currentNPC = {
            name: npc.name,
            role: npc.role,
            emoji: npc.emoji,
            greeting: npc.greeting,
            location: location || 'Beecroft'
        };
        this.conversationId = `${npc.name}-${Date.now()}`;
        this.chatHistory = [];

        // Add greeting to history
        this.chatHistory.push({
            role: 'npc',
            text: npc.greeting
        });

        return npc.greeting;
    }

    // Send a message to the NPC
    async sendMessage(playerMessage) {
        if (!this.currentNPC || this.isLoading) return null;

        this.isLoading = true;

        // Add player message to local history
        this.chatHistory.push({
            role: 'player',
            text: playerMessage
        });

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    npc: this.currentNPC,
                    message: playerMessage,
                    conversationId: this.conversationId
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const npcResponse = data.response;

            // Add NPC response to local history
            this.chatHistory.push({
                role: 'npc',
                text: npcResponse
            });

            this.isLoading = false;
            return npcResponse;
        } catch (error) {
            console.error('AI Chat error:', error);
            this.isLoading = false;

            // Fallback to greeting or generic response
            const fallback = this.currentNPC.greeting || "Sorry, I didn't catch that.";
            this.chatHistory.push({
                role: 'npc',
                text: fallback
            });
            return fallback;
        }
    }

    // End the current conversation
    endConversation() {
        if (this.conversationId) {
            // Clear server-side history
            fetch('/api/chat/clear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId: this.conversationId })
            }).catch(() => {}); // Ignore errors
        }

        this.currentNPC = null;
        this.conversationId = null;
        this.chatHistory = [];
    }

    // Get current NPC info
    getNPC() {
        return this.currentNPC;
    }

    // Get chat history
    getHistory() {
        return this.chatHistory;
    }

    // Check if currently in a conversation
    isInConversation() {
        return this.currentNPC !== null;
    }
}

// Create and export singleton instance
const aiChat = new AIChat();
