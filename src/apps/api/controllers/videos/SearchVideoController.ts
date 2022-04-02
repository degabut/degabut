import {
	SearchVideoAdapter,
	SearchVideoUseCase,
} from "@modules/youtube/useCases/SearchVideoUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core/Controller";

type Query = {
	keyword: string;
};

@injectable()
export class SearchVideoController extends Controller<unknown, unknown, Query> {
	constructor(@inject(SearchVideoUseCase) private searchVideo: SearchVideoUseCase) {
		super();
	}

	async run({ query }: IRequest<unknown, unknown, Query>): Promise<void> {
		const adapter = new SearchVideoAdapter({ keyword: query.keyword });
		const videos = await this.searchVideo.execute(adapter);

		this.status(ResponseStatus.OK).send(videos);
	}
}
