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
    
    res.json(filtered[0] || null);
  } catch (error) {
    console.error('LRCLIB search error:', error);
    res.status(500).json({ error: 'Failed to search songs' });
  }
});

module.exports = router;