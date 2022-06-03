import { ForbiddenError, IUseCaseContext, NotFoundError, UseCase } from "@core";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { QueueService } from "@modules/queue/services/QueueService";
import { inject, injectable } from "tsyringe";
import { ChangeTrackOrderParams } from "./ChangeTrackOrderAdapter";

type Response = void;

@injectable()
export class ChangeTrackOrderUseCase extends UseCase<ChangeTrackOrderParams, Response> {
	constructor(
		@inject(QueueRepository)
		private queueRepository: QueueRepository,

		@inject(QueueService)
		private queueService: QueueService
	) {
		super();
	}

	public async run(params: ChangeTrackOrderParams, { userId }: IUseCaseContext): Promise<void> {
		const { trackId, from, to, guildId } = params;

		const queue = guildId
			? this.queueRepository.get(guildId)
			: this.queueRepository.getByUserId(userId);
		if (!queue) throw new NotFoundError("Queue not found");
		if (!queue.hasMember(userId)) throw new ForbiddenError("User not in voice channel");

		this.queueService.changeQueueTrackOrder(queue, trackId || from, to);
	}
}
