import { IUseCaseContext, UseCase } from "@core";
import { VideoCompactDto } from "@modules/youtube/dto/VideoCompactDto";
import { VideoRepository } from "@modules/youtube/repositories/VideoRepository/VideoRepository";
import { inject, injectable } from "tsyringe";
import { GetRecommendationParams } from "./GetRecommendationAdapter";

type Response = VideoCompactDto[];

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
		const { count } = params;

		const videos = await this.videoRepository.getLastPlayedVideos(userId, count);

		return videos.map(VideoCompactDto.create);
	}
}
