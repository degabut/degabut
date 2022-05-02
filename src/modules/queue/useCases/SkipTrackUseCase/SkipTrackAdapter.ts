import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type SkipTrackParams = {
	guildId: string;
};

export class SkipTrackAdapter extends UseCaseAdapter<SkipTrackParams> {
	constructor(params: Partial<SkipTrackParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<SkipTrackParams>({
		guildId: Joi.string().required(),
	}).required();
}
