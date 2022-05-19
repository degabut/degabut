import { EventHandler } from "@core";
import { Queue } from "@modules/queue/domain/Queue";
import { TrackPlayHistory } from "@modules/queue/domain/TrackPlayHistory";
import { TrackPlayHistoryRepository } from "@modules/queue/repository/TrackPlayHistoryRepository";
import { inject, injectable } from "tsyringe";

type Data = { queue: Queue };

@injectable()
export class OnTrackStartEvent extends EventHandler<Data> {
	constructor(
		@inject(TrackPlayHistoryRepository)
		private trackPlayHistoryRepository: TrackPlayHistoryRepository
	) {
		super();
	}

	public async run({ queue }: Data): Promise<void> {
		if (!queue.nowPlaying) return;

		await queue.textChannel.send({
			content: "🎶 **Now Playing**",
			embeds: [queue.nowPlaying.embed],
		});

		await this.trackPlayHistoryRepository.insert(
			new TrackPlayHistory({
				playedAt: new Date(),
				userId: queue.nowPlaying.requestedBy.id,
				videoId: queue.nowPlaying.video.id,
			})
		);
	}
}
