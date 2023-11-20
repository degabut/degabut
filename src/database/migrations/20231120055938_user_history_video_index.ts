import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user_play_history", (table) => {
    table.foreign("video_id").references("id").inTable("video").onDelete("CASCADE");
  });

  await knex.schema.alterTable("user_listen_history", (table) => {
    table.foreign("video_id").references("id").inTable("video").onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user_play_history", (table) => {
    table.dropForeign("video_id");
  });

  await knex.schema.alterTable("user_listen_history", (table) => {
    table.dropForeign("video_id");
  });
}
