import { jest } from '@jest/globals';
import request from "supertest";
import app from "../app.js";
import { sequelize, UserRef } from "../models/index.js";
import { SignToken } from "../utils/authvalidate.js";

jest.setTimeout(20000); // 20 seconds, for DB-heavy tests

describe("Post API", () => {
  let token;
  let user;

  beforeAll(async () => {
    // Clean DB and sync all models
    await sequelize.sync({ force: true });

    // Create a test user reference for FK constraint
    user = await UserRef.create({
      userId: 1,
      displayName: "testuser",
      isPrivate: false,
    });

    // Generate auth token
    token = SignToken({ id: user.id, username: user.displayName });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should create a post", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Test post" });

    expect(res.statusCode).toBe(201);
    expect(res.body.content).toBe("Test post");
    expect(res.body.userInfo.displayName).toBe("testuser");
  });

  it("should get all posts", async () => {
    // Ensure at least one post exists
    await sequelize.models.Post.create({ userId: user.id, content: "Another post" });

    const res = await request(app)
      .get("/api/posts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.posts)).toBe(true);
    expect(res.body.totalItems).toBeGreaterThan(0);
  });

  it("should fail without auth token", async () => {
    const res = await request(app).get("/api/posts");
    expect(res.statusCode).toBe(401);
  });
});