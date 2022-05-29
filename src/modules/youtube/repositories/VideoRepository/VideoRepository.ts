import { UserPlayHistoryModel } from "@modules/user/repositories/UserPlayHistoryRepository/UserPlayHistoryModel";
import { VideoCompact } from "@modules/youtube/entities/VideoCompact";
import { Knex } from "knex";
import { inject, injectable } from "tsyringe";
import { VideoModel } from "./VideoModel";
import { VideoRepositoryMapper } from "./VideoRepositoryMapper";

@injectable()
export class VideoRepository {
	constructor(@inject("knex") private knex: Knex<VideoModel>) {}

	public async upsert(video: VideoCompact): Promise<void> {
		const model = VideoRepositoryMapper.toRepository(video);
		await VideoModel.query().insert(model).onConflict("id").merge();
	}

	public async getLastPlayedVideos(userId: string, count: number): Promise<VideoCompact[]> {
		const results = await UserPlayHistoryModel.query()
			.from((builder) => {
				builder
					.from(UserPlayHistoryModel.tableName)
					.distinctOn("video_id")
					.where({ user_id: userId })
					.as("user_play_history");
			})
			.orderBy("played_at", "desc")
			.limit(count)
			.withGraphFetched("video")
			.withGraphFetched("video.channel");

		return results.map((r) => VideoRepositoryMapper.toDomainEntity(r.video as VideoModel));
	}

	public async getMostPlayedVideos(
		userId: string,
		options: { from?: Date; to?: Date; count?: number } = {}
	): Promise<VideoCompact[]> {
		const results = await UserPlayHistoryModel.query()
			.select("video_id")
			.count("video_id as count")
			.where({ user_id: userId })
			.groupBy("user_play_history.video_id")
			.orderBy("count", "desc")
			.withGraphFetched("video")
			.withGraphFetched("video.channel")
			.modify((builder) => {
				const { from, to, count } = options;
				if (from) builder.where("played_at", ">=", from);
				if (to) builder.where("played_at", "<=", to);
				if (count) builder.limit(count);
			});

		return results.map((r) => VideoRepositoryMapper.toDomainEntity(r.video as VideoModel));
	}
}
