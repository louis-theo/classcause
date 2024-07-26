/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const fee = require("../../data/transaction");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("TransactionFee").del();
  await knex("TransactionFee").insert(fee);
};
