import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user_play_history", (table) => {
    table.index(
      [knex.raw("video_id ASC"), knex.raw("played_at DESC")],
      "video_id_played_at_order_index",
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user_play_history", (table) => {
    table.dropIndex("video_id_played_at_order_index");
  });
}
