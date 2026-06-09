const { pool } = require('../db');

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

// find the user's currently know words
async function getKnowWords(user_id){
  const result = await pool.query(
    `WITH RankedLogs AS (
      SELECT 
          word_id,
          is_correct,
          ROW_NUMBER() OVER (PARTITION BY word_id ORDER BY studied_at DESC) as num
      FROM 
          studylogs
      WHERE 
          user_id = $1
  )
  SELECT 
      COUNT(*)::INTEGER as correct_word_count
  FROM 
      RankedLogs
  WHERE 
      num = 1 
      AND is_correct = TRUE;`,
  [user_id]
  );
  return result.rows[0].correct_word_count;
}

async function createExtractedWords(user_id, song_id, words) {
  const savedWords = [];
  for (const w of words) {
    const result = await pool.query(
      `INSERT INTO words (user_id, song_id, word, pos, definition)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, song_id, word, pos, definition`,
      [user_id, song_id, w.word, w.pos, w.definition]
    );
    savedWords.push(result.rows[0]);
  }
  return savedWords;
}

module.exports = { findBySongId, findAllByUserId, deleteById, getKnowWords, createExtractedWords };

