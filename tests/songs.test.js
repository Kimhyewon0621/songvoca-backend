const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

jest.mock("../models/songModel");
const songModel = require("../models/songModel");

beforeEach(() => { jest.clearAllMocks(); });

// Helper to generate a valid token
function getToken() {
  return jwt.sign(
    { sub: 1, email: "test@example.com", name: "testuser" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

describe("POST /api/songs", () => {
  test("returns 201 when song is created", async () => {
    const mockSong = { id: 1, title: "Spring Day", artist: "BTS", study_status: "not_started" };
    songModel.create.mockResolvedValue(mockSong);
    const body = { title: "Spring Day", artist: "BTS", lyrics: "보고 싶다" };
    const res = await request(app)
      .post("/api/songs")
      .set("Authorization", `Bearer ${getToken()}`)
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(mockSong);
  });

  test("returns 401 when no token is provided", async () => {
    const body = { title: "Spring Day", artist: "BTS", lyrics: "보고 싶다" };
    const res = await request(app).post("/api/songs").send(body);

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /api/songs", () => {
  test("returns 200 with user's songs", async () => {
    const mockSongs = [
      { id: 1, title: "Spring Day", artist: "BTS", study_status: "not_started" }
    ];
    songModel.findAllByUserId.mockResolvedValue(mockSongs);

    const res = await request(app)
      .get("/api/songs")
      .set("Authorization", `Bearer ${getToken()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockSongs);
  });
});

describe("GET /api/songs/public", () => {
  test("returns 200 with all songs without auth", async () => {
    const mockSongs = [
      { id: 1, title: "Spring Day", artist: "BTS" },
      { id: 2, title: "Love Dive", artist: "IVE" }
    ];
    songModel.findAll.mockResolvedValue(mockSongs);

    const res = await request(app).get("/api/songs/public");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockSongs);
  });
});

describe("DELETE /api/songs/:id", () => {
  test("returns 200 when song is deleted", async () => {
    songModel.deleteById.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .delete("/api/songs/1")
      .set("Authorization", `Bearer ${getToken()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "deleted" });
  });

  test("returns 404 when song does not exist", async () => {
    songModel.deleteById.mockResolvedValue(undefined);

    const res = await request(app)
      .delete("/api/songs/999")
      .set("Authorization", `Bearer ${getToken()}`);

    expect(res.statusCode).toBe(404);
  });
});