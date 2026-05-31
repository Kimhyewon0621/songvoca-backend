const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
});

async function initDb() {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) UNIQUE NOT NULL, -- with same email, cannot create 2 or more account
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(50) NOT NULL, -- there may be users whose names are same
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS songs (
      id SERIAL  PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      artist VARCHAR(255) NOT NULL,
      lyrics TEXT,
      study_status VARCHAR(20) DEFAULT 'not_started',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS words (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
      word VARCHAR(100) NOT NULL,
      pos VARCHAR(50),
      definition TEXT
    );

    CREATE TABLE IF NOT EXISTS studylogs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      word_id INTEGER REFERENCES words(id) ON DELETE CASCADE,
      is_correct BOOLEAN NOT NULL,
      studied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    
  `;
  
  try {
    await pool.query(query);
    console.log('✅ 테이블 확인/생성 완료');
  } catch (err) {
    console.error('❌ 테이블 초기화 실패:', err);
  }
}

initDb();

module.exports = pool;