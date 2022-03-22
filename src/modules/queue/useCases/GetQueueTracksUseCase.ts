import Joi from "joi";
import { inject, injectable } from "tsyringe";
import { UseCase } from "../../../core";
import { Track } from "../domain";
import { QueueManager } from "../managers/QueueManager";

interface Params {
	guildId: string;
	page: number;
	perPage: number;
}

type Response = {
	tracks: Track[];
	totalLength: number;
};

@injectable()
export class GetQueueTracksUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		guildId: Joi.string().required(),
		page: Joi.number().min(1).required().failover(1),
		perPage: Joi.number().min(100).required().failover(10),
	}).required();

	constructor(@inject(QueueManager) private queueManager: QueueManager) {
		super();
	}

	public async run(params: Params): Promise<Response> {
		const { guildId, page, perPage } = params;

		const queue = this.queueManager.get(guildId);
		if (!queue) throw new Error("Queue not found");

		const start = (page - 1) * perPage;
		const end = start + perPage;

		const tracks = queue.tracks.slice(start, end);
		return {
			tracks,
			totalLength: queue.tracks.length,
		};
	}
}
