import { IUseCaseContext, UseCase } from "@core";
import { Track } from "@modules/queue/domain/Track";
import { IQueueRepository } from "@modules/queue/repository/IQueueRepository";
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

	public async run(params: Params, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId, index } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		const removed = queue.remove(index || queue.tracks.length - 1);

		return removed;
	}
}
