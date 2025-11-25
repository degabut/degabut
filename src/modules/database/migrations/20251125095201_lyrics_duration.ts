import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("lyrics", (table) => {
    table.integer("duration").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("lyrics", (table) => {
    table.dropColumn("duration");
  });
}
