import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_like_video", (table) => {
    table.string("video_id").references("id").inTable("video");
    table.string("user_id");
    table.timestamp("liked_at");

    table.primary(["video_id", "user_id"]);
    table.index(["liked_at", "video_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_like_video");
}
