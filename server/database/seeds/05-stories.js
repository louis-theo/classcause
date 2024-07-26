/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const story = require("../../data/story");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("Story").del();
  await knex("Story").insert(story);
};
