import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("playlist", (table) => {
    table.string("id").primary();
    table.string("name");
    table.string("owner_id");
    table.timestamp("created_at");
    table.timestamp("updated_at");
  });

  await knex.schema.createTable("playlist_video", (table) => {
    table.string("id").primary();
    table.string("playlist_id").references("id").inTable("playlist");
    table.string("video_id").references("id").inTable("video");
    table.string("created_by");
    table.timestamp("created_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("playlist");
  await knex.schema.dropTableIfExists("playlist_video");
}
