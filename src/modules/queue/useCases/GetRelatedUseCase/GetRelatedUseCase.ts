import { IUseCaseContext, UseCase } from "@core";
import { TrackDto } from "@modules/queue/dto/TrackDto";
import { IQueueRepository } from "@modules/queue/repositories/IQueueRepository";
import { VideoCompactDto } from "@modules/youtube/dto/VideoCompactDto";
import { VideoCompact } from "@modules/youtube/entities/VideoCompact";
import { DIYoutubeProvider, IYoutubeProvider } from "@modules/youtube/providers/IYoutubeProvider";
import { inject, injectable } from "tsyringe";
import { GetRelatedParams } from "./GetRelatedAdapter";

type Response = {
	target: TrackDto;
	videos: VideoCompactDto[];
};

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

		const relatedVideos = [...video.related]
			.filter((v): v is VideoCompact => v instanceof VideoCompact)
			.slice(0, 10);

		return {
			target: TrackDto.create(target),
			videos: relatedVideos.map(VideoCompactDto.create),
		};
	}
}
