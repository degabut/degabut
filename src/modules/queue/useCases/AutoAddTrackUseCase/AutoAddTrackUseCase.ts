import { UseCase } from "@core";
import { Track } from "@modules/queue/domain/Track";
import { DIYoutubeProvider, IYoutubeProvider } from "@modules/youtube/providers/IYoutubeProvider";
import { inject, injectable } from "tsyringe";
import { AutoAddTrackParams } from "./AutoAddTrackAdapter";

type Response = void;

@injectable()
export class AutoAddTrackUseCase extends UseCase<AutoAddTrackParams, Response> {
	constructor(@inject(DIYoutubeProvider) private youtubeProvider: IYoutubeProvider) {
		super();
	}

	public async run(params: AutoAddTrackParams): Promise<Response> {
		const { queue } = params;

		const lastSong = queue.history[0];
		if (!lastSong) throw new Error("No last song found");

		const video = await this.youtubeProvider.getVideo(lastSong.video.id);
		if (!video) return;

		const upNext = video.related[0];
		if (!upNext) return;

		return queue.addTrack(
			new Track({
				video: upNext,
				requestedBy: lastSong.requestedBy,
			})
		);
	}
}
