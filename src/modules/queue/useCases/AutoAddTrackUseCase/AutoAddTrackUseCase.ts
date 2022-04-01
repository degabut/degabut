import { UseCase } from "@core";
import { Track } from "@modules/queue/domain/Track";
import { IYoutubeProvider } from "@modules/youtube/providers/IYoutubeProvider";
import { YoutubeProvider } from "@modules/youtube/providers/YoutubeProvider";
import { inject, injectable } from "tsyringe";
import { VideoCompact } from "youtubei";
import { AutoAddTrackParams } from "./AutoAddTrackAdapter";

type Response = void;

@injectable()
export class AutoAddTrackUseCase extends UseCase<AutoAddTrackParams, Response> {
	constructor(@inject(YoutubeProvider) private youtubeProvider: IYoutubeProvider) {
		super();
	}

	public async run(params: AutoAddTrackParams): Promise<Response> {
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
