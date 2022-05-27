import { IUseCaseContext, UseCase } from "@core";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { inject, injectable } from "tsyringe";
import { ToggleAutoplayParams } from "./ToggleAutoplayAdapter";

type Response = boolean;

@injectable()
export class ToggleAutoplayUseCase extends UseCase<ToggleAutoplayParams, Response> {
	constructor(@inject(QueueRepository) private queueRepository: QueueRepository) {
		super();
	}

	public async run(params: ToggleAutoplayParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId } = params;

		const queue = guildId
			? this.queueRepository.get(guildId)
			: this.queueRepository.getByUserId(userId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		return queue.toggleAutoplay();
	}
}
