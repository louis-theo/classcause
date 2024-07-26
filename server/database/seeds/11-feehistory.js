/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

// seeding/feehistory.js

const feeHistory = require("../../data/feehistory");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("FeeHistory").del();
  await knex("FeeHistory").insert(feeHistory.map(fee => ({
    ...fee,
    // Ensure `updateTime` is handled correctly based on your DB's expected format
    updateTime: new Date(fee.updateTime)
  })));
};
