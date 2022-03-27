import { GetUserQueueUseCase } from "@modules/queue";
import { inject, injectable } from "tsyringe";
import { Controller, ResponseStatus } from "../../core";

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
		const queue = await this.getUserQueue.execute({
			userId: this.user.id,
		});

		if (!queue) return this.status(ResponseStatus.NOT_FOUND).send();
		// this.status(ResponseStatus.OK).send(await toBaseQueueSchema(queue));
	}
}
