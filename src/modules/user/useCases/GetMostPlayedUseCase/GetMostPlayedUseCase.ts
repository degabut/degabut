import { IUseCaseContext, UseCase } from "@core";
import { VideoCompactDto } from "@modules/youtube/dto/VideoCompactDto";
import { VideoRepository } from "@modules/youtube/repositories/VideoRepository/VideoRepository";
import { inject, injectable } from "tsyringe";
import { GetMostPlayedParams } from "./GetMostPlayedAdapter";

type Response = VideoCompactDto[];

@injectable()
export class GetMostPlayedUseCase extends UseCase<GetMostPlayedParams, Response> {
	constructor(
		@inject(VideoRepository)
		private videoRepository: VideoRepository
	) {
		super();
	}

	public async run(params: GetMostPlayedParams, { userId }: IUseCaseContext): Promise<Response> {
		const { days, count } = params;

		const from = new Date();
		from.setDate(from.getDate() - days);

		const videos = await this.videoRepository.getMostPlayedVideos(userId, {
			count,
			from,
		});

		return videos.map(VideoCompactDto.create);
	}
}
