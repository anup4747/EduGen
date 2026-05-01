import axios from "axios";
import { supabase } from "../supabaseClient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add interceptor to include JWT token from Supabase
api.interceptors.request.use(
  async (config) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error("Error getting session:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ==================== AUTH ENDPOINTS ====================

export async function signup(email, password, fullName) {
  const { data } = await api.post("/auth/signup", {
    email,
    password,
    fullName,
  });
  return data;
}

export async function login(email, password) {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function logout() {
  const { data } = await api.post("/auth/logout");
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}

// ==================== TOPIC MANAGEMENT ====================

export async function createTopic(topic_name, level) {
  const { data } = await api.post("/topics/create", {
    topic_name,
    level,
  });
  return data;
}

export async function checkStatus(topic_id) {
  const { data } = await api.get(`/topics/status/${topic_id}`);
  return data;
}

export async function getUserTopics() {
  const { data } = await api.get("/topics");
  return data;
}

export async function getTopic(topic_id) {
  const { data } = await api.get(`/topics/${topic_id}`);
  return data;
}

export async function deleteTopic(topic_id) {
  const { data } = await api.delete(`/topics/${topic_id}`);
  return data;
}

export async function completeTopic(topic_id, total_score, max_score) {
  const { data } = await api.post(`/topics/${topic_id}/complete`, {
    total_score,
    max_score,
  });
  return data;
}

// ==================== CONTENT RETRIEVAL ====================

export async function getChapters(topic_id) {
  const { data } = await api.get(`/chapters/${topic_id}`);
  return data;
}

export async function getQuizzes(topic_id) {
  const { data } = await api.get(`/quizzes/${topic_id}`);
  return data;
}

export async function getExams(topic_id) {
  const { data } = await api.get(`/topics/${topic_id}/exams`);
  return data;
}

export async function getExam(exam_id) {
  const { data } = await api.get(`/exams/${exam_id}`);
  return data;
}

// ==================== ASSESSMENT SUBMISSION ====================

export async function submitQuiz(quiz_id, user_answers, score) {
  const { data } = await api.post("/quiz/submit", {
    quiz_id,
    user_answers,
    score,
  });
  return data;
}

export async function submitExam(exam_id, user_answers, score) {
  const { data } = await api.post("/exam/exam/submit", {
    exam_id,
    user_answers,
    score,
  });
  return data;
}

export async function getResults(topic_id) {
  const { data } = await api.get(`/results/${topic_id}`);
  return data;
}

// ==================== EXAM GENERATION ====================

export async function generateExam(topic_id, exam_type) {
  const { data } = await api.post(`/topics/${topic_id}/generate-exam`, {
    exam_type,
  });
  return data;
}

// ==================== CHAT ====================

export async function sendChat(
  message,
  topic = "",
  context = "",
  conversation_history = [],
) {
  const { data } = await api.post("/chat", {
    message,
    topic,
    context,
    conversation_history,
  });
  return data;
}

// ==================== PROFILE MANAGEMENT ====================

export async function getProfile(user_id) {
  const { data } = await api.get(`/profile/${user_id}`);
  return data;
}

export async function updateProfile(
  full_name,
  username,
  bio,
  avatar_data,
  avatar_url,
) {
  const { data } = await api.post("/profile/update", {
    full_name,
    username,
    bio,
    avatar_data,
    avatar_url,
  });
  return data;
}

export async function uploadProfilePicture(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const base64 = reader.result;
        const { data } = await api.post("/profile/upload-profile-picture", {
          image: base64,
        });
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsDataURL(file);
  });
}

// ==================== NOTES ====================

export async function createNote(
  topic_id,
  chapter_number,
  selected_text,
  note_text,
  highlight_color,
) {
  const { data } = await api.post("/profile/create", {
    topic_id,
    chapter_number,
    selected_text,
    note_text,
    highlight_color,
  });
  return data;
}

export async function getUserNotes(topic_id) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  const { data } = await api.get(`/profile/${user.id}/${topic_id}`);
  return data;
}

export async function updateNote(note_id, note_text) {
  const { data } = await api.put(`/profile/update/${note_id}`, {
    note_text,
  });
  return data;
}

export async function deleteNote(note_id) {
  const { data } = await api.delete(`/profile/delete/${note_id}`);
  return data;
}

// ==================== ANALYTICS ====================

export async function saveStudySession(topic_id, seconds) {
  const { data } = await api.post("/analytics/study", {
    topic_id,
    seconds,
  });
  return data;
}

export async function getAnalytics(topic_id) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  const { data } = await api.get(`/analytics/${user.id}/${topic_id}`);
  return data;
}

export async function getUserAnalytics() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  const { data } = await api.get(`/analytics/user/${user.id}`);
  return data;
}

// ==================== FEEDBACK ====================

export async function submitFeedback(
  name,
  email,
  rating,
  feedback_type,
  message,
) {
  const { data } = await api.post("/feedback", {
    name,
    email,
    rating,
    feedback_type,
    message,
  });
  return data;
}

// ==================== FLASHCARDS ====================

export async function createFlashcard(topic_id, questions) {
  const { data } = await api.post("/flashcards/create", {
    topic_id,
    questions,
  });
  return data;
}

export async function getFlashcards(topic_id) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  const { data } = await api.get(`/flashcards/${user.id}/${topic_id}`);
  return data;
}

export default api;
