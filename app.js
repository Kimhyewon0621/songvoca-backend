const express = require('express');
const dotenv = require('dotenv');
const { Pool } = require('pg'); // library to load postgreSQL

dotenv.config();

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json());

// PostgreSQL 연결 설정 (설명서 연결)
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

// 데이터베이스 연결 테스트 함수
pool.connect((err, client, release) => {
  if (err) {
    return console.error('PostgreSQL 연결 실패:', err.stack);
  }
  console.log('PostgreSQL 연결 성공! (songvoca_db)');
  release(); // 연결 해제(반환)
});

// 4. 서버 작동 확인을 위한 임시 테스트 라우터
app.get('/', (req, res) => {
    res.send('Voca 프로젝트 백엔드 서버 작동 중!');
});

app.listen(PORT, () =>{
    console.log(`our project if listening on port ${PORT}`);
});