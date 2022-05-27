import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type ToggleAutoplayParams = {
	guildId?: string;
};

export class ToggleAutoplayAdapter extends UseCaseAdapter<ToggleAutoplayParams> {
	constructor(params: Partial<ToggleAutoplayParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<ToggleAutoplayParams>({
		guildId: Joi.string().optional(),
	}).required();
}
