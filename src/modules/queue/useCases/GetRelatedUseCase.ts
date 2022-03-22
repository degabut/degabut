import Joi from "joi";
import { inject, injectable } from "tsyringe";
import { VideoCompact } from "youtubei";
import { UseCase } from "../../../core";
import { YoutubeProvider } from "../../youtube";
import { QueueManager } from "../managers/QueueManager";

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
		@inject(QueueManager) private queueManager: QueueManager,
		@inject(YoutubeProvider) private youtubeProvider: YoutubeProvider
	) {
		super();
	}

	public async run(params: Params): Promise<Response> {
		const { guildId } = params;

		const queue = this.queueManager.get(guildId);
		if (!queue) throw new Error("Queue not found");

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
