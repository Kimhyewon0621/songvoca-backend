const { pool } = require("../db");

async function create({ user_id, title, artist, lyrics}) {
    const result = await pool.query(
        `INSERT INTO songs (user_id, title, artist, lyrics)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, artist, study_status`,
        [user_id, title, artist, lyrics]
    );

    return result.rows[0];
}

async function findAllByUserId(user_id) {
    const result = await pool.query(
        `SELECT id, title, artist, study_status
        FROM songs
        WHERE user_id = $1
        ORDER BY created_at DESC`,
        [user_id]
    );

    return result.rows;
}

// Find all songs (no user filter)
async function findAll() {
  const result = await pool.query(
    `SELECT id, title, artist, study_status
     FROM songs
     ORDER BY created_at DESC`
  );
  return result.rows;
}

async function findById(id, user_id) {
    const result = await pool.query(
        `SELECT id, title, artist, lyrics, study_status
        FROM songs
        WHERE id = $1 AND user_id = $2`,
        [id, user_id]
    );
    
    return result.rows[0];
}

// Find by id (no user filter)
async function findByIdPublic(id) {
  const result = await pool.query(
    `SELECT id, title, artist, lyrics, study_status
     FROM songs
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

async function deleteById(id, user_id) {
    const result = await pool.query(
        `DELETE FROM songs WHERE id = $1 AND user_id = $2 RETURNING id`,
        [id, user_id]
    );
    return result.rows[0];
}


module.exports = {create, findAllByUserId, findAll, findById, findByIdPublic, deleteById};