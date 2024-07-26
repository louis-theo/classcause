// EXAMPLE FILE - NEEDS TO BE MODIFIED TO ADD MORE DUMMY DATA

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const usersData = require("../../data/users"); //aray with data has to match the structure of the table

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("Users").del();
  // Seed the table
  await knex("Users").insert(usersData);
};

//async await syntax - bc it waits for it to clean first and then insert new one so no overlap
