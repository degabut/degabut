import { UserPlayHistory } from "@modules/user/domain/UserPlayHistory";
import { Knex } from "knex";
import { inject, injectable } from "tsyringe";

type Props = {
	video_id: string;
	user_id: string;
	played_at: Date;
};

@injectable()
export class UserPlayHistoryRepository {
	private table: Knex.QueryBuilder<Props>;

	constructor(@inject("knex") knex: Knex) {
		this.table = knex.table("user_play_history");
	}

	public async insert(userPlayHistory: UserPlayHistory): Promise<void> {
		await this.table.insert({
			user_id: userPlayHistory.userId,
			video_id: userPlayHistory.videoId,
			played_at: userPlayHistory.playedAt,
		});
	}
}
