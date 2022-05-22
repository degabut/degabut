import "dotenv/config";
import type { Knex } from "knex";
import path from "path";

const config: Knex.Config = {
	client: "pg",
	connection: process.env.POSTGRES_DATABASE_URL,
	migrations: {
		directory: path.join(__dirname, "./migrations"),
		tableName: "knex_migrations",
	},
};

module.exports = config;
export default config;
