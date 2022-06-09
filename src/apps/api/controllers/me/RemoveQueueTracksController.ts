import { ClearQueueAdapter, ClearQueueUseCase } from "@modules/queue/useCases/ClearQueueUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core/Controller";

type Query = {
	excludeNowPlaying: string;
};

@injectable()
export class RemoveQueueTracksController extends Controller<unknown, unknown, Query> {
	constructor(@inject(ClearQueueUseCase) private clearQueue: ClearQueueUseCase) {
		super();
	}

	async run({ query }: IRequest<unknown, unknown, Query>): Promise<void> {
		const { excludeNowPlaying } = query;

		const adapter = new ClearQueueAdapter({ removeNowPlaying: excludeNowPlaying !== "true" });
		await this.clearQueue.execute(adapter);

		this.status(ResponseStatus.NO_CONTENT);
	}
}
