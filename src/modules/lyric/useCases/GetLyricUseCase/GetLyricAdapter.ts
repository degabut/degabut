import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type GetLyricParams = {
	keyword: string;
};

export class GetLyricAdapter extends UseCaseAdapter<GetLyricParams> {
	constructor(params: Partial<GetLyricParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetLyricParams>({
		keyword: Joi.string().required(),
	}).required();
}
