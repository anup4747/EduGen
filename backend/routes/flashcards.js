import express from "express";
import { verifyToken } from "../middleware/auth.js";
import * as db from "../utils/db.js";

const router = express.Router();

// ==================== CREATE FLASHCARDS ====================
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { topic_id, questions } = req.body;

    if (!topic_id || !questions) {
      return res.status(400).json({ error: "Topic ID and questions required" });
    }

    const flashcard = await db.createFlashcard(req.userId, topic_id, questions);
    res.json(flashcard);
  } catch (error) {
    console.error("Create flashcard error:", error);
    res.status(500).json({ error: "Failed to create flashcard" });
  }
});

// ==================== GET FLASHCARDS ====================
router.get("/:user_id/:topic_id", verifyToken, async (req, res) => {
  try {
    if (req.params.user_id !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const flashcards = await db.getFlashcards(req.userId, req.params.topic_id);
    res.json(flashcards);
  } catch (error) {
    console.error("Get flashcards error:", error);
    res.status(500).json({ error: "Failed to get flashcards" });
  }
});

export default router;
