import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as db from '../utils/db.js';
import { generateRoadmap, generateChapterContent, generateQuiz, generateMidtermExam, generateFinalExam } from '../utils/ai_engine.js';
import { createProfile, getProfile } from '../utils/db.js';

const router = express.Router();

// Helper function to generate content in background
const generateTopicContent = async (topicId, topic, level, roadmap) => {
  try {
    // Generate chapters and quizzes asynchronously
    for (const chapter of roadmap.chapters) {
      try {
        // Generate chapter content
        const content = await generateChapterContent(
          topic,
          level,
          chapter.chapter_number,
          chapter.title,
          chapter.description,
          chapter.key_concepts
        );

        // Save chapter
        await db.createChapter(
          topicId,
          chapter.chapter_number,
          chapter.title,
          chapter.description,
          content,
          chapter.reading_time,
          chapter.difficulty,
          chapter.key_concepts
        );

        // Generate quiz
        const questions = await generateQuiz(
          topic,
          chapter.chapter_number,
          chapter.title,
          content
        );

        await db.createQuiz(topicId, chapter.chapter_number, questions);
      } catch (error) {
        console.error(`Error generating chapter ${chapter.chapter_number}:`, error);
      }
    }

    // Update topic status to completed
    await db.updateTopic(topicId, { status: 'completed' });
  } catch (error) {
    console.error('Error generating topic content:', error);
    await db.updateTopic(topicId, { status: 'failed' });
  }
};

// ==================== CREATE TOPIC ====================
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { topic_name, level } = req.body;
    const userId = req.userId;

    if (!topic_name || !level) {
      return res.status(400).json({ error: 'Topic name and level required' });
    }

    // Create profile if doesn't exist
    const profile = await getProfile(userId);
    if (!profile) {
      await createProfile(userId);
    }

    // Generate roadmap
    const roadmap = await generateRoadmap(topic_name, level);

    // Create topic
    const topic = await db.createTopic(userId, topic_name, level);

    // Save roadmap to topic
    await db.updateTopicRoadmap(topic.id, roadmap);

    // Start background content generation
    generateTopicContent(topic.id, topic_name, level, roadmap).catch(err => {
      console.error('Background generation error:', err);
    });

    res.json({
      topic_id: topic.id,
      roadmap: roadmap,
      status: 'pending',
    });
  } catch (error) {
    console.error('Create topic error:', error);
    let errorMessage = 'Failed to create topic';

    if (error.message) {
      try {
        const jsonStartIndex = error.message.indexOf('{');
        if (jsonStartIndex !== -1) {
          const jsonStr = error.message.substring(jsonStartIndex);
          const parsed = JSON.parse(jsonStr);
          if (parsed.error && parsed.error.message) {
            errorMessage = parsed.error.message;
          }
        } else {
          errorMessage = error.message;
        }
      } catch (e) {
        errorMessage = error.message;
      }
    }

    if (errorMessage.includes('503') || errorMessage.includes('high demand')) {
      errorMessage = 'The AI model is currently experiencing high demand. Please try again later.';
    }

    res.status(500).json({ error: errorMessage });
  }
});

// ==================== GET TOPIC ====================
router.get('/:topic_id', verifyToken, async (req, res) => {
  try {
    const topic = await db.getTopic(req.params.topic_id);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Verify ownership
    if (topic.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(topic);
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({ error: 'Failed to get topic' });
  }
});

// ==================== GET USER TOPICS ====================
router.get('/', verifyToken, async (req, res) => {
  try {
    const topics = await db.getUserTopics(req.userId);
    res.json(topics);
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ error: 'Failed to get topics' });
  }
});

// ==================== CHECK TOPIC STATUS ====================
router.get('/status/:topic_id', verifyToken, async (req, res) => {
  try {
    const topic = await db.getTopic(req.params.topic_id);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Verify ownership
    if (topic.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      topic_id: topic.id,
      status: topic.status,
      completed: topic.completed,
      roadmap: topic.roadmap,
    });
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// ==================== DELETE TOPIC ====================
router.delete('/:topic_id', verifyToken, async (req, res) => {
  try {
    const topic = await db.getTopic(req.params.topic_id);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Verify ownership
    if (topic.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.deleteTopic(req.params.topic_id);
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

// ==================== COMPLETE TOPIC ====================
router.post('/:topic_id/complete', verifyToken, async (req, res) => {
  try {
    const { total_score, max_score } = req.body;
    const topic = await db.getTopic(req.params.topic_id);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Verify ownership
    if (topic.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await db.updateTopic(req.params.topic_id, {
      completed: true,
      total_score: total_score || 0,
      max_score: max_score || 0,
    });

    res.json(updated);
  } catch (error) {
    console.error('Complete topic error:', error);
    res.status(500).json({ error: 'Failed to complete topic' });
  }
});

// ==================== GENERATE EXAM ====================
router.post('/:topic_id/generate-exam', verifyToken, async (req, res) => {
  try {
    const { exam_type } = req.body;

    if (!exam_type || !['midterm', 'final'].includes(exam_type)) {
      return res.status(400).json({ error: 'Valid exam_type (midterm/final) required' });
    }

    const topic = await db.getTopic(req.params.topic_id);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Verify ownership
    if (topic.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get chapters for context
    const chapters = await db.getChapters(req.params.topic_id);
    const chapterTitles = chapters.map(c => c.title);

    // Generate exam based on type
    let examData;
    if (exam_type === 'midterm') {
      examData = await generateMidtermExam(topic.topic_name, topic.level, chapterTitles);
    } else {
      examData = await generateFinalExam(topic.topic_name, topic.level, chapterTitles);
    }

    // Create exam record
    const exam = await db.createExam(
      req.params.topic_id,
      exam_type,
      examData.mcq_questions,
      examData.short_questions,
      examData.capstone || null
    );

    res.json({
      exam_id: exam.id,
      exam_type: exam_type,
      mcq_questions: examData.mcq_questions,
      short_questions: examData.short_questions,
      capstone: examData.capstone,
      total_marks: exam_type === 'midterm' ? 30 : 50,
    });
  } catch (error) {
    console.error('Generate exam error:', error);
    res.status(500).json({ error: 'Failed to generate exam' });
  }
});

// ==================== GET EXAMS ====================
router.get('/:topic_id/exams', verifyToken, async (req, res) => {
  try {
    const topic = await db.getTopic(req.params.topic_id);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Verify ownership
    if (topic.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const exams = await db.getExams(req.params.topic_id);
    res.json(exams);
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ error: 'Failed to get exams' });
  }
});

export default router;
