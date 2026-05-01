import express from 'express';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { generateChatResponse } from '../utils/ai_engine.js';

const router = express.Router();

// ==================== CHAT (HTTP) ====================
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { message, topic = '', context = '', conversation_history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const response = await generateChatResponse(message, topic, context, conversation_history);

    res.json({
      response: response,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export default router;
