import { IUseCaseContext, UseCase } from "@core";
import { IQueueRepository } from "@modules/queue/repository/IQueueRepository";
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

	public async run(params: Params, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		return queue.toggleAutoplay();
	}
}
