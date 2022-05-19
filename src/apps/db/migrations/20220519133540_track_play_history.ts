import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("track_play_history", (table) => {
		table.string("video_id").index();
		table.string("user_id").index();
		table.timestamp("played_at");
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists("track_play_history");
}
