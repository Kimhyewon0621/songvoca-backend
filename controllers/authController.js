const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

async function register(req, res){
    try{

        const {email, password, name} = req.body ;
        if(!email || !password || !name){
            return res.status(400).json({error: "email, password and name required"});
        }

        const password_hash = await bcrypt.hash(password, 10);
        const id = await userModel.create({email, password_hash, name});
        res.status(201).json({id, email});

    }catch(err){

        if(err instanceof userModel.EmailAlreadyExistError){
            return res.status(409).json({error : "Email already in use"});
        }
        res.status(500).json({error: "Server Error"});

    }
}

module.exports = {register};