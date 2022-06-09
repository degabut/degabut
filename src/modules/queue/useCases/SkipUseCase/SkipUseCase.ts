import { ForbiddenError, IUseCaseContext, NotFoundError, UseCase } from "@core";
import { Track } from "@modules/queue/entities/Track";
import { OnSkipEvent } from "@modules/queue/events/OnSkipEvent";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { QueueService } from "@modules/queue/services/QueueService";
import { inject, injectable } from "tsyringe";
import { SkipParams } from "./SkipAdapter";

type Response = Track | null;

@injectable()
export class SkipUseCase extends UseCase<SkipParams, Response> {
	constructor(
		@inject(QueueRepository)
		private queueRepository: QueueRepository,

		@inject(QueueService)
		private queueService: QueueService
	) {
		super();
	}

	public async run(params: SkipParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId } = params;

		const queue = guildId
			? this.queueRepository.get(guildId)
			: this.queueRepository.getByUserId(userId);
		if (!queue) throw new NotFoundError("Queue not found");
		if (!queue.hasMember(userId)) throw new ForbiddenError("User not in voice channel");

		const skipped = this.queueService.skipTrack(queue);

		if (skipped) {
			this.emit(OnSkipEvent, {
				queue,
				track: skipped,
				skippedBy: userId,
			});
		}

		return skipped;
	}
}
