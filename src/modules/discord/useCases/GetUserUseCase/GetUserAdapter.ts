import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type GetUserParams = {
	accessToken: string;
};

export class GetUserAdapter extends UseCaseAdapter<GetUserParams> {
	constructor(params: Partial<GetUserParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetUserParams>({
		accessToken: Joi.string().required(),
	}).required();
}
