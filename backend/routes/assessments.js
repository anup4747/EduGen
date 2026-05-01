import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as db from '../utils/db.js';
import { generateMidtermExam, generateFinalExam } from '../utils/ai_engine.js';

const router = express.Router();

// ==================== SUBMIT QUIZ ====================
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { quiz_id, user_answers, score } = req.body;

    if (!quiz_id || !user_answers || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.submitQuiz(quiz_id, req.userId, user_answers, score);

    // Create result record
    await db.createResult(req.userId, result.topic_id, 'quiz', quiz_id, score, 10);

    res.json({
      message: 'Quiz submitted successfully',
      score: score,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// ==================== SUBMIT EXAM ====================
router.post('/exam/submit', verifyToken, async (req, res) => {
  try {
    const { exam_id, user_answers, score } = req.body;

    if (!exam_id || !user_answers || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.submitExam(exam_id, req.userId, user_answers, score);

    // Determine max score based on exam type
    const maxScore = result.exam_type === 'midterm' ? 30 : 50;

    // Create result record
    await db.createResult(req.userId, result.topic_id, 'exam', exam_id, score, maxScore);

    res.json({
      message: 'Exam submitted successfully',
      score: score,
      max_score: maxScore,
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

// ==================== GET RESULTS ====================
router.get('/:topic_id', verifyToken, async (req, res) => {
  try {
    const results = await db.getResults(req.params.topic_id, req.userId);

    // Calculate aggregated results
    const assessments = results.map(r => ({
      id: r.id,
      type: r.assessment_type,
      score: r.score,
      max_score: r.max_score,
      percentage: r.percentage,
      passed: r.passed,
      completed_at: r.created_at,
    }));

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const maxScore = results.reduce((sum, r) => sum + r.max_score, 0);
    const percentage = maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(2) : 0;

    res.json({
      assessments: assessments,
      total_score: totalScore,
      max_score: maxScore,
      percentage: percentage,
      all_completed: results.length > 0,
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

export default router;
