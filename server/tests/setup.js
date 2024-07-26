const knexConfig = require("../database/knexfile").test;
const knex = require("knex")(knexConfig);

global.beforeAll(async () => {
  await knex.migrate.latest();
  await knex.seed.run();
});

global.afterAll(async () => {
  await knex.migrate.rollback();
  await knex.destroy();
});

module.exports = knex;
