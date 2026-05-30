const express = require('express');
const router = express.Router();

// extract words from lyrics by using Gemini
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

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return res.status(500).json({ error: 'Gemini API request failed' });
    }

    const data = await response.json();
    
    // verify res
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected Gemini response:', data);
      return res.status(500).json({ error: 'Invalid response from Gemini' });
    }

    const text = data.candidates[0].content.parts[0].text;
    
    // eliminate codeblock and JSON parsing
    const cleanedText = text.replace(/```json|```/g, '').trim();
    
    let words;
    try {
      words = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', cleanedText);
      return res.status(500).json({ error: 'Failed to parse Gemini response' });
    }

    // verify array
    if (!Array.isArray(words)) {
      return res.status(500).json({ error: 'Gemini returned invalid format' });
    }

    res.json(words);
  } catch (error) {
    console.error('Gemini extract error:', error);
    res.status(500).json({ error: 'Failed to extract words' });
  }
});

module.exports = router;