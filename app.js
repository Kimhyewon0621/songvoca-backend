const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json());

// 4. 서버 작동 확인을 위한 임시 테스트 라우터
app.get('/', (req, res) => {
    res.send('Voca 프로젝트 백엔드 서버 작동 중!');
});

app.listen(PORT, () =>{
    console.log(`our project if listening on port ${PORT}`);
});