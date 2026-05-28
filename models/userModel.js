const pool = require('../db');

class EmailAlreadyExistError extends Error {
  constructor(email) {
    super(`E-mail adress "${email}" is already in use.`);
    this.name = "EmailAlreadyExistError";
  }
}

async function create({email, password_hash, name}){ 
    try{
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id',
            [email, password_hash, name]
        );
        return result.rows[0].id; // return the new id
    }catch(err){
        if(err.code === 23505){
            throw new EmailAlreadyExistError(email);
        }
        throw err ;
    }
}

async function findByEmail(email) {
  return await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
}

module.exports = { create, findByEmail, EmailAlreadyExistError };