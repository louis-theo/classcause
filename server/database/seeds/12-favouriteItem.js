/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const favouriteItem = require("../../data/favouriteItem");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("FavouriteItem").del();
  await knex("FavouriteItem").insert(favouriteItem);
};
