import { UseCase } from "@core";
import { ILyricProvider, Lyric, LyricProvider } from "@modules/lyric";
import Joi from "joi";
import { inject, injectable } from "tsyringe";
import { QueueManager } from "../..";

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
		@inject(QueueManager) private queueManager: QueueManager,
		@inject(LyricProvider) private lyricProvider: ILyricProvider
	) {
		super();
	}

	public async run(params: Params): Promise<Response> {
		const { guildId } = params;

		const queue = this.queueManager.get(guildId);
		if (!queue) throw new Error("Queue not found");

		const target = queue.nowPlaying;
		if (!target) throw new Error("No song is playing");

		const lyric = await this.lyricProvider.getLyric(target.title);
		if (!lyric) throw new Error("Lyric not found");

		return lyric;
	}
}
