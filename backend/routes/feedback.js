import express from "express";
import { optionalAuth } from "../middleware/auth.js";
import * as db from "../utils/db.js";

const router = express.Router();

// ==================== SUBMIT FEEDBACK ====================
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { name, email, rating, feedback_type, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Name, email, and message required" });
    }

    const feedback = await db.createFeedback(
      req.userId || null,
      name,
      email,
      rating || null,
      feedback_type || "general",
      message,
    );

    res.json({
      message: "Feedback submitted successfully",
      feedback_id: feedback.id,
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

export default router;
