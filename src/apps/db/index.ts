import Knex from "knex";
import knexConfig from "./knexfile";

export const migrateDb = async (): Promise<void> => {
	const knex = Knex(knexConfig);
	await knex.migrate.latest();
};
