import { UseCase } from "@core";
import Joi from "joi";
import { inject, injectable } from "tsyringe";
import { QueueManager, Track } from "../..";

interface Params {
	guildId: string;
	index?: number;
}

type Response = Track | null;

@injectable()
export class RemoveTrackUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		guildId: Joi.string().required(),
		index: Joi.string(),
	}).required();

	constructor(@inject(QueueManager) private queueManager: QueueManager) {
		super();
	}

	public async run(params: Params): Promise<Response> {
		const { guildId, index } = params;

		const queue = this.queueManager.get(guildId);
		if (!queue) throw new Error("Queue not found");

		const removed = queue.remove(index || queue.tracks.length - 1);

		return removed;
	}
}
