import { IUseCaseContext, UseCase } from "@core";
import { Track } from "@modules/queue/entities/Track";
import { IQueueRepository } from "@modules/queue/repositories/IQueueRepository";
import { inject, injectable } from "tsyringe";
import { GetNowPlayingParams } from "./GetNowPlayingAdapter";

type Response = Track | null;

@injectable()
export class GetNowPlayingUseCase extends UseCase<GetNowPlayingParams, Response> {
	constructor(@inject("QueueRepository") private queueRepository: IQueueRepository) {
		super();
	}

	public async run(params: GetNowPlayingParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		return queue.nowPlaying;
	}
}
