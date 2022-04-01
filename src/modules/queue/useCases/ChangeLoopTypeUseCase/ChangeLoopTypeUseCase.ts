import { IUseCaseContext, UseCase } from "@core";
import { LoopType } from "@modules/queue/domain/Queue";
import { IQueueRepository } from "@modules/queue/repository/IQueueRepository";
import { inject, injectable } from "tsyringe";
import { ChangeLoopTypeParams } from "./ChangeLoopTypeAdapter";

type Response = LoopType;

@injectable()
export class ChangeLoopTypeUseCase extends UseCase<ChangeLoopTypeParams, Response> {
	constructor(@inject("QueueRepository") private queueRepository: IQueueRepository) {
		super();
	}

	public async run(params: ChangeLoopTypeParams, { userId }: IUseCaseContext): Promise<Response> {
		const { loopType, guildId } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		if (!loopType) queue.loopType = LoopType.Disabled;
		else if (queue.loopType === LoopType.Disabled) queue.loopType = loopType;
		else if (queue.loopType === loopType) queue.loopType = LoopType.Disabled;
		else queue.loopType = loopType;

		return queue.loopType;
	}
}
