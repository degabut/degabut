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

type Params = {
	id: string;
};

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

	async run({ query, params }: IRequest<unknown, Params, Query>): Promise<void> {
		const targetUserId = params.id === "me" ? this.user.id : params.id;

		if ("last" in query) {
			const adapter = new GetLastPlayedAdapter({
				count: +query.last,
				userId: targetUserId,
			});
			const videos = await this.getLastPlayed.execute(adapter, { userId: this.user.id });
			this.status(ResponseStatus.OK).send(videos);
		} else {
			const adapter = new GetMostPlayedAdapter({
				count: +query.count,
				days: +query.days,
				userId: targetUserId,
			});
			const videos = await this.getMostPlayed.execute(adapter, { userId: this.user.id });
			this.status(ResponseStatus.OK).send(videos);
		}
	}
}
