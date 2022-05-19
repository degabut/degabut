import { TrackPlayHistory } from "@modules/queue/domain/TrackPlayHistory";
import { Knex } from "knex";
import { inject, injectable } from "tsyringe";

type Props = {
	video_id: string;
	user_id: string;
	played_at: Date;
};

@injectable()
export class TrackPlayHistoryRepository {
	private table: Knex.QueryBuilder<Props>;

	constructor(@inject("knex") knex: Knex) {
		this.table = knex.table("track_play_history");
	}

	public async insert(trackPlayHistory: TrackPlayHistory): Promise<void> {
		await this.table.insert({
			user_id: trackPlayHistory.userId,
			video_id: trackPlayHistory.videoId,
			played_at: trackPlayHistory.playedAt,
		});
	}
}
