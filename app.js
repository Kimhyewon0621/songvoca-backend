const express = require('express');
const dotenv = require('dotenv');
const pool = require('./db');
const authRouter = require("./routes/auth");

dotenv.config();

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json());

app.use("/auth", authRouter);


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