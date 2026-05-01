import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as db from '../utils/db.js';

const router = express.Router();

// ==================== PROFILE ROUTES ====================

// GET profile
router.get('/:user_id', verifyToken, async (req, res) => {
  try {
    if (req.params.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const profile = await db.getProfile(req.userId);
    res.json(profile || {});
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// UPDATE profile
router.post('/update', verifyToken, async (req, res) => {
  try {
    const { full_name, username, bio, avatar_url, avatar_data } = req.body;

    const updates = {};
    if (full_name) updates.full_name = full_name;
    if (username) updates.username = username;
    if (bio) updates.bio = bio;
    if (avatar_url) updates.avatar_url = avatar_url;
    if (avatar_data) updates.avatar_data = avatar_data;

    const profile = await db.updateProfile(req.userId, updates);
    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// UPLOAD profile picture
router.post('/upload-profile-picture', verifyToken, async (req, res) => {
  try {
    const { image } = req.body; // base64 image data

    if (!image) {
      return res.status(400).json({ error: 'Image required' });
    }

    // Store base64 in database
    const profile = await db.updateProfile(req.userId, { avatar_data: image });
    res.json({ message: 'Profile picture uploaded', profile });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: 'Failed to upload picture' });
  }
});

// ==================== NOTES ROUTES ====================

// CREATE note
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { topic_id, chapter_number, selected_text, note_text, highlight_color } = req.body;

    if (!topic_id || !note_text) {
      return res.status(400).json({ error: 'Topic ID and note text required' });
    }

    const note = await db.createNote(
      req.userId,
      topic_id,
      chapter_number,
      selected_text,
      note_text,
      highlight_color || '#FFFF00'
    );

    res.json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// GET user notes
router.get('/:user_id/:topic_id', verifyToken, async (req, res) => {
  try {
    if (req.params.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const notes = await db.getUserNotes(req.userId, req.params.topic_id);
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

// UPDATE note
router.put('/update/:note_id', verifyToken, async (req, res) => {
  try {
    const { note_text } = req.body;

    if (!note_text) {
      return res.status(400).json({ error: 'Note text required' });
    }

    const note = await db.updateNote(req.params.note_id, note_text);
    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE note
router.delete('/delete/:note_id', verifyToken, async (req, res) => {
  try {
    await db.deleteNote(req.params.note_id);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
