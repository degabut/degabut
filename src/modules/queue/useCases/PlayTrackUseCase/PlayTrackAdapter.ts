import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type PlayTrackParams = {
	guildId?: string;
	index: number;
	trackId: string;
};

export class PlayTrackAdapter extends UseCaseAdapter<PlayTrackParams> {
	constructor(params: Partial<PlayTrackParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<PlayTrackParams>({
		guildId: Joi.string(),
		index: Joi.number().min(0).failover(0).allow(0),
		trackId: Joi.string(),
	})
		.required()
		.xor("trackId", "index");
}
