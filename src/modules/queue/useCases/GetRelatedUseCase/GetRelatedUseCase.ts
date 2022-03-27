import { IUseCaseContext, UseCase } from "@core";
import { IQueueRepository } from "@modules/queue";
import { YoutubeProvider } from "@modules/youtube";
import Joi from "joi";
import { inject, injectable } from "tsyringe";
import { VideoCompact } from "youtubei";

interface Params {
	guildId: string;
}

type Response = VideoCompact[];

@injectable()
export class GetRelatedUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		guildId: Joi.string().required(),
	}).required();

	constructor(
		@inject("QueueRepository") private queueRepository: IQueueRepository,
		@inject(YoutubeProvider) private youtubeProvider: YoutubeProvider
	) {
		super();
	}

	public async run(params: Params, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		const target = queue.nowPlaying || queue.history[0];
		if (!target) throw new Error("No song is playing");

		const video = await this.youtubeProvider.getVideo(target.id);
		if (!video) throw new Error("Video not found");

		const relatedVideos = [video.upNext, ...video.related]
			.filter((v) => v instanceof VideoCompact)
			.slice(0, 10) as VideoCompact[];

		return relatedVideos;
	}
}
