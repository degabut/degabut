import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type GetLastPlayedParams = {
	userId: string;
	count: number;
};

export class GetLastPlayedAdapter extends UseCaseAdapter<GetLastPlayedParams> {
	constructor(params: Partial<GetLastPlayedParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetLastPlayedParams>({
		userId: Joi.string().required(),
		count: Joi.number().min(1).max(100).default(10),
	}).required();
}
