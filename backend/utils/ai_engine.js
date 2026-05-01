import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash-lite-preview";

// ==================== ROADMAP GENERATION ====================
export const generateRoadmap = async (topic, level) => {
  try {
    const prompt = `
You are an expert curriculum designer. Create a comprehensive learning roadmap for the topic "${topic}" at ${level} level.

Generate a JSON object with the following structure:
{
  "chapter_count": <number>,
  "chapters": [
    {
      "chapter_number": <number>,
      "title": "<chapter title>",
      "description": "<2-3 sentence description>",
      "reading_time": "<e.g., '15 mins'>",
      "difficulty": "<Beginner/Intermediate/Advanced>",
      "key_concepts": ["<concept1>", "<concept2>", "<concept3>"]
    }
  ]
}

Create 5-8 chapters for this roadmap. Return ONLY valid JSON, no other text.
`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    const text = result.text;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const roadmap = JSON.parse(jsonMatch[0]);
    return roadmap;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
};

// ==================== CHAPTER CONTENT GENERATION ====================
export const generateChapterContent = async (
  topic,
  level,
  chapterNumber,
  title,
  description,
  keyConcepts,
) => {
  try {
    const concepts = keyConcepts?.join(", ") || "key concepts";

    const prompt = `
You are an expert educator. Write a comprehensive blog post for a student learning platform.

Topic: ${topic}
Level: ${level}
Chapter ${chapterNumber}: ${title}
Description: ${description}
Key Concepts to Cover: ${concepts}

Write a detailed, engaging blog post (600-800 words) in Markdown format that:
1. Starts with an interesting introduction
2. Explains the main concepts clearly
3. Includes practical examples
4. Contains code snippets if relevant
5. Ends with key takeaways
6. Uses ## for subheadings

Format as proper Markdown with:
- ## Section titles
- - Bullet points where appropriate
- **bold text** for emphasis
- \`code\` for technical terms

Return ONLY the Markdown content, no JSON or extra text.
`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    const content = result.text;
    return content;
  } catch (error) {
    console.error("Error generating chapter content:", error);
    throw new Error(`Failed to generate chapter content: ${error.message}`);
  }
};

// ==================== QUIZ GENERATION ====================
export const generateQuiz = async (topic, chapterNumber, title, content) => {
  try {
    const prompt = `
You are an expert test creator. Create a quiz for this chapter.

Topic: ${topic}
Chapter ${chapterNumber}: ${title}

Content Summary: ${content.substring(0, 500)}...

Generate a JSON object with 5 multiple-choice questions:
{
  "questions": [
    {
      "question": "<question text>",
      "options": {
        "A": "<option A>",
        "B": "<option B>",
        "C": "<option C>",
        "D": "<option D>"
      },
      "correct_answer": "<A/B/C/D>",
      "explanation": "<explanation of correct answer>"
    }
  ]
}

Return ONLY valid JSON, no other text.
`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    const text = result.text;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const quiz = JSON.parse(jsonMatch[0]);
    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};

// ==================== MIDTERM EXAM GENERATION ====================
export const generateMidtermExam = async (topic, level, chaptersCovered) => {
  try {
    const chapters = Array.isArray(chaptersCovered)
      ? chaptersCovered.join(", ")
      : chaptersCovered;

    const prompt = `
You are an expert examiner. Create a midterm exam for a learning platform.

Topic: ${topic}
Level: ${level}
Chapters Covered: ${chapters}

Create a JSON object with:
- 10 MCQ questions (1 mark each = 10 marks)
- 4 short answer questions (5 marks each = 20 marks)
- Total: 30 marks, 60% pass rate

{
  "mcq_questions": [
    {
      "question": "<question>",
      "options": {"A": "<A>", "B": "<B>", "C": "<C>", "D": "<D>"},
      "correct_answer": "<A/B/C/D>",
      "explanation": "<explanation>"
    }
  ],
  "short_questions": [
    {
      "question": "<5-mark question>",
      "sample_answer": "<2-3 sentence answer>",
      "key_points": ["<point1>", "<point2>"]
    }
  ],
  "total_marks": 30,
  "pass_percentage": 60
}

Return ONLY valid JSON, no other text.
`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    const text = result.text;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const exam = JSON.parse(jsonMatch[0]);
    return exam;
  } catch (error) {
    console.error("Error generating midterm exam:", error);
    throw new Error(`Failed to generate midterm exam: ${error.message}`);
  }
};

// ==================== FINAL EXAM GENERATION ====================
export const generateFinalExam = async (topic, level, chaptersCovered) => {
  try {
    const chapters = Array.isArray(chaptersCovered)
      ? chaptersCovered.join(", ")
      : chaptersCovered;

    const prompt = `
You are an expert examiner. Create a comprehensive final exam for a learning platform.

Topic: ${topic}
Level: ${level}
Chapters Covered: ${chapters}

Create a JSON object with:
- 10 MCQ questions (1.5 marks each = 15 marks)
- 5 short answer questions (4 marks each = 20 marks)
- 1 capstone project (15 marks)
- Total: 50 marks, 70% pass rate

{
  "mcq_questions": [
    {
      "question": "<question>",
      "options": {"A": "<A>", "B": "<B>", "C": "<C>", "D": "<D>"},
      "correct_answer": "<A/B/C/D>",
      "explanation": "<explanation>"
    }
  ],
  "short_questions": [
    {
      "question": "<4-mark question>",
      "sample_answer": "<detailed answer>",
      "key_points": ["<point1>", "<point2>"]
    }
  ],
  "capstone": {
    "title": "<project title>",
    "description": "<detailed project description>",
    "requirements": ["<req1>", "<req2>", "<req3>"],
    "deliverables": ["<deliverable1>", "<deliverable2>"],
    "evaluation_criteria": ["<criteria1>", "<criteria2>"]
  },
  "total_marks": 50,
  "pass_percentage": 70
}

Return ONLY valid JSON, no other text.
`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    const text = result.text;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const exam = JSON.parse(jsonMatch[0]);
    return exam;
  } catch (error) {
    console.error("Error generating final exam:", error);
    throw new Error(`Failed to generate final exam: ${error.message}`);
  }
};

// ==================== AI CHAT ====================
export const generateChatResponse = async (
  message,
  topic = "",
  context = "",
  conversationHistory = [],
) => {
  try {
    let prompt = message;

    if (topic) {
      prompt = `Context: Learning about "${topic}"\n`;
    }
    if (context) {
      prompt += `Additional Context: ${context}\n\n`;
    }

    prompt += `User Message: ${message}`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    const response = result.text;
    return response;
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
};

// ==================== STREAMING CHAT ====================
export const generateChatResponseStream = async (
  message,
  topic = "",
  context = "",
  conversationHistory = [],
) => {
  try {
    let prompt = message;

    if (topic) {
      prompt = `Context: Learning about "${topic}"\n`;
    }
    if (context) {
      prompt += `Additional Context: ${context}\n\n`;
    }

    prompt += `User Message: ${message}`;

    const result = await ai.models.generateContentStream({
      model: modelName,
      contents: prompt,
    });
    return result;
  } catch (error) {
    console.error("Error generating chat response stream:", error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
};

// ==================== FLASHCARD GENERATION ====================
export const generateFlashcards = async (topic, content) => {
  try {
    const prompt = `
You are an expert in creating flashcards. Create flashcards from the following content.

Topic: ${topic}
Content: ${content.substring(0, 1000)}...

Generate a JSON object with flashcards:
{
  "questions": [
    {
      "question": "<question on front>",
      "answer": "<answer on back>",
      "difficulty": "<Easy/Medium/Hard>"
    }
  ]
}

Create 8-12 flashcards. Return ONLY valid JSON, no other text.
`;

    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    const text = result.text;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const flashcards = JSON.parse(jsonMatch[0]);
    return flashcards.questions;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error(`Failed to generate flashcards: ${error.message}`);
  }
};

export default {
  generateRoadmap,
  generateChapterContent,
  generateQuiz,
  generateMidtermExam,
  generateFinalExam,
  generateChatResponse,
  generateChatResponseStream,
  generateFlashcards,
};
