import { ForbiddenError, IUseCaseContext, NotFoundError, UseCase } from "@core";
import { Track } from "@modules/queue/entities/Track";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { inject, injectable } from "tsyringe";
import { GetNowPlayingParams } from "./GetNowPlayingAdapter";

type Response = Track | null;

@injectable()
export class GetNowPlayingUseCase extends UseCase<GetNowPlayingParams, Response> {
	constructor(@inject(QueueRepository) private queueRepository: QueueRepository) {
		super();
	}

	public async run(params: GetNowPlayingParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new NotFoundError("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new ForbiddenError("User not in voice channel");
		}

		return queue.nowPlaying;
	}
}
