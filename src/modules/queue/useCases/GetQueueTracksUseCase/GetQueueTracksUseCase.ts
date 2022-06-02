import { ForbiddenError, IUseCaseContext, NotFoundError, UseCase } from "@core";
import { Track } from "@modules/queue/entities/Track";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { inject, injectable } from "tsyringe";
import { GetQueueTracksParams } from "./GetQueueTracksAdapter";

type Response = {
	tracks: Track[];
	totalLength: number;
};

@injectable()
export class GetQueueTracksUseCase extends UseCase<GetQueueTracksParams, Response> {
	constructor(@inject(QueueRepository) private queueRepository: QueueRepository) {
		super();
	}

	public async run(params: GetQueueTracksParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId, page, perPage } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new NotFoundError("Queue not found");
		if (!queue.hasMember(userId)) throw new ForbiddenError("User not in voice channel");

		const start = (page - 1) * perPage;
		const end = start + perPage;

		const tracks = queue.tracks.slice(start, end);
		return {
			tracks,
			totalLength: queue.tracks.length,
		};
	}
}
