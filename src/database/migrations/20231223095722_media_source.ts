import { Knex } from "knex";

const tables = ["playlist_video", "user_play_history", "user_listen_history", "user_like_video"];

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("media_source", (table) => {
    table.string("id").primary();
    table.string("youtube_video_id").references("id").inTable("video").unique();
    table.string("spotify_track_id").references("id").inTable("spotify_track").unique();
    table.string("played_youtube_video_id");
  });

  const videos = await knex("video").select("id");
  await knex("media_source").insert(
    videos.map((v) => ({
      id: `youtube/${v.id}`,
      youtube_video_id: v.id,
      played_youtube_video_id: v.id,
    })),
  );

  for (const table of tables) {
    await knex.schema.alterTable(table, (table) => table.dropForeign("video_id"));
    await knex.raw(`UPDATE ${table} SET video_id = 'youtube/' || video_id`);
    await knex.schema.alterTable(table, (table) => {
      table.renameColumn("video_id", "media_source_id");
      table.foreign("media_source_id").references("id").inTable("media_source");
    });
  }

  await knex.schema.renameTable("playlist_video", "playlist_media_source");
  await knex.schema.alterTable("playlist", (table) => {
    table.renameColumn("video_count", "media_source_count");
  });
  await knex.schema.renameTable("user_like_video", "user_like_media_source");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("playlist", (table) => {
    table.renameColumn("media_source_count", "video_count");
  });
  await knex.schema.renameTable("playlist_media_source", "playlist_video");
  await knex.schema.renameTable("user_like_media_source", "user_like_video");

  for (const table of tables) {
    await knex.schema.alterTable(table, (table) => {
      table.dropForeign("media_source_id");
      table.renameColumn("media_source_id", "video_id");
      table.foreign("video_id").references("id").inTable("video");
    });
    await knex.raw(`UPDATE ${table} SET video_id = split_part(video_id, '/', 2)`);
  }

  await knex.schema.dropTable("media_source");
}
