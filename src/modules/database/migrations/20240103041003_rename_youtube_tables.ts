import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable("video", "youtube_video");
  await knex.schema.renameTable("channel", "youtube_channel");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.renameTable("youtube_video", "video");
  await knex.schema.renameTable("youtube_channel", "channel");
}
