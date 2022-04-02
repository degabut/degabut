import {
	GetUserQueueAdapter,
	GetUserQueueUseCase,
} from "@modules/queue/useCases/GetUserQueueUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, ResponseStatus } from "../../core/Controller";

@injectable()
export class GetQueueController extends Controller {
	constructor(@inject(GetUserQueueUseCase) private getUserQueue: GetUserQueueUseCase) {
		super();
	}

	async run(): Promise<unknown> {
		const adapter = new GetUserQueueAdapter({ userId: this.user.id });
		const queue = await this.getUserQueue.execute(adapter);

		if (!queue) return this.status(ResponseStatus.NOT_FOUND);
		this.status(ResponseStatus.OK).send(queue);
	}
}
