const request = require("supertest");
const express = require("express");
const knexMock = require("mock-knex");
const router = require("../../routes/transaction_fee");
const knex = require("../setup");

const app = express();
app.use(express.json());
app.use(router);

describe("Fee Management Unit Tests", () => {
  beforeAll(async () => {
    await knex("TransactionFee").insert({
      accountType: "teacher",
      transactionRate: 0.5,
      timeStamp: new Date(),
    });
  });

  afterAll(async () => {
    await knex("TransactionFee").where("accountType", "teacher").del();
  });

  test("Get latest transaction fee by account type", async () => {
    const tracker = knexMock.getTracker();
    tracker.install();
    tracker.on("query", (query, step) => {
      if (step === 1) {
        query.response([{ transactionRate: 0.5 }]);
      }
    });

    const response = await request(app).get("/latest/teacher");
    expect(response.status).toBe(200);
    expect(response.body.transactionRate).toEqual(0.5);

    tracker.uninstall();
  });

  test("Create new transaction fee", async () => {
    const tracker = knexMock.getTracker();
    tracker.install();
    tracker.on("query", (query) => {
      query.response([1]);
    });

    const newFee = { accountType: "teacher", transactionRate: 0.5 };
    const response = await request(app).post("/create").send(newFee);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("transactionFeeId");

    tracker.uninstall();
  });
});
