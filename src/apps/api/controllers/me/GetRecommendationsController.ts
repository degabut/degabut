import {
	GetRecommendationAdapter,
	GetRecommendationUseCase,
} from "@modules/user/useCases/GetRecommendationUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core/Controller";

type Query = {
	count?: number;
};

@injectable()
export class GetRecommendationsController extends Controller {
	constructor(
		@inject(GetRecommendationUseCase) private getRecommendation: GetRecommendationUseCase
	) {
		super();
	}

	async run({ query }: IRequest<unknown, unknown, Query>): Promise<void> {
		const adapter = new GetRecommendationAdapter({ count: query.count });
		const recommendations = await this.getRecommendation.execute(adapter, { userId: this.user.id });
		this.status(ResponseStatus.OK).send(recommendations);
	}
}
