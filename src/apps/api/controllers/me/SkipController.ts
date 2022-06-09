import { SkipAdapter, SkipUseCase } from "@modules/queue/useCases/SkipUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, ResponseStatus } from "../../core/Controller";

@injectable()
export class SkipController extends Controller {
	constructor(@inject(SkipUseCase) private skip: SkipUseCase) {
		super();
	}

	async run(): Promise<void> {
		const adapter = new SkipAdapter({});
		await this.skip.execute(adapter, { userId: this.user.id });
		this.status(ResponseStatus.NO_CONTENT);
	}
}
