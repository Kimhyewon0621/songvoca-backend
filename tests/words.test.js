const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

jest.mock("../models/wordModel");
const wordModel = require("../models/wordModel");

beforeEach(() => { jest.clearAllMocks(); });

function getToken() {
  return jwt.sign(
    { sub: 1, email: "test@example.com", name: "testuser" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

describe("GET /api/words", () => {
  test("returns 200 with user's words", async () => {
    const mockWords = [
      { id: 1, word: "그리움", pos: "noun", definition: "longing", song_title: "Spring Day" }
    ];
    wordModel.findAllByUserId.mockResolvedValue(mockWords);

    const res = await request(app)
      .get("/api/words")
      .set("Authorization", `Bearer ${getToken()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockWords);
  });

  test("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/words");
    expect(res.statusCode).toBe(401);
  });
});

describe("DELETE /api/words/:id", () => {
  test("returns 200 when word is deleted", async () => {
    wordModel.deleteById.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .delete("/api/words/1")
      .set("Authorization", `Bearer ${getToken()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "deleted" });
  });

  test("returns 404 when word does not exist", async () => {
    wordModel.deleteById.mockResolvedValue(undefined);

    const res = await request(app)
      .delete("/api/words/999")
      .set("Authorization", `Bearer ${getToken()}`);

    expect(res.statusCode).toBe(404);
  });
});