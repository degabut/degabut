import { IUseCaseContext, UseCase } from "@core";
import { LoopType } from "@modules/queue/domain/Queue";
import { IQueueRepository } from "@modules/queue/repository/IQueueRepository";
import Joi from "joi";
import { inject, injectable } from "tsyringe";

type Params = {
	guildId: string;
	loopType?: LoopType;
};

type Response = LoopType;

@injectable()
export class ChangeLoopTypeUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		guildId: Joi.string().required(),
		loopType: Joi.string().valid(...Object.values(LoopType)),
	}).required();

	constructor(@inject("QueueRepository") private queueRepository: IQueueRepository) {
		super();
	}

	public async run(params: Params, { userId }: IUseCaseContext): Promise<Response> {
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
