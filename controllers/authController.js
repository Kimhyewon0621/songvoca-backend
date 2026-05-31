const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

async function register(req, res){
    try{
        const error = validateRegisterInfo(req.body);
        if (error) {
            return res.status(400).json({ error });
        }

        const {email, password, name} = req.body ;

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

async function login(req, res){
    try{
        const {email, password} = req.body;

        const user = await userModel.findByEmail(email);
        if(!user){
            return res.status(401).json({error:"invalid credentials"});
        }

        const ok = await bcrypt.compare(password,user.password_hash);
        if(!ok){
            return res.status(401).json({error:"invalid credentials"});
        }
        
        const token = jwt.sign(
            {sub:user.id, email:user.email, name:user.name},
            process.env.JWT_SECRET,
            {expiresIn : process.env.JWT_EXPIRES_IN}
        );
        res.status(200).json({token, id:user.id, email:user.email, name:user.name});

    }catch(err){
        res.status(500).json({error:"Server Error"})
    }
}

// originall, the register function also checked if the body contains all three infos
// separated it with new function for easy testing
function validateRegisterInfo({email, password, name}){ // 
    if(!email || !password || !name){
        return "email, password, and name are required.";
    }
    if(!email.includes("@")){
        return "Please enter valid format of email, such as maria@example.com.";
    }
    if(password.length < 6){
        return "Password should be at least 6 characters.";
    }
    return null ;
}

module.exports = {register, login, validateRegisterInfo};