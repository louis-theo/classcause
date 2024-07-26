/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const adBidder = require("../../data/advertisementBidder");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("AdvertisementBidder").del();
  await knex("AdvertisementBidder").insert(adBidder);
};
