import { UseCase } from "@core";
import { IQueueRepository, Track } from "@modules/queue";
import Joi from "joi";
import { inject, injectable } from "tsyringe";

interface Params {
	guildId: string;
	index?: number;
}

type Response = Track | null;

@injectable()
export class RemoveTrackUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		guildId: Joi.string().required(),
		index: Joi.number().min(0).failover(0),
	}).required();

	constructor(@inject("QueueRepository") private queueRepository: IQueueRepository) {
		super();
	}

	public async run(params: Params): Promise<Response> {
		const { guildId, index } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new Error("Queue not found");

		const removed = queue.remove(index || queue.tracks.length - 1);

		return removed;
	}
}
