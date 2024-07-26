const request = require("supertest");
const express = require("express");
const router = require("../../routes/suggestions.js");

const app = express();
app.use(express.json());
app.use("/suggestions", router);

// unit tets for fetching suggestion made by user
describe("Wishlist Router", () => {
  it("should fetch wishlists for a user", async () => {
    const userId = 1;

    const response = await request(app).get(`/suggestions/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.any(Array));
  });
});
