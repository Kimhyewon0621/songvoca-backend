const express = require('express');
const dotenv = require('dotenv');
const authRouter = require("./routes/auth");
const songsRouter = require("./routes/songs");

dotenv.config();

const app = express()


app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/songs", songsRouter);


// 4. 서버 작동 확인을 위한 임시 테스트 라우터
app.get('/', (req, res) => {
    res.send('Voca 프로젝트 백엔드 서버 작동 중!');
});

module.exports = app;