/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const message = require("../../data/message");

exports.seed = async function (knex) {
  await knex("Message").del();
  await knex("Message").insert(message);
};
