import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("channel", (table) => {
    table.string("id").primary();
    table.string("name");
    table.json("thumbnails");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("channel");
}
