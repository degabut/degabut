import { SetPauseAdapter, SetPauseUseCase } from "@modules/queue/useCases/SetPauseUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, ResponseStatus } from "../../core/Controller";

@injectable()
export class UnpauseQueueController extends Controller {
	constructor(@inject(SetPauseUseCase) private setPause: SetPauseUseCase) {
		super();
	}

	async run(): Promise<void> {
		const adapter = new SetPauseAdapter({ isPaused: false });
		const isPaused = await this.setPause.execute(adapter, { userId: this.user.id });
		this.status(ResponseStatus.OK).send({ isPaused });
	}
}
