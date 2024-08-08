import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user_play_history", (table) => {
    table.string("voice_channel_id").nullable().defaultTo(null);
    table.string("guild_id").nullable().defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user_play_history", (table) => {
    table.dropColumns("voice_channel_id", "guild_id");
  });
}
