import { UseCase } from "@core";
import { IQueueRepository } from "@modules/queue";
import Joi from "joi";
import { inject, injectable } from "tsyringe";

type Params = {
	guildId: string;
};

type Response = boolean;

@injectable()
export class ToggleAutoplayUseCase extends UseCase<Params, Response> {
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

		return queue.toggleAutoplay();
	}
}
