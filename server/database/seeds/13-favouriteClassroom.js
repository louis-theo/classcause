/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const favouriteClassroom = require("../../data/favouriteClassroom");

exports.seed = async function(knex) {
  // Deletes ALL existing entries in FavouriteClassroom table
  await knex("FavouriteClassroom").del();

  // Inserts seed entries from favouriteClassroom data file
  await knex("FavouriteClassroom").insert(favouriteClassroom);
};
