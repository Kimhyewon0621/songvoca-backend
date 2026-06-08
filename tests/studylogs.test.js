const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

jest.mock("../models/studyLogModel");
const studyLogModel = require("../models/studyLogModel");

beforeEach(() => { jest.clearAllMocks(); });

function getToken() {
  return jwt.sign(
    { sub: 1, email: "test@example.com", name: "testuser" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

describe("POST /api/study-logs", () => {
  test("returns 201 when study log is created", async () => {
    const mockLog = { id: 1, user_id: 1, word_id: 5, is_correct: true, studied_at: "2026-06-05T18:45:37.518Z" };
    studyLogModel.create.mockResolvedValue(mockLog);
    studyLogModel.getSongIdByWordId.mockResolvedValue(2);
    studyLogModel.calculateSongStatus.mockResolvedValue("in_progress");
    studyLogModel.updateSongStatus.mockResolvedValue();

    const body = { word_id: 5, is_correct: true };
    const res = await request(app)
      .post("/api/study-logs")
      .set("Authorization", `Bearer ${getToken()}`)
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(mockLog);
  });

  test("returns 400 when word_id is missing", async () => {
    const body = { is_correct: true };
    const res = await request(app)
      .post("/api/study-logs")
      .set("Authorization", `Bearer ${getToken()}`)
      .send(body);

    expect(res.statusCode).toBe(400);
  });

  test("returns 401 when no token is provided", async () => {
    const body = { word_id: 5, is_correct: true };
    const res = await request(app).post("/api/study-logs").send(body);

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /api/study-logs", () => {
  test("returns 200 with all user's study logs", async () => {
    const mockLogs = [
      { id: 1, user_id: 1, word_id: 5, is_correct: true, studied_at: "2026-06-05T18:45:37.518Z" }
    ];
    studyLogModel.findByUserId.mockResolvedValue(mockLogs);

    const res = await request(app)
      .get("/api/study-logs")
      .set("Authorization", `Bearer ${getToken()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockLogs);
  });

  test("returns 200 with study logs filtered by song_id", async () => {
    const mockLogs = [
      { id: 1, user_id: 1, word_id: 5, is_correct: true, studied_at: "2026-06-05T18:45:37.518Z" }
    ];
    studyLogModel.findByUserAndSong.mockResolvedValue(mockLogs);

    const res = await request(app)
      .get("/api/study-logs?song_id=2")
      .set("Authorization", `Bearer ${getToken()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockLogs);
  });

  test("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/study-logs");
    expect(res.statusCode).toBe(401);
  });
});