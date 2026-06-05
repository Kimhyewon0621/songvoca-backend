const request = require("supertest");
const app = require("../app");

jest.mock("../models/userModel"); // mocks every function in userModel
const userModel = require("../models/userModel");

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
        expect(res.body).toEqual({error: "Server Error", message: err.message});
    });
    

});