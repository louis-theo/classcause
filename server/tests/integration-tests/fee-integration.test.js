const request = require("supertest");
const express = require("express");
const router = require("../../routes/transaction_fee");

const app = express();
app.use(express.json());
app.use(router);

describe("Fee Management Integration Tests", () => {
  test("Update existing transaction fee", async () => {
    const newRate = { transactionRate: 3.0 };
    const response = await request(app).put("/1").send(newRate);
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("updated successfully");
  });

  test("Delete transaction fee", async () => {
    const response = await request(app).delete("/1");
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("deleted successfully");
  });
});
