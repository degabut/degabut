import { RemoveTrackAdapter, RemoveTrackUseCase } from "@modules/queue/useCases/RemoveTrackUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core/Controller";

type Params = {
	id: string;
};

@injectable()
export class RemoveTrackController extends Controller<unknown, Params> {
	constructor(@inject(RemoveTrackUseCase) private removeTrack: RemoveTrackUseCase) {
		super();
	}

	async run({ params }: IRequest<unknown, Params>): Promise<void> {
		const { id } = params;

		const adapter = new RemoveTrackAdapter({ trackId: id });
		await this.removeTrack.execute(adapter, { userId: this.user.id });
		this.status(ResponseStatus.NO_CONTENT);
	}
}
