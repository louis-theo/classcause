const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const wishlistRoutes = require("../../routes/wishlists.js");
require("dotenv").config();
const { generateTestToken } = require("../tokenTestGeneration.js");

const app = express();
app.use(bodyParser.json());
app.use(wishlistRoutes);

describe("Wishlist Item Routes", () => {
  test("Create a new wishlist item", async () => {
    const newItem = {
      teacherId: 1,
      parentId: 1,
      name: "New Book",
      goalValue: 50.0,
      description: "A new book for the classroom",
      deadline: "2024-12-31",
      status: "active",
    };

    const token = generateTestToken(
      { id: 1, role: "teacher" },
      process.env.JWT_SECRET
    );

    const response = await request(app)
      .post("/create")
      .set("authorization", `Bearer ${token}`)
      .send(newItem);
    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty("wishlistItemId");
  });

  test("Fetch a wishlist item", async () => {
    const response = await request(app).get("/item/1");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("wishlistItemId", 1);
  });
});
