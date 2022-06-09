import { PlayTrackAdapter, PlayTrackUseCase } from "@modules/queue/useCases/PlayTrackUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core/Controller";

type Params = {
	id: string;
};

@injectable()
export class PlayTrackController extends Controller<unknown, Params> {
	constructor(@inject(PlayTrackUseCase) private removeTrack: PlayTrackUseCase) {
		super();
	}

	async run({ params }: IRequest<unknown, Params>): Promise<void> {
		const { id } = params;

		const adapter = new PlayTrackAdapter({ trackId: id });
		await this.removeTrack.execute(adapter, { userId: this.user.id });
		this.status(ResponseStatus.NO_CONTENT);
	}
}
