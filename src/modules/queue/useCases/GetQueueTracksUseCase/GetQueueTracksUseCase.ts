import { IUseCaseContext, UseCase } from "@core";
import { Track } from "@modules/queue/domain/Track";
import { IQueueRepository } from "@modules/queue/repository/IQueueRepository";
import { inject, injectable } from "tsyringe";
import { GetQueueTracksParams } from "./GetQueueTracksAdapter";

type Response = {
	tracks: Track[];
	totalLength: number;
};

@injectable()
export class GetQueueTracksUseCase extends UseCase<GetQueueTracksParams, Response> {
	constructor(@inject("QueueRepository") private queueRepository: IQueueRepository) {
		super();
	}

	public async run(params: GetQueueTracksParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId, page, perPage } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		const start = (page - 1) * perPage;
		const end = start + perPage;

		const tracks = queue.tracks.slice(start, end);
		return {
			tracks,
			totalLength: queue.tracks.length,
		};
	}
}
