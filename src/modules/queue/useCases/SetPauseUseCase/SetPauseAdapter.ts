import { UseCaseAdapter } from "@core";
import Joi from "joi";

export interface SetPauseParams {
	guildId?: string;
	isPaused: boolean;
}

export class SetPauseAdapter extends UseCaseAdapter<SetPauseParams> {
	constructor(params: Partial<SetPauseParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<SetPauseParams>({
		guildId: Joi.string(),
		isPaused: Joi.boolean().required(),
	}).required();
}
