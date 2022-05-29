import { IUseCaseContext, UseCase } from "@core";
import { VideoCompactDto } from "@modules/youtube/dto/VideoCompactDto";
import { VideoRepository } from "@modules/youtube/repositories/VideoRepository/VideoRepository";
import { inject, injectable } from "tsyringe";
import { GetRecommendationParams } from "./GetRecommendationAdapter";

type Response = {
	lastPlayed: VideoCompactDto[];
	mostPlayed: VideoCompactDto[];
};

@injectable()
export class GetRecommendationUseCase extends UseCase<GetRecommendationParams, Response> {
	constructor(
		@inject(VideoRepository)
		private videoRepository: VideoRepository
	) {
		super();
	}

	public async run(
		params: GetRecommendationParams,
		{ userId }: IUseCaseContext
	): Promise<Response> {
		const { lastPlayedCount, mostPlayedCount } = params;

		const from = new Date();
		from.setDate(from.getDate() - 30);

		const [lastPlayedVideos, mostPlayedVideos] = await Promise.all([
			this.videoRepository.getLastPlayedVideos(userId, lastPlayedCount),
			this.videoRepository.getMostPlayedVideos(userId, { count: mostPlayedCount, from }),
		]);

		return {
			lastPlayed: lastPlayedVideos.map(VideoCompactDto.create),
			mostPlayed: mostPlayedVideos.map(VideoCompactDto.create),
		};
	}
}
