import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user_like_media_source", (table) => {
    table.dropIndex(["liked_at", "media_source_id"], "user_like_video_liked_at_video_id_index");
  });

  await knex.schema.alterTable("user_like_media_source", (table) => {
    table.index(["user_id", "liked_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user_like_media_source", (table) => {
    table.dropIndex(["user_id", "liked_at"]);
  });

  await knex.schema.alterTable("user_like_media_source", (table) => {
    table.index(["liked_at", "media_source_id"], "user_like_video_liked_at_video_id_index");
  });
}
