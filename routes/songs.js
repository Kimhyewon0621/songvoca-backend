const { GoogleGenAI } = require("@google/genai");
const express = require('express');
const router = express.Router();
const songController = require("../controllers/songController");
const wordController = require('../controllers/wordController');
const { authenticate } = require("../middleware/authMiddleware");
const wordModel = require('../models/wordModel');

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
    
    // Deduplicate by song title + artist (keep first occurrence)
     const seen = new Set();
    const unique = filtered.filter(song => {
      const key = song.plainLyrics.substring(0, 100);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    res.json(unique);
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

    // Get words the user has already studied
    const studiedWords = await wordModel.findStudiedWords(user_id);
    const excludeText = studiedWords.length > 0
      ? `\n\nExclude these words that the user has already studied: ${studiedWords.join(', ')}`
      : '';

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
${lyrics}${excludeText}`;

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

    const filteredWords = words.filter(w => !studiedWords.includes(w.word));

    // Save to DB
    const savedWords = await wordModel.createExtractedWords(user_id, id, filteredWords);

    res.json(savedWords);

  } catch (error) {
    console.error('Gemini extract error:', error);
    res.status(500).json({ error: 'Failed to extract words' });
  }
});

// Song CRUD
router.get("/public", songController.getAllPublic);
router.post("/", authenticate, songController.create);
router.get("/", authenticate, songController.getAll);
router.get("/:id", songController.getById);
router.delete("/:id", authenticate, songController.remove);
router.get('/:id/words', authenticate, wordController.getBySongId);

module.exports = router;