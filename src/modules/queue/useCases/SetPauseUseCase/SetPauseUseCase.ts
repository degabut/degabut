import { ForbiddenError, IUseCaseContext, NotFoundError, UseCase } from "@core";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { inject, injectable } from "tsyringe";
import { SetPauseParams } from "./SetPauseAdapter";

type Response = boolean;

@injectable()
export class SetPauseUseCase extends UseCase<SetPauseParams, Response> {
	constructor(@inject(QueueRepository) private queueRepository: QueueRepository) {
		super();
	}

	public async run(params: SetPauseParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId, isPaused } = params;

		const queue = guildId
			? this.queueRepository.get(guildId)
			: this.queueRepository.getByUserId(userId);
		if (!queue) throw new NotFoundError("Queue not found");
		if (!queue.hasMember(userId)) throw new ForbiddenError("User not in voice channel");

		if (isPaused) {
			queue.audioPlayer.pause();
			queue.isPaused = true;
		} else {
			queue.audioPlayer.unpause();
			queue.isPaused = false;
		}

		return queue.isPaused;
	}
}
