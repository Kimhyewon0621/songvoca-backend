const { GoogleGenAI } = require("@google/genai");
const express = require('express');
const router = express.Router();
const songController = require("../controllers/songController");
const wordController = require('../controllers/wordController');
const { authenticate } = require("../middleware/authMiddleware");
const { pool } = require('../db');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// LRCLIB API to search songs by title or artist
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const response = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(q)}`);
    const data = await response.json();

    const filtered = data.filter(song => {
        if (song.instrumental) return false;
        if (!song.plainLyrics) return false;
        return /[가-힣]/.test(song.plainLyrics);
    });
    
    res.json(filtered[0] || null);
  } catch (error) {
    console.error('LRCLIB search error:', error);
    res.status(500).json({ error: 'Failed to search songs' });
  }
});

// Extract words from lyrics using Gemini API
router.post('/:id/extract', authenticate, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    const { lyrics } = req.body;
    
    if (!lyrics) {
      return res.status(400).json({ error: 'Lyrics are required' });
    }

    const prompt = `Extract Korean vocabulary from the following lyrics that would be useful for an intermediate learner (TOPIK level 3+).

Rules:
- Skip grammar particles, conjunctions, and very basic words
- Focus on content words with clear meaning (nouns, verbs, adjectives, adverbs)
- Return ONLY a JSON array, no explanation, no markdown, no code block
- Maximum 20 words

Format:
[
  {
    "word": "Korean word (dictionary form)",
    "pos": "noun/verb/adjective/adverb",
    "definition": "English definition"
  }
]

Lyrics:
${lyrics}`;

    let text;
    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
      });
      text = result.text;
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      return res.status(500).json({ error: 'Gemini API request failed' });
    }

    const cleanedText = text.replace(/```json|```/g, '').trim();
    
    let words;
    try {
      words = JSON.parse(cleanedText);
    } catch (parseError) {
      return res.status(500).json({ error: 'Failed to parse Gemini response' });
    }

    if (!Array.isArray(words)) {
      return res.status(500).json({ error: 'Gemini returned invalid format' });
    }

    // Save to DB
    const savedWords = [];
    for (const w of words) {
      const result = await pool.query(
        `INSERT INTO words (user_id, song_id, word, pos, definition)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, song_id, word, pos, definition`,
        [user_id, id, w.word, w.pos, w.definition]
      );
      savedWords.push(result.rows[0]);
    }

    res.json(savedWords);
  } catch (error) {
    console.error('Gemini extract error:', error);
    res.status(500).json({ error: 'Failed to extract words' });
  }
});

// Song CRUD
router.post("/", authenticate, songController.create);
router.get("/", authenticate, songController.getAll);
router.get("/:id", authenticate, songController.getById);
router.delete("/:id", authenticate, songController.remove);
router.get('/:id/words', authenticate, wordController.getBySongId);

module.exports = router;