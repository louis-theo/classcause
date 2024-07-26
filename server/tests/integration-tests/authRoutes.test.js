const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("../../routes/users_auth.js");
const knex = require("../setup.js");

const app = express();
app.use(bodyParser.json());
app.use(authRoutes);

describe("Authentication Routes", () => {
  test("Database has Users table", async () => {
    const result = await knex.schema.hasTable("Users");
    expect(result).toBe(true);
  });

  test("Register a new user", async () => {
    const newUser = {
      userFirstName: "John",
      email: "john@example.com",
      password: "123456",
      mobileNum: "1234567890",
      userLastName: "Doe",
      accountType: "teacher",
      groupName: "Group1",
      school: "School1",
      street: "123 Elm St",
      city: "Townsville",
      postcode: "12345",
      orderCompletion: "Yes",
      bio: "A teacher",
    };

    const response = await request(app).post("/register").send(newUser);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("userId");
  });

  test("Log in existing user", async () => {
    const userData = {
      email: "john@example.com",
      password: "123456",
    };

    const response = await request(app).post("/login").send(userData);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("authToken");
  });
});
