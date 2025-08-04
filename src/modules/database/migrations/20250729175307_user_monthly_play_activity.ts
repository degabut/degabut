import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_monthly_play_activity", (table) => {
    table.string("user_id");
    table.date("date");
    table.integer("play_count");
    table.integer("unique_play_count");

    table.primary(["user_id", "date"]);
    table.index(["user_id", "date"], "user_monthly_play_activity_user_id_date_index");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_monthly_play_activity");
}
