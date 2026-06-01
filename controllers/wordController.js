const wordModel = require('../models/wordModel');

// List of words for a song
async function getBySongId(req, res) {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const words = await wordModel.findBySongId(id, user_id);
    res.status(200).json(words);
  } catch (err) {
    console.error('Get words by song error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

// My whole word
async function getAll(req, res) {
  try {
    const user_id = req.user.id;
    const words = await wordModel.findAllByUserId(user_id);
    res.status(200).json(words);
  } catch (err) {
    console.error('Get all words error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

// Delete word
async function remove(req, res) {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const deleted = await wordModel.deleteById(id, user_id);
    if (!deleted) {
      return res.status(404).json({ error: 'Word not found' });
    }
    res.status(200).json({ message: 'deleted' });
  } catch (err) {
    console.error('Delete word error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

module.exports = { getBySongId, getAll, remove };