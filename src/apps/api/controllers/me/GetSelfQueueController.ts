import {
	GetUserQueueAdapter,
	GetUserQueueUseCase,
} from "@modules/queue/useCases/GetUserQueueUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, ResponseStatus } from "../../core/Controller";

type Body = {
	id: string;
};

type Params = {
	id: string;
};

@injectable()
export class GetSelfQueueController extends Controller<Body, Params> {
	constructor(@inject(GetUserQueueUseCase) private getUserQueue: GetUserQueueUseCase) {
		super();
	}

	async run(): Promise<unknown> {
		const adapter = new GetUserQueueAdapter({ userId: this.user.id });
		const queue = await this.getUserQueue.execute(adapter);

		if (!queue) return this.status(ResponseStatus.NOT_FOUND).send();
		this.status(ResponseStatus.OK).send(queue);
	}
}
