import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("lyrics", (table) => {
    table.string("media_source_id");
    table.string("source").notNullable();
    table.text("rich_synced").nullable();
    table.text("synced").nullable();
    table.text("unsynced").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();

    table.primary(["media_source_id", "source"]);
    table.index(["media_source_id", "source"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("lyrics");
}
