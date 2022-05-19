import { EventHandler } from "@core";
import { Queue } from "@modules/queue/domain/Queue";
import { UserPlayHistory } from "@modules/user/domain/UserPlayHistory";
import { UserPlayHistoryRepository } from "@modules/user/repository/UserPlayHistoryRepository";
import { inject, injectable } from "tsyringe";

type Data = { queue: Queue };

@injectable()
export class OnTrackStartEvent extends EventHandler<Data> {
	constructor(
		@inject(UserPlayHistoryRepository)
		private userPlayHistoryRepository: UserPlayHistoryRepository
	) {
		super();
	}

	public async run({ queue }: Data): Promise<void> {
		if (!queue.nowPlaying) return;

		await queue.textChannel.send({
			content: "🎶 **Now Playing**",
			embeds: [queue.nowPlaying.embed],
		});

		await this.userPlayHistoryRepository.insert(
			new UserPlayHistory({
				playedAt: new Date(),
				userId: queue.nowPlaying.requestedBy.id,
				videoId: queue.nowPlaying.video.id,
			})
		);
	}
}
