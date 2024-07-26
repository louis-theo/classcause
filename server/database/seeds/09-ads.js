/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const ads = require("../../data/advertisement");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("Advertisement").del();
  await knex("Advertisement").insert(ads);
};
