const request = require("supertest");
const express = require("express");
const knexMock = require("mock-knex");
const router = require("../../routes/bids.js");

const app = express();
app.use(express.json());
app.use(router);

// unit test for adding a bid
describe("POST /add", () => {
  it("rejects bids below the minimum bid amount", async () => {
    const tracker = knexMock.getTracker();
    tracker.install();
    tracker.on("query", (query, step) => {
      if (step === 1) {
        query.response([{ startingPrice: "500" }]);
      }
    });

    const response = await request(app)
      .post("/add")
      .send({ advertisementId: 1, businessID: 1, price: 60 });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "You need to meet the minimum bid amount"
    );

    tracker.uninstall();
  });
});

// unit test for deleting a bid
describe("DELETE /remove/:bidId", () => {
  it("handles non-existent bid deletions gracefully", async () => {
    const tracker = knexMock.getTracker();
    tracker.install();
    tracker.on("query", (query, step) => {
      if (step === 1) {
        query.response([]); // simulate no bid found
      }
    });

    const response = await request(app).delete("/remove/999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Bid not found");

    tracker.uninstall();
  });
});
