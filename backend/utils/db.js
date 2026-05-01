import { supabaseAdmin as supabase } from './supabase.js';
import { v4 as uuidv4 } from 'uuid';

// ==================== TOPICS ====================
export const createTopic = async (userId, topicName, level) => {
  const topicId = uuidv4();
  const { data, error } = await supabase
    .from('topics')
    .insert([
      {
        id: topicId,
        user_id: userId,
        topic_name: topicName,
        level: level,
        status: 'pending',
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const getUserTopics = async (userId) => {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getTopic = async (topicId) => {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single();

  if (error) throw error;
  return data;
};

export const updateTopic = async (topicId, updates) => {
  const { data, error } = await supabase
    .from('topics')
    .update(updates)
    .eq('id', topicId)
    .select();

  if (error) throw error;
  return data?.[0];
};

export const updateTopicRoadmap = async (topicId, roadmap) => {
  const { data, error } = await supabase
    .from('topics')
    .update({
      roadmap: roadmap,
      status: 'generating',
    })
    .eq('id', topicId)
    .select();

  if (error) throw error;
  return data?.[0];
};

export const deleteTopic = async (topicId) => {
  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', topicId);

  if (error) throw error;
  return true;
};

// ==================== CHAPTERS ====================
export const createChapter = async (topicId, chapterNumber, title, description, content, readingTime, difficulty, keyConcepts) => {
  const { data, error } = await supabase
    .from('chapters')
    .insert([
      {
        id: uuidv4(),
        topic_id: topicId,
        chapter_number: chapterNumber,
        title: title,
        description: description,
        content: content,
        reading_time: readingTime,
        difficulty: difficulty,
        key_concepts: keyConcepts,
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const getChapters = async (topicId) => {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('topic_id', topicId)
    .order('chapter_number', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getChapter = async (topicId, chapterNumber) => {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('topic_id', topicId)
    .eq('chapter_number', chapterNumber)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// ==================== QUIZZES ====================
export const createQuiz = async (topicId, chapterNumber, questions) => {
  const { data, error } = await supabase
    .from('quizzes')
    .insert([
      {
        id: uuidv4(),
        topic_id: topicId,
        chapter_number: chapterNumber,
        questions: questions,
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const getQuizzes = async (topicId) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('topic_id', topicId)
    .order('chapter_number', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const submitQuiz = async (quizId, userId, userAnswers, score) => {
  const { data, error } = await supabase
    .from('quizzes')
    .update({
      user_id: userId,
      user_answers: userAnswers,
      score: score,
      completed: true,
    })
    .eq('id', quizId)
    .select();

  if (error) throw error;
  return data?.[0];
};

// ==================== EXAMS ====================
export const createExam = async (topicId, examType, mcqQuestions, shortQuestions, capstone) => {
  const { data, error } = await supabase
    .from('exams')
    .insert([
      {
        id: uuidv4(),
        topic_id: topicId,
        exam_type: examType,
        mcq_questions: mcqQuestions,
        short_questions: shortQuestions,
        capstone: capstone,
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const getExams = async (topicId) => {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getExam = async (examId) => {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single();

  if (error) throw error;
  return data;
};

export const submitExam = async (examId, userId, userAnswers, score) => {
  const { data, error } = await supabase
    .from('exams')
    .update({
      user_id: userId,
      user_answers: userAnswers,
      score: score,
      completed: true,
    })
    .eq('id', examId)
    .select();

  if (error) throw error;
  return data?.[0];
};

// ==================== RESULTS ====================
export const createResult = async (userId, topicId, assessmentType, assessmentId, score, maxScore) => {
  const percentage = ((score / maxScore) * 100).toFixed(2);
  const passed = percentage >= 60;

  const { data, error } = await supabase
    .from('results')
    .insert([
      {
        id: uuidv4(),
        user_id: userId,
        topic_id: topicId,
        assessment_type: assessmentType,
        assessment_id: assessmentId,
        score: score,
        max_score: maxScore,
        percentage: percentage,
        passed: passed,
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const getResults = async (topicId, userId) => {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('topic_id', topicId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

// ==================== NOTES ====================
export const createNote = async (userId, topicId, chapterNumber, selectedText, noteText, highlightColor) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([
      {
        id: uuidv4(),
        user_id: userId,
        topic_id: topicId,
        chapter_number: chapterNumber,
        selected_text: selectedText,
        note_text: noteText,
        highlight_color: highlightColor,
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const getUserNotes = async (userId, topicId) => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateNote = async (noteId, noteText) => {
  const { data, error } = await supabase
    .from('notes')
    .update({ note_text: noteText })
    .eq('id', noteId)
    .select();

  if (error) throw error;
  return data?.[0];
};

export const deleteNote = async (noteId) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) throw error;
  return true;
};

// ==================== FLASHCARDS ====================
export const createFlashcard = async (userId, topicId, questions) => {
  const { data, error } = await supabase
    .from('flashcards')
    .insert([
      {
        id: uuidv4(),
        user_id: userId,
        topic_id: topicId,
        questions: questions,
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const getFlashcards = async (userId, topicId) => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId);

  if (error) throw error;
  return data || [];
};

// ==================== PROFILES ====================
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        user_id: userId,
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select();

  if (error) throw error;
  return data?.[0];
};

// ==================== FEEDBACK ====================
export const createFeedback = async (userId, name, email, rating, feedbackType, message) => {
  const { data, error } = await supabase
    .from('feedback')
    .insert([
      {
        id: uuidv4(),
        user_id: userId,
        name: name,
        email: email,
        rating: rating,
        feedback_type: feedbackType,
        message: message,
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
};

// ==================== ANALYTICS ====================
export const recordAnalytics = async (userId, topicId, studyTimeSeconds, sessionData = null) => {
  const { data, error } = await supabase
    .from('analytics')
    .insert([
      {
        id: uuidv4(),
        user_id: userId,
        topic_id: topicId,
        study_time_seconds: studyTimeSeconds,
        session_data: sessionData,
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
};

export const getAnalytics = async (userId, topicId) => {
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId);

  if (error) throw error;
  return data || [];
};

export const getUserAnalytics = async (userId) => {
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// ==================== ACHIEVEMENTS ====================
export const createAchievement = async (userId, achievementType, title, description) => {
  const { data, error } = await supabase
    .from('achievements')
    .insert([
      {
        id: uuidv4(),
        user_id: userId,
        achievement_type: achievementType,
        title: title,
        description: description,
      },
    ])
    .select();

  if (error && error.code !== '23505') throw error; // Ignore unique constraint
  return data?.[0];
};

export const getUserAchievements = async (userId) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) throw error;
  return data || [];
};
