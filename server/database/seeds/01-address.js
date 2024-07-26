/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const address = require("../../data/address");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("Address").del();
  await knex("Address").insert(address);
};
