import { AddTrackAdapter, AddTrackUseCase } from "@modules/queue/useCases/AddTrackUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core/Controller";

type Body = {
	videoId: string;
	keyword: string;
};

type Params = {
	id: string;
};

@injectable()
export class AddQueueTrackController extends Controller<Body, Params> {
	constructor(@inject(AddTrackUseCase) private addTrack: AddTrackUseCase) {
		super();
	}

	async run({ body }: IRequest<Body, Params>): Promise<unknown> {
		const adapter = new AddTrackAdapter({ id: body.videoId, keyword: body.keyword });
		const track = await this.addTrack.execute(adapter, { userId: this.user.id });

		if (!track) return this.status(ResponseStatus.BAD_REQUEST);
		this.status(ResponseStatus.OK).send(track);
	}
}
