import {
	GetLastPlayedAdapter,
	GetLastPlayedUseCase,
} from "@modules/user/useCases/GetLastPlayedUseCase";
import {
	GetMostPlayedAdapter,
	GetMostPlayedUseCase,
} from "@modules/user/useCases/GetMostPlayedUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core/Controller";

type Query =
	| {
			last: string;
	  }
	| {
			days: string;
			count: string;
	  };

@injectable()
export class GetVideoHistoryController extends Controller {
	constructor(
		@inject(GetLastPlayedUseCase) private getLastPlayed: GetLastPlayedUseCase,
		@inject(GetMostPlayedUseCase) private getMostPlayed: GetMostPlayedUseCase
	) {
		super();
	}

	async run({ query }: IRequest<unknown, unknown, Query>): Promise<void> {
		if ("last" in query) {
			const adapter = new GetLastPlayedAdapter({
				count: +query.last,
			});
			const videos = await this.getLastPlayed.execute(adapter, { userId: this.user.id });
			this.status(ResponseStatus.OK).send(videos);
		} else {
			const adapter = new GetMostPlayedAdapter({
				count: +query.count,
				days: +query.days,
			});
			const videos = await this.getMostPlayed.execute(adapter, { userId: this.user.id });
			this.status(ResponseStatus.OK).send(videos);
		}
	}
}
