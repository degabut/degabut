import {
	ChangeTrackOrderAdapter,
	ChangeTrackOrderUseCase,
} from "@modules/queue/useCases/ChangeTrackOrderUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core/Controller";

type Body = {
	to: number;
};

type Params = {
	id: string;
};

@injectable()
export class ChangeTrackOrderController extends Controller<Body, Params> {
	constructor(@inject(ChangeTrackOrderUseCase) private changeTrackOrder: ChangeTrackOrderUseCase) {
		super();
	}

	async run({ body, params }: IRequest<Body, Params>): Promise<void> {
		const { to } = body;
		const { id } = params;

		const adapter = new ChangeTrackOrderAdapter({ trackId: id, to });
		await this.changeTrackOrder.execute(adapter, { userId: this.user.id });
		this.status(ResponseStatus.NO_CONTENT);
	}
}
