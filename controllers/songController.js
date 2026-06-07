const songModel = require('../models/songModel');

async function create(req, res) {
  try {
    const user_id = req.user.id;
    const { title, artist, lyrics } = req.body;

    if (!title || !artist) {
      return res.status(400).json({ error: 'title and artist are required' });
    }

    const song = await songModel.create({ user_id, title, artist, lyrics });
    res.status(201).json(song);
  } catch (err) {
    console.error('Create song error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

async function getAll(req, res) {
  try {
    const user_id = req.user.id;
    const songs = await songModel.findAllByUserId(user_id);
    res.status(200).json(songs);
  } catch (err) {
    console.error('Get songs error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

// All songs (public, no auth)
async function getAllPublic(req, res) {
  try {
    const songs = await songModel.findAll();
    res.status(200).json(songs);
  } catch (err) {
    console.error('Get public songs error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;

    const song = await songModel.findByIdPublic(id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.status(200).json(song);
  } catch (err) {
    console.error('Get song error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

async function remove(req, res) {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const deleted = await songModel.deleteById(id, user_id);
    if (!deleted) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.status(200).json({ message: 'deleted' });
  } catch (err) {
    console.error('Delete song error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
}

module.exports = { create, getAll, getAllPublic, getById, remove };