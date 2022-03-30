import { IUseCaseContext, UseCase } from "@core";
import { Lyric } from "@modules/lyric/domains/Lyric";
import { ILyricProvider } from "@modules/lyric/providers/ILyricProvider";
import { LyricProvider } from "@modules/lyric/providers/LyricProvider";
import { IQueueRepository } from "@modules/queue/repository/IQueueRepository";
import Joi from "joi";
import { inject, injectable } from "tsyringe";

interface Params {
	guildId: string;
}

type Response = Lyric;

@injectable()
export class GetNowPlayingLyricUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		guildId: Joi.string().required(),
	}).required();

	constructor(
		@inject("QueueRepository") private queueRepository: IQueueRepository,
		@inject(LyricProvider) private lyricProvider: ILyricProvider
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

		const target = queue.nowPlaying;
		if (!target) throw new Error("No song is playing");

		const lyric = await this.lyricProvider.getLyric(target.title);
		if (!lyric) throw new Error("Lyric not found");

		return lyric;
	}
}
