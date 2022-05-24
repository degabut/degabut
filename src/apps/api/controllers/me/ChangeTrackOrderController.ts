import {
	ChangeTrackOrderAdapter,
	ChangeTrackOrderUseCase,
} from "@modules/queue/useCases/ChangeTrackOrderUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core/Controller";

type Body = {
	from: number;
	to: number;
};

@injectable()
export class ChangeTrackOrderController extends Controller<Body> {
	constructor(@inject(ChangeTrackOrderUseCase) private changeTrackOrder: ChangeTrackOrderUseCase) {
		super();
	}

	async run({ body }: IRequest<Body>): Promise<void> {
		const { from, to } = body;
		const adapter = new ChangeTrackOrderAdapter({ from, to });
		await this.changeTrackOrder.execute(adapter, { userId: this.user.id });
		this.status(ResponseStatus.NO_CONTENT);
	}
}
