import Joi from "joi";
import { inject, injectable } from "tsyringe";
import { VideoCompact } from "youtubei";
import { UseCase } from "../../../core";
import { IYoutubeProvider } from "../../youtube";
import { YoutubeProvider } from "../../youtube/providers/YoutubeProvider";
import { Queue, Track } from "../domain";
import { QueueManager } from "../managers/QueueManager";

interface Params {
	queue: Queue;
}

type Response = void;

@injectable()
export class AutoAddTrackUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		queue: Joi.object().instance(Queue).required(),
	}).required();

	constructor(@inject(YoutubeProvider) private youtubeProvider: IYoutubeProvider) {
		super();
	}

	public async run(params: Params): Promise<Response> {
		const { queue } = params;

		const lastSong = queue.history[0];
		if (!lastSong) throw new Error("No last song found");

		const video = await this.youtubeProvider.getVideo(lastSong.id);
		if (!video) return;
		const [upNext] = [video.upNext, ...video.related].filter((v) => v instanceof VideoCompact);
		if (!upNext) return;

		return queue.addTrack(
			new Track({
				id: upNext.id,
				thumbnailUrl: upNext.thumbnails.best || "",
				title: upNext.title,
				requestedBy: lastSong.requestedBy,
				channel: upNext.channel,
				duration: ("duration" in upNext ? upNext.duration : 0) || 0,
			})
		);
	}
}
