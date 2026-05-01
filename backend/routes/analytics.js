import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as db from '../utils/db.js';

const router = express.Router();

// ==================== RECORD STUDY SESSION ====================
router.post('/study', verifyToken, async (req, res) => {
  try {
    const { topic_id, seconds } = req.body;

    if (!topic_id || !seconds) {
      return res.status(400).json({ error: 'Topic ID and seconds required' });
    }

    const analytics = await db.recordAnalytics(req.userId, topic_id, seconds);
    res.json(analytics);
  } catch (error) {
    console.error('Record analytics error:', error);
    res.status(500).json({ error: 'Failed to record analytics' });
  }
});

// ==================== GET USER ANALYTICS ====================
router.get('/user/:user_id', verifyToken, async (req, res) => {
  try {
    if (req.params.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const analytics = await db.getUserAnalytics(req.userId);

    // Group by topic and calculate stats
    const topicStats = {};
    analytics.forEach(record => {
      if (!topicStats[record.topic_id]) {
        topicStats[record.topic_id] = {
          total_seconds: 0,
          sessions: 0,
        };
      }
      topicStats[record.topic_id].total_seconds += record.study_time_seconds;
      topicStats[record.topic_id].sessions += 1;
    });

    res.json(topicStats);
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: 'Failed to get user analytics' });
  }
});

// ==================== GET TOPIC ANALYTICS ====================
router.get('/:user_id/:topic_id', verifyToken, async (req, res) => {
  try {
    if (req.params.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const analytics = await db.getAnalytics(req.userId, req.params.topic_id);

    // Calculate aggregated stats
    const totalSeconds = analytics.reduce((sum, a) => sum + a.study_time_seconds, 0);
    const sessions = analytics.length;

    res.json({
      total_study_time_seconds: totalSeconds,
      total_sessions: sessions,
      sessions: analytics,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});



export default router;
