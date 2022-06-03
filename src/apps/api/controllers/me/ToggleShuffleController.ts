import {
	ToggleShuffleAdapter,
	ToggleShuffleUseCase,
} from "@modules/queue/useCases/ToggleShuffleUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, ResponseStatus } from "../../core/Controller";

@injectable()
export class ToggleShuffleController extends Controller {
	constructor(@inject(ToggleShuffleUseCase) private toggleShuffle: ToggleShuffleUseCase) {
		super();
	}

	async run(): Promise<void> {
		const adapter = new ToggleShuffleAdapter({});
		const shuffle = await this.toggleShuffle.execute(adapter, { userId: this.user.id });
		this.status(ResponseStatus.OK).send({ shuffle });
	}
}
