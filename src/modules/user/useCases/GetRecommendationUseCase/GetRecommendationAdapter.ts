import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type GetRecommendationParams = {
	lastPlayedCount: number;
	mostPlayedCount: number;
};

export class GetRecommendationAdapter extends UseCaseAdapter<GetRecommendationParams> {
	constructor(params: Partial<GetRecommendationParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetRecommendationParams>({
		lastPlayedCount: Joi.number().max(100).min(1).default(10),
		mostPlayedCount: Joi.number().max(100).min(1).default(10),
	}).required();
}
