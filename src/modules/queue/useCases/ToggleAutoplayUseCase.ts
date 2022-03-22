import Joi from "joi";
import { inject, injectable } from "tsyringe";
import { UseCase } from "../../../core";
import { QueueManager } from "../managers";

type Params = {
	guildId: string;
};

type Response = boolean;

@injectable()
export class ToggleAutoplayUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		guildId: Joi.string().required(),
	}).required();

	constructor(@inject(QueueManager) private queueManager: QueueManager) {
		super();
	}

	public async run(params: Params): Promise<Response> {
		const { guildId } = params;

		const queue = this.queueManager.get(guildId);
		if (!queue) throw new Error("Queue not found");

		return queue.toggleAutoplay();
	}
}
