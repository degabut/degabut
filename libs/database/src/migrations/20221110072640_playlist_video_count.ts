import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("playlist", (table) => {
    table.integer("video_count").defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("video", (table) => {
    table.dropColumns("video_count");
  });
}
