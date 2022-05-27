import { LoopType } from "@modules/queue/entities/Queue";
import {
	ChangeLoopTypeAdapter,
	ChangeLoopTypeUseCase,
} from "@modules/queue/useCases/ChangeLoopTypeUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core/Controller";

type Body = {
	loopType: LoopType;
};

@injectable()
export class ChangeLoopTypeController extends Controller<Body> {
	constructor(@inject(ChangeLoopTypeUseCase) private changeLoopType: ChangeLoopTypeUseCase) {
		super();
	}

	async run({ body }: IRequest<Body>): Promise<void> {
		const adapter = new ChangeLoopTypeAdapter({ loopType: body.loopType });
		const autoplay = await this.changeLoopType.execute(adapter, { userId: this.user.id });
		this.status(ResponseStatus.OK).send({ autoplay });
	}
}
