import { EventHandler } from "@core";
import { Queue } from "@modules/queue/entities/Queue";
import { UserPlayHistory } from "@modules/user/entities/UserPlayHistory";
import { UserPlayHistoryRepository } from "@modules/user/repositories/UserPlayHistoryRepository/UserPlayHistoryRepository";
import { ChannelRepository } from "@modules/youtube/repositories/ChannelRepository/ChannelRepository";
import { VideoRepository } from "@modules/youtube/repositories/VideoRepository/VideoRepository";
import { inject, injectable } from "tsyringe";

type Data = { queue: Queue };

@injectable()
export class OnTrackStartEvent extends EventHandler<Data> {
	constructor(
		@inject(UserPlayHistoryRepository)
		private userPlayHistoryRepository: UserPlayHistoryRepository,
		@inject(VideoRepository)
		private videoRepository: VideoRepository,
		@inject(ChannelRepository)
		private channelRepository: ChannelRepository
	) {
		super();
	}

	public async run({ queue }: Data): Promise<void> {
		const { nowPlaying } = queue;
		if (!nowPlaying) return;

		await Promise.all([
			queue.textChannel.send({
				content: "🎶 **Now Playing**",
				embeds: [nowPlaying.embed],
			}),
			this.userPlayHistoryRepository.insert(
				new UserPlayHistory({
					playedAt: new Date(),
					userId: nowPlaying.requestedBy.id,
					videoId: nowPlaying.video.id,
				})
			),
			nowPlaying.video.channel && this.channelRepository.upsert(nowPlaying.video.channel),
			this.videoRepository.upsert(nowPlaying.video),
		]);
	}
}
