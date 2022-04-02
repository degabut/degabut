import { IUseCaseContext, UseCase } from "@core";
import { IQueueRepository } from "@modules/queue/repository/IQueueRepository";
import { VideoCompact } from "@modules/youtube/domains/VideoCompact";
import { DIYoutubeProvider, IYoutubeProvider } from "@modules/youtube/providers/IYoutubeProvider";
import { inject, injectable } from "tsyringe";
import { GetRelatedParams } from "./GetRelatedAdapter";

type Response = VideoCompact[];

@injectable()
export class GetRelatedUseCase extends UseCase<GetRelatedParams, Response> {
	constructor(
		@inject("QueueRepository") private queueRepository: IQueueRepository,
		@inject(DIYoutubeProvider) private youtubeProvider: IYoutubeProvider
	) {
		super();
	}

	public async run(params: GetRelatedParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		const target = queue.nowPlaying || queue.history[0];
		if (!target) throw new Error("No song is playing");

		const video = await this.youtubeProvider.getVideo(target.video.id);
		if (!video) throw new Error("Video not found");

		const relatedVideos = [video.upNext, ...video.related]
			.filter((v): v is VideoCompact => v !== null)
			.slice(0, 10);

		return relatedVideos;
	}
}
