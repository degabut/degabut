import { UseCase } from "@core";
import { IQueueRepository } from "@modules/queue";
import Joi from "joi";
import { inject, injectable } from "tsyringe";

interface Params {
	guildId: string;
}

type Response = void;

@injectable()
export class DisconnectUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		guildId: Joi.string().required(),
	}).required();

	constructor(@inject("QueueRepository") private queueRepository: IQueueRepository) {
		super();
	}

	public async run(params: Params): Promise<Response> {
		const { guildId } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new Error("Queue not found");

		queue.stop();
		this.queueRepository.delete(guildId);
	}
}
