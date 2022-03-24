import { injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core";

type Body = {
	id: string;
};

type Params = {
	id: string;
};

@injectable()
export class GetSelfQueueController extends Controller<Body, Params> {
	constructor() {
		super();
	}

	async run({ body, params }: IRequest<Body, Params>): Promise<void> {
		// TODO: Implement
		this.status(ResponseStatus.OK).send({ value: "Hello World" });
	}
}
