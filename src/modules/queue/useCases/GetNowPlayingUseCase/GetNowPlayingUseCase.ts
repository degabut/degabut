import { UseCase } from "@core";
import { IQueueRepository, Track } from "@modules/queue";
import Joi from "joi";
import { inject, injectable } from "tsyringe";

interface Params {
	guildId: string;
}

type Response = Track | null;

@injectable()
export class GetNowPlayingUseCase extends UseCase<Params, Response> {
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

		return queue.nowPlaying;
	}
}
