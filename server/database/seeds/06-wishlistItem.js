/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries

  const wishlistItem = require("../../data/wishlistitem");

  await knex("WishlistItem").del();
  await knex("WishlistItem").insert(wishlistItem);
};
