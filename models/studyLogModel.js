const { pool } = require('../db');

// Create a new study log
async function create({ user_id, word_id, is_correct }) {
  const result = await pool.query(
    `INSERT INTO studylogs (user_id, word_id, is_correct)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, word_id, is_correct, studied_at`,
    [user_id, word_id, is_correct]
  );
  return result.rows[0];
}

// Get song_id from word
async function getSongIdByWordId(word_id) {
  const result = await pool.query(
    `SELECT song_id FROM words WHERE id = $1`,
    [word_id]
  );
  return result.rows[0]?.song_id;
}

// Calculate song study status based on latest study logs of each word
async function calculateSongStatus(user_id, song_id) {
  // Get all words of the song
  const wordsResult = await pool.query(
    `SELECT id FROM words WHERE song_id = $1`,
    [song_id]
  );
  const wordIds = wordsResult.rows.map(w => w.id);
  
  if (wordIds.length === 0) return 'not_started';

  // Get the latest study log for each word
  const logsResult = await pool.query(
    `SELECT DISTINCT ON (word_id) word_id, is_correct
     FROM studylogs
     WHERE user_id = $1 AND word_id = ANY($2::int[])
     ORDER BY word_id, studied_at DESC`,
    [user_id, wordIds]
  );
  
  const latestLogs = logsResult.rows;

  // No study logs → not_started
  if (latestLogs.length === 0) return 'not_started';

  // All words have latest log = true → completed
  if (latestLogs.length === wordIds.length && latestLogs.every(log => log.is_correct)) {
    return 'completed';
  }

  // Otherwise → in_progress
  return 'in_progress';
}

// Update song study status
async function updateSongStatus(song_id, status) {
  await pool.query(
    `UPDATE songs SET study_status = $1 WHERE id = $2`,
    [status, song_id]
  );
}

module.exports = { create, getSongIdByWordId, calculateSongStatus, updateSongStatus };