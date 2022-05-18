import { IUseCaseContext, UseCase } from "@core";
import { OnSkipEvent } from "@modules/queue/events/OnSkipEvent";
import { IQueueRepository } from "@modules/queue/repository/IQueueRepository";
import { inject, injectable } from "tsyringe";
import { SkipTrackParams } from "./SkipTrackAdapter";

type Response = void;

@injectable()
export class SkipTrackUseCase extends UseCase<SkipTrackParams, Response> {
	constructor(@inject("QueueRepository") private queueRepository: IQueueRepository) {
		super();
	}

	public async run(params: SkipTrackParams, { userId }: IUseCaseContext): Promise<Response> {
		const { guildId } = params;

		const queue = this.queueRepository.get(guildId);
		if (!queue) throw new Error("Queue not found");
		if (!queue.voiceChannel.members.find((m) => m.id === userId)) {
			throw new Error("User not in voice channel");
		}

		const track = queue.skip();
		if (track) this.emit(OnSkipEvent, { queue, track });
	}
}
