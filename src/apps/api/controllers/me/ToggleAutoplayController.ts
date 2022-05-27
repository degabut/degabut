import {
	ToggleAutoplayAdapter,
	ToggleAutoplayUseCase,
} from "@modules/queue/useCases/ToggleAutoplayUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, ResponseStatus } from "../../core/Controller";

@injectable()
export class ToggleAutoplayController extends Controller {
	constructor(@inject(ToggleAutoplayUseCase) private toggleAutoplay: ToggleAutoplayUseCase) {
		super();
	}

	async run(): Promise<void> {
		const adapter = new ToggleAutoplayAdapter({});
		const autoplay = await this.toggleAutoplay.execute(adapter, { userId: this.user.id });
		this.status(ResponseStatus.OK).send({ autoplay });
	}
}
