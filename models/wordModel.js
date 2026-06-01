const pool = require('../db');

// Check the list of words in the song
async function findBySongId(song_id, user_id) {
  const result = await pool.query(
    `SELECT id, song_id, word, pos, definition
     FROM words
     WHERE song_id = $1 AND user_id = $2`,
    [song_id, user_id]
  );
  return result.rows;
}

// Look up my whole word (including song title)
async function findAllByUserId(user_id) {
  const result = await pool.query(
    `SELECT w.id, w.word, w.pos, w.definition, s.title AS song_title
     FROM words w
     JOIN songs s ON w.song_id = s.id
     WHERE w.user_id = $1`,
    [user_id]
  );
  return result.rows;
}

// delete word
async function deleteById(id, user_id) {
  const result = await pool.query(
    'DELETE FROM words WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, user_id]
  );
  return result.rows[0];
}

module.exports = { findBySongId, findAllByUserId, deleteById };