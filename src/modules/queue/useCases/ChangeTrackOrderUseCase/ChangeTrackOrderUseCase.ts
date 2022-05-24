import { IUseCaseContext, UseCase } from "@core";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { inject, injectable } from "tsyringe";
import { ChangeTrackOrderParams } from "./ChangeTrackOrderAdapter";

type Response = void;

@injectable()
export class ChangeTrackOrderUseCase extends UseCase<ChangeTrackOrderParams, Response> {
	constructor(@inject(QueueRepository) private queueRepository: QueueRepository) {
		super();
	}

	public async run(params: ChangeTrackOrderParams, { userId }: IUseCaseContext): Promise<void> {
		const { from, to, guildId } = params;

		const queue = guildId
			? this.queueRepository.get(guildId)
			: this.queueRepository.getByUserId(userId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		queue.changeTrackOrder(from, to);
	}
}
