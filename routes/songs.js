const express = require('express');
const router = express.Router();

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
        if (song.instrmental) return false; //exclude instrumental songs
        if(!song.plainLyrics) return false; //exclude songs without lyrics
        return /[가-힣]/.test(song.plainLyrics);    //onlu include songs with Korean lyrics
    });
    
    res.json(filtered);
  } catch (error) {
    console.error('LRCLIB search error:', error);
    res.status(500).json({ error: 'Failed to search songs' });
  }
});

module.exports = router;

//extract words from lyrics using Gemini API
router.post('/extract', async (req, res) => {
  try {
    const { lyrics } = req.body;
    
    if (!lyrics) {
      return res.status(400).json({ error: 'Lyrics are required' });
    }

    const prompt = `Extract Korean vocabulary from the following lyrics that would be useful for an intermediate learner (TOPIK level 3+).

Rules:
- Skip grammar particles, conjunctions, and very basic words
- Focus on content words with clear meaning (nouns, verbs, adjectives, adverbs)
- Return ONLY a JSON array, no explanation, no markdown, no code block
- Maximum 8 words

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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // JSON parsing (eliminate code blocks)
    const cleanedText = text.replace(/```json|```/g, '').trim();
    const words = JSON.parse(cleanedText);
    
    res.json(words);
  } catch (error) {
    console.error('Gemini extract error:', error);
    res.status(500).json({ error: 'Failed to extract words' });
  }
});