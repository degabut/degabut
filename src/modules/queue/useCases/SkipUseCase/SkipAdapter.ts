import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type SkipParams = {
	guildId?: string;
};

export class SkipAdapter extends UseCaseAdapter<SkipParams> {
	constructor(params: Partial<SkipParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<SkipParams>({
		guildId: Joi.string(),
	}).required();
}
