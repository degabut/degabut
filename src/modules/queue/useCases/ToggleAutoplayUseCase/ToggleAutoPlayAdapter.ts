import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type ToggleAutoPlayParams = {
	guildId: string;
};

export class ToggleAutoPlayAdapter extends UseCaseAdapter<ToggleAutoPlayParams> {
	constructor(params: Partial<ToggleAutoPlayParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<ToggleAutoPlayParams>({
		guildId: Joi.string().required(),
	}).required();
}
