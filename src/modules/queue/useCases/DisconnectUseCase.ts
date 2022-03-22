import Joi from "joi";
import { inject, injectable } from "tsyringe";
import { UseCase } from "../../../core";
import { QueueManager } from "../managers/QueueManager";

interface Params {
	guildId: string;
}

type Response = void;

@injectable()
export class DisconnectUseCase extends UseCase<Params, Response> {
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

		queue.stop();
		this.queueManager.delete(guildId);
	}
}
