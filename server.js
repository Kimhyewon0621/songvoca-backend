const app = require("./app");
const {pool, initDb} = require('./db');

const PORT = process.env.PORT || 8080;

async function start(){
    await initDb();

    // 데이터베이스 연결 테스트 함수
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('PostgreSQL 연결 실패:', err.stack);
        }
        console.log('PostgreSQL 연결 성공! (songvoca_db)');
        release(); // 연결 해제(반환)
    });

    app.listen(PORT, () =>{
        console.log(`our project if listening on port ${PORT}`);
    });
}

start();