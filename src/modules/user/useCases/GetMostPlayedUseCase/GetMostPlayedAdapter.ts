import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type GetMostPlayedParams = {
	days: number;
	count: number;
};

export class GetMostPlayedAdapter extends UseCaseAdapter<GetMostPlayedParams> {
	constructor(params: Partial<GetMostPlayedParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetMostPlayedParams>({
		days: Joi.number().min(1).max(30).default(30),
		count: Joi.number().min(1).max(100).default(10),
	}).required();
}
