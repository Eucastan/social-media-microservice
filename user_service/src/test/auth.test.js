import request from "supertest";
import app from "../../app.js";
import { sequelize } from "../models/index.js";
import bcrypt from "bcrypt";

describe("Auth API", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ 
        username: "testuser", 
        email: "test@example.com", 
        password: "password123" 
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User created successfully");
  });

  it("should login with correct credentials", async () => {
    const hash = await bcrypt.hash("password123", 10);
    await sequelize.models.User.create({
      username: "testuser2",
      email: "test2@example.com",
      password: hash
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test2@example.com", password: "password123" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});