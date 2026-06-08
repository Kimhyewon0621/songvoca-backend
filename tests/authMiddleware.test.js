const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/authMiddleware"); 

describe("authMiddleware - test for authentication middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn(); 
    });

    test("return 401 when auth header do not exist or do not start with Bearer: ", () => {
        authenticate(req, res, next); // empty header

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "missing token" });
        expect(next).not.toHaveBeenCalled(); 
    });

    test("return 401 if the token was authorized with wrong secret", () => {
        const invalidToken = jwt.sign(
            { sub: 1, email: "testemail@example.com", name: "testuser" }, 
            "wrong-secret"
        );
        req.headers.authorization = `Bearer ${invalidToken}`;

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "invalid or expired token" });
        expect(next).not.toHaveBeenCalled();
    });

    test("if right token was given, set req.user and call next()", () => {
        const payload = { sub: 2, email: "user@example.com", name: "user" };
        
        const validToken = jwt.sign(payload, process.env.JWT_SECRET);
        req.headers.authorization = `Bearer ${validToken}`;

        authenticate(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual({
            id: 2,
            email: "user@example.com",
            name: "user"
        });
    });
});