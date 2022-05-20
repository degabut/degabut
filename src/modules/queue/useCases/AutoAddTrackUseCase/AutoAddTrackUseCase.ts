import { UseCase } from "@core";
import { Track } from "@modules/queue/entities/Track";
import { OnTrackAddEvent } from "@modules/queue/events/OnTrackAddEvent";
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

		const track = new Track({
			video: upNext,
			requestedBy: lastSong.requestedBy,
		});

		const isPlayedImmediately = !queue.nowPlaying;
		queue.addTrack(track);
		this.emit(OnTrackAddEvent, { queue, track, isPlayedImmediately });
	}
}
