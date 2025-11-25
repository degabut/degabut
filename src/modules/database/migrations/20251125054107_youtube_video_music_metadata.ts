import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("youtube_video", (table) => {
    table.json("music_metadata").nullable().defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("youtube_video", (table) => {
    table.dropColumns("music_metadata");
  });
}
