import "dotenv/config";
import type { Knex } from "knex";

const config: Knex.Config = {
	client: "pg",
	connection: process.env.POSTGRES_DATABASE_URL,
	migrations: {
		directory: "./src/apps/db/migrations",
		tableName: "knex_migrations",
	},
};

module.exports = config;
