import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("spotify_album", (table) => {
    table.string("id").primary();
    table.string("name");
    table.json("images");
  });

  await knex.schema.createTable("spotify_artist", (table) => {
    table.string("id").primary();
    table.string("name");
  });

  await knex.schema.createTable("spotify_track", (table) => {
    table.string("id").primary();
    table.string("name");
    table.integer("duration_ms");
    table.string("album_id").references("id").inTable("spotify_album");
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("spotify_track_artist", (table) => {
    table.string("track_id").references("id").inTable("spotify_track");
    table.string("artist_id").references("id").inTable("spotify_artist");

    table.primary(["track_id", "artist_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("spotify_track_artist");
  await knex.schema.dropTableIfExists("spotify_track");
  await knex.schema.dropTableIfExists("spotify_artist");
  await knex.schema.dropTableIfExists("spotify_album");
}
