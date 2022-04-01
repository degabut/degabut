import { IUseCaseContext, UseCase } from "@core";
import { IQueueRepository } from "@modules/queue/repository/IQueueRepository";
import { inject, injectable } from "tsyringe";
import { ToggleAutoPlayParams } from "./ToggleAutoPlayAdapter";

type Response = boolean;

@injectable()
export class ToggleAutoplayUseCase extends UseCase<ToggleAutoPlayParams, Response> {
	constructor(@inject("QueueRepository") private queueRepository: IQueueRepository) {
		super();
	}

	public async run(params: ToggleAutoPlayParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		return queue.toggleAutoplay();
	}
}
