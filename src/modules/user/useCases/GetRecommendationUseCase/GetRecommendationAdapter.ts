import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type GetRecommendationParams = {
	count: number;
};

export class GetRecommendationAdapter extends UseCaseAdapter<GetRecommendationParams> {
	constructor(params: Partial<GetRecommendationParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetRecommendationParams>({
		count: Joi.number().max(100).min(1).default(10),
	}).required();
}
