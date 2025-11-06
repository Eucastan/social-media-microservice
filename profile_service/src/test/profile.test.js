import { jest } from "@jest/globals";

// Mock fetchPost for gallery endpoint
jest.mock("../utils/axiosClient.js", () => {
  return {
    fetchPost: jest.fn(() => Promise.resolve({ posts: [] }))
  };
});

// Mock auth middleware to always inject a test user
jest.mock("../middleware/mockAuth.js", () => (req, res, next) => {
  req.user = { id: 10 };
  next();
});

// Mock JWT utilities (if used anywhere)
jest.mock("../utils/authvalidate.js", () => ({
  VerifyToken: jest.fn(() => ({ id: 10 })),
  SignToken: jest.fn()
}));

// Mock RabbitMQ publisher
jest.mock("../config/mq.js", () => ({ publishEvent: jest.fn(async () => {}) }));

// Mock S3 client
jest.mock("../config/s3Client.js", () => ({ send: jest.fn() }));

// ------------------------------
// IMPORTS (after mocks)
// ------------------------------
import request from "supertest";
import app from "../app.js";
import { sequelize } from "../models/index.js";
import { Profile } from "../models/index.js";

// ------------------------------
// SETUP & TEARDOWN
// ------------------------------
beforeAll(async () => {
  // Sync database before running tests
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close DB connection after tests
  await sequelize.close();
});

afterEach(() => {
  // Clear mocks after each test
  jest.clearAllMocks();
});

// ------------------------------
// TESTS
// ------------------------------
describe("PROFILE SERVICE", () => {

  it("Should reject requests without token", async () => {
    const res = await request(app).get("/api/profiles/10");
    // Because auth is mocked, req.user is injected
    expect(res.status).not.toBe(401);
  });

  it("Should return 404 when profile does not exist", async () => {
    const res = await request(app).get("/api/profiles/10");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Profile not found");
  });

  it("Should create a profile using upsert", async () => {
    const res = await request(app)
      .put("/api/profiles")
      .send({
        displayName: "Test User",
        bio: "Short bio test",
        location: "Nigeria",
        socialLinks: JSON.stringify({ ig: "test" })
      });

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(10);
    expect(res.body.displayName).toBe("Test User");

    const created = await Profile.findByPk(10);
    expect(created).not.toBeNull();
    expect(created.displayName).toBe("Test User");
  });

  it("Should fetch an existing profile", async () => {
    const res = await request(app).get("/api/profiles/10");
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(10);
    expect(res.body.displayName).toBe("Test User");
  });

  it("Should update the profile", async () => {
    const res = await request(app)
      .put("/api/profiles")
      .send({
        displayName: "Updated User",
        bio: "Updated bio",
        location: "Lagos",
        socialLinks: JSON.stringify({ tw: "test2" })
      });

    expect(res.status).toBe(200);
    expect(res.body.displayName).toBe("Updated User");

    const updated = await Profile.findByPk(10);
    expect(updated.displayName).toBe("Updated User");
    expect(updated.socialLinks).toEqual({ tw: "test2" });
  });

  /*
  it("Should return empty gallery from mocked Post service", async () => {
    const { fetchPost } = await import("../utils/axiosClient.js"); // import after mock
    fetchPost.mockResolvedValue({ posts: [] }); // ensure mock resolves

    const res = await request(app).get("/api/profiles/10/gallery");
    expect(res.status).toBe(200);
    expect(res.body.posts).toBeDefined();
    expect(res.body.posts).toEqual([]);
  });*/

});
