import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as db from '../utils/db.js';

const router = express.Router();

// ==================== GET CHAPTERS ====================
router.get('/:topic_id', verifyToken, async (req, res) => {
  try {
    // Verify user has access to this topic
    const topic = await db.getTopic(req.params.topic_id);
    if (!topic || topic.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const chapters = await db.getChapters(req.params.topic_id);
    res.json(chapters);
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ error: 'Failed to get chapters' });
  }
});

export default router;
