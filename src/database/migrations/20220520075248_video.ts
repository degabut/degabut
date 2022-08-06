import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("video", (table) => {
    table.string("id").primary();
    table.string("title");
    table.integer("duration");
    table.json("thumbnails");
    table.bigInteger("view_count");
    table.string("channel_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("video");
}
