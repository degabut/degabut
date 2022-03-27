import { IUseCaseContext, UseCase } from "@core";
import { IQueueRepository, Track } from "@modules/queue";
import Joi from "joi";
import { inject, injectable } from "tsyringe";

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

	constructor(@inject("QueueRepository") private queueRepository: IQueueRepository) {
		super();
	}

	public async run(params: Params, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId, page, perPage } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		const start = (page - 1) * perPage;
		const end = start + perPage;

		const tracks = queue.tracks.slice(start, end);
		return {
			tracks,
			totalLength: queue.tracks.length,
		};
	}
}
