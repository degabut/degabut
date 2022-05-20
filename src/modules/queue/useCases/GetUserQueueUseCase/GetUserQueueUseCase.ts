import { UseCase } from "@core";
import { QueueDto } from "@modules/queue/dto/QueueDto";
import { IQueueRepository } from "@modules/queue/repositories/IQueueRepository";
import { inject, injectable } from "tsyringe";
import { GetUserQueueParams } from "./GetUserQueueAdapter";

type Response = QueueDto | undefined;

@injectable()
export class GetUserQueueUseCase extends UseCase<GetUserQueueParams, Response> {
	constructor(@inject("QueueRepository") private queueRepository: IQueueRepository) {
		super();
	}

	public async run(params: GetUserQueueParams): Promise<Response> {
		const { userId } = params;

		const queue = this.queueRepository.getByUserId(userId);

		return queue ? QueueDto.create(queue) : undefined;
	}
}
