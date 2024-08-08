import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("playlist", (table) => {
    table.index(["owner_id", "created_at"]);
  });

  await knex.schema.alterTable("playlist_media_source", (table) => {
    table.index("playlist_id");
  });

  await knex.schema.alterTable("playlist_media_source", (table) => {
    table.index(["playlist_id", "media_source_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("playlist", (table) => {
    table.dropIndex("owner_id");
  });

  await knex.schema.alterTable("playlist_media_source", (table) => {
    table.dropIndex("playlist_id");
  });

  await knex.schema.alterTable("playlist_media_source", (table) => {
    table.dropIndex(["playlist_id", "media_source_id"]);
  });
}
