import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type ToggleShuffleParams = {
	guildId?: string;
};

export class ToggleShuffleAdapter extends UseCaseAdapter<ToggleShuffleParams> {
	constructor(params: Partial<ToggleShuffleParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<ToggleShuffleParams>({
		guildId: Joi.string().optional(),
	}).required();
}
