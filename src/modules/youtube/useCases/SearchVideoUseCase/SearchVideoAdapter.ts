import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type SearchVideoParams = {
	keyword: string;
};

export class SearchVideoAdapter extends UseCaseAdapter<SearchVideoParams> {
	constructor(params: Partial<SearchVideoParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<SearchVideoParams>({
		keyword: Joi.string().required(),
	}).required();
}
