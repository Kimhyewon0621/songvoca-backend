const studyLogModel = require('../models/studyLogModel');

// Record a new study log + update song study status
async function create(req, res) {
  try {
    const user_id = req.user.id;
    const { word_id, is_correct } = req.body;

    if (word_id === undefined || is_correct === undefined) {
      return res.status(400).json({ error: 'word_id and is_correct are required' });
    }

    // 1. Save the study log
    const log = await studyLogModel.create({ user_id, word_id, is_correct });

    // 2. Get the song_id of this word
    const song_id = await studyLogModel.getSongIdByWordId(word_id);

    // 3. Recalculate and update song study status
    if (song_id) {
      const newStatus = await studyLogModel.calculateSongStatus(user_id, song_id);
      await studyLogModel.updateSongStatus(song_id, newStatus);
    }

    res.status(201).json(log);
  } catch (err) {
    console.error('Create study log error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

module.exports = { create };