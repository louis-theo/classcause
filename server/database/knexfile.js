require("dotenv").config();

const database = process.env.DB_LOCAL_DBNAME;
const user = process.env.DB_LOCAL_USER;
const password = process.env.DB_LOCAL_PASSWORD;
const port = parseInt(process.env.DB_LOCAL_PORT, 10);
const host = process.env.DB_HOST;

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: host,
      database: database,
      user: user,
      password: password,
      port: port,
    },
  },
  test: {
    client: "sqlite3",
    connection: {
      filename: "./test-database.sqlite",
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, done) => {
        conn.run("PRAGMA foreign_keys = ON", done);
      },
    },
    migrations: {
      directory: "./database/migrations",
    },
    seeds: {
      directory: "./database/seeds",
    },
  },
};
