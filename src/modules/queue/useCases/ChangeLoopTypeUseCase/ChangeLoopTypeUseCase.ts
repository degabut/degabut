import { UseCase } from "@core";
import Joi from "joi";
import { inject, injectable } from "tsyringe";
import { LoopType, QueueManager } from "../..";

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

	constructor(@inject(QueueManager) private queueManager: QueueManager) {
		super();
	}

	public async run(params: Params): Promise<Response> {
		const { loopType, guildId } = params;

		const queue = this.queueManager.get(guildId);
		if (!queue) throw new Error("Queue not found");

		if (!loopType) queue.loopType = LoopType.Disabled;
		else if (queue.loopType === LoopType.Disabled) queue.loopType = loopType;
		else if (queue.loopType === loopType) queue.loopType = LoopType.Disabled;
		else queue.loopType = loopType;

		return queue.loopType;
	}
}
