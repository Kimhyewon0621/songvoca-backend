const app = require("./app");
const {pool, initDb} = require('./db');

const PORT = process.env.PORT || 8080;

async function start(){
    try{
    await initDb();

    // 데이터베이스 연결 테스트 함수
    await pool.query('SELECT 1');
    console.log('PostgreSQL 연결 성공! (songvoca_db)');

    app.listen(PORT, () =>{
        console.log(`our project if listening on port ${PORT}`);
    });
    }catch(err){
        console.error('서버 시작 중 DB 연결 실패:', err);
    }

}

start();