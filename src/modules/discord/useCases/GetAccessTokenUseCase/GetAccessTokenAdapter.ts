import { UseCaseAdapter } from "@core";
import Joi from "joi";

export interface GetAccessTokenParams {
	code: string;
}

export class GetAccessTokenAdapter extends UseCaseAdapter<GetAccessTokenParams> {
	constructor(params: Partial<GetAccessTokenParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetAccessTokenParams>({
		code: Joi.string().required(),
	}).required();
}
