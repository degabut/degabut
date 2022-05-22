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
					.limit(count)
					.as("user_play_history");
			})
			.withGraphFetched("video")
			.withGraphFetched("video.channel")
			.orderBy("played_at", "desc")
			.limit(count);

		return results.map((r) => VideoRepositoryMapper.toDomainEntity(r.video as VideoModel));
	}
}
