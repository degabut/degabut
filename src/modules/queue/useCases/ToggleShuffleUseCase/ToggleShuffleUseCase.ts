import { ForbiddenError, IUseCaseContext, NotFoundError, UseCase } from "@core";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { QueueService } from "@modules/queue/services/QueueService";
import { inject, injectable } from "tsyringe";
import { ToggleShuffleParams } from "./ToggleShuffleAdapter";

type Response = boolean;

@injectable()
export class ToggleShuffleUseCase extends UseCase<ToggleShuffleParams, Response> {
	constructor(
		@inject(QueueRepository)
		private queueRepository: QueueRepository,

		@inject(QueueService)
		private queueService: QueueService
	) {
		super();
	}

	public async run(params: ToggleShuffleParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId } = params;

		const queue = guildId
			? this.queueRepository.get(guildId)
			: this.queueRepository.getByUserId(userId);
		if (!queue) throw new NotFoundError("Queue not found");
		if (!queue.hasMember(userId)) throw new ForbiddenError("User not in voice channel");

		queue.shuffle = !queue.shuffle;

		return queue.shuffle;
	}
}
