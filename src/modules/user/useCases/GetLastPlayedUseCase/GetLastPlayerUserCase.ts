import { IUseCaseContext, NotFoundError, UseCase } from "@core";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { VideoCompactDto } from "@modules/youtube/dto/VideoCompactDto";
import { VideoRepository } from "@modules/youtube/repositories/VideoRepository/VideoRepository";
import { inject, injectable } from "tsyringe";
import { GetLastPlayedParams } from "./GetLastPlayedAdapter";

type Response = VideoCompactDto[];

@injectable()
export class GetLastPlayedUseCase extends UseCase<GetLastPlayedParams, Response> {
	constructor(
		@inject(VideoRepository)
		private videoRepository: VideoRepository,

		@inject(QueueRepository)
		private queueRepository: QueueRepository
	) {
		super();
	}

	public async run(params: GetLastPlayedParams, { userId }: IUseCaseContext): Promise<Response> {
		const { count } = params;

		let targetUserId: string;
		if (params.userId !== userId) {
			const queue = this.queueRepository.getByUserId(userId);
			if (!queue) throw new NotFoundError("Queue not found");
			try {
				const user = await queue.voiceChannel.guild.members.fetch({ user: params.userId });
				targetUserId = user.id;
			} catch (err) {
				throw new NotFoundError("User not found");
			}
		} else {
			targetUserId = userId;
		}

		const videos = await this.videoRepository.getLastPlayedVideos(targetUserId, count);

		return videos.map(VideoCompactDto.create);
	}
}
