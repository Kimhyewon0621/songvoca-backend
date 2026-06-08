const request = require("supertest");
const app = require("../app");

jest.mock("../models/userModel"); // mocks every function in userModel
jest.mock("bcrypt");
jest.mock("../models/wordModel");
jest.mock("../models/songModel");

const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const wordModel = require("../models/wordModel");
const songModel = require("../models/songModel");
jest.mock("../middleware/authMiddleware", () => {
    return {
        authenticate: (req, res, next) => {
            req.user = { id: 1, email: "testemail@example.com", name: "testuser" };
            next();
        }
    };
});

beforeEach( () => {jest.clearAllMocks(); });

// test for register feature
describe("POST /api/auth/register", () =>{ 
    test("returns 400 when the input body is wrong", async () =>{
        const body = {email : "this-is-not-an-email", password : "testpassword", name : "testuser"};
        const res = await request(app).post("/api/auth/register").send(body);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({error : "Please enter valid format of email, such as maria@example.com."});
    });

    test("returns 201 when the input is correct", async () =>{
        const body = {email : "testemail@example.com", password : "testpassword", name : "testuser"};
        userModel.create.mockResolvedValue(1);
        const res = await request(app).post("/api/auth/register").send(body);
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            id: 1,
            email: "testemail@example.com"
        });
    });

    test("returns 409 when the email is already used", async () =>{
        const body = {email : "already_exist@example.com", password : "testpassword", name : "testuser"};
        userModel.create.mockRejectedValue(new userModel.EmailAlreadyExistError());
        const res = await request(app).post("/api/auth/register").send(body);

        expect(res.statusCode).toBe(409);
        expect(res.body).toEqual({error : "Email already in use"});
    });

    test("returns 500 when the server is not connected", async () =>{
        const body = {email : "testemail@example.com", password : "testpassword", name : "testuser"};
        userModel.create.mockRejectedValue(new Error("Database Connection Crash"));
        const res = await request(app).post("/api/auth/register").send(body);

        expect(res.statusCode).toBe(500);
        expect(res.body).toMatchObject({error: "Server Error"});
    });
    

});

// test for login feature
describe("POST /api/auth/login", () =>{ 
    test("returns 401 when the user is not exist", async () =>{
        const body = {email : "nonexist@example.com", password : "nonexist"};

        userModel.findByEmail.mockResolvedValue(undefined);
        const res = await request(app).post("/api/auth/login").send(body);

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({error : "invalid credentials"});
    });

    test("returns 200 and a token when credentials are valid", async () =>{
        const body = {email : "testemail@example.com", password : "testpassword"};

        userModel.findByEmail.mockResolvedValue({
        id: 1,
        email: "testemail@example.com",
        name: "testuser",
        password_hash: "fake_hashed_password" 
        });
        bcrypt.compare.mockResolvedValue(true);

        const res = await request(app).post("/api/auth/login").send(body);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token"); 
        expect(res.body).toHaveProperty("name"); 
        expect(res.body).toHaveProperty("id");
        expect(res.body.email).toBe("testemail@example.com");
    });

    test("returns 401 when the hashed password does not match with password", async () =>{
        const body = {email : "testemail@example.com", password : "wrongpassword"};

        userModel.findByEmail.mockResolvedValue({
        id: 1,
        email: "testemail@example.com",
        name: "testuser",
        password_hash: "fake_hashed_password" 
        });
        bcrypt.compare.mockResolvedValue(false);

        const res = await request(app).post("/api/auth/login").send(body);

        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual({error : "invalid credentials"});
    });

    test("returns 500 when the server is not connected", async () =>{
        const body = {email : "testemail@example.com", password : "testpassword"};

        userModel.findByEmail.mockRejectedValue(new Error("Database Connection Crash"));
        
        const res = await request(app).post("/api/auth/login").send(body);

        expect(res.statusCode).toBe(500);
        expect(res.body).toMatchObject({error: "Server Error"});
    });
});

describe("GET /api/users/userInfo - getUserInfo controller test", () => {
    
    test("for authenticated user, the user's info and word/song info is provided.", async () => {
        wordModel.getKnowWords.mockResolvedValue(5);
        wordModel.findAllByUserId.mockResolvedValue([
            { id: 1, word: "apple" },
            { id: 2, word: "banana" }
        ]);
        songModel.findAllByUserId.mockResolvedValue([
            { id: 1, title: "Let It Be" }
        ]); 

        const res = (await request(app).get("/api/auth/me"));

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            id: 1, 
            email: "testemail@example.com",
            name: "testuser",
            knowWords: 5,
            wholeWords: 2,
            songs: 1
        });
    });

    test("returns 500 when an error occurs when querying DB", async () => {
        wordModel.getKnowWords.mockRejectedValue(new Error("Database Error"));

        const res = await request(app).get("/api/auth/me");

        expect(res.statusCode).toBe(500);
        expect(res.body).toMatchObject({ error: "Server Error" });
    });
});