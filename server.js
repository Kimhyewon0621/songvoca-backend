const app = require("./app");
const {pool, initDb} = require('./db');

const PORT = process.env.PORT || 8080;

async function start(){
    try{
    await initDb();

    await pool.query('SELECT 1');
    console.log('PostgreSQL connection success! (songvoca_db)');

    app.listen(PORT, () =>{
        console.log(`our project if listening on port ${PORT}`);
    });
    }catch(err){
        console.error('Failed to connect DB while starting the server:', err);
    }

}

start();