import { BadRequestError, ForbiddenError, IUseCaseContext, NotFoundError, UseCase } from "@core";
import { Lyric } from "@modules/lyric/entities/Lyric";
import { ILyricProvider } from "@modules/lyric/providers/ILyricProvider";
import { LyricProvider } from "@modules/lyric/providers/LyricProvider";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { inject, injectable } from "tsyringe";
import { GetNowPlayingParams } from "../GetNowPlayingUseCase";

type Response = Lyric;

@injectable()
export class GetNowPlayingLyricUseCase extends UseCase<GetNowPlayingParams, Response> {
	constructor(
		@inject(QueueRepository) private queueRepository: QueueRepository,
		@inject(LyricProvider) private lyricProvider: ILyricProvider
	) {
		super();
	}

	public async run(params: GetNowPlayingParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new NotFoundError("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new ForbiddenError("User not in voice channel");
		}

		const target = queue.nowPlaying;
		if (!target) throw new BadRequestError("No song is playing");

		const lyric = await this.lyricProvider.getLyric(target.video.title);
		if (!lyric) throw new NotFoundError("Lyric not found");

		return lyric;
	}
}
