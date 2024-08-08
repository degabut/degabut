import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_listen_history", (table) => {
    table.string("video_id").index();
    table.string("user_id").index();
    table.string("voice_channel_id");
    table.string("guild_id");
    table.boolean("is_requester").defaultTo(false);
    table.timestamp("listened_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_listen_history");
}
