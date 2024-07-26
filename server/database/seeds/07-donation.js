/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const donation = require("../../data/donation");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("Donation").del();
  await knex("Donation").insert(donation);
};
