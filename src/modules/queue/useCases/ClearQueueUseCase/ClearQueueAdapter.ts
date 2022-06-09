import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type ClearQueueParams = {
	removeNowPlaying?: boolean;
	guildId?: string;
};

export class ClearQueueAdapter extends UseCaseAdapter<ClearQueueParams> {
	constructor(params: Partial<ClearQueueParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<ClearQueueParams>({
		guildId: Joi.string(),
		removeNowPlaying: Joi.boolean(),
	}).required();
}
