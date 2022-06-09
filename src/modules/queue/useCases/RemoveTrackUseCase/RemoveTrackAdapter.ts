import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type RemoveTrackParams = {
	guildId?: string;
	index: number;
	trackId: string;
	isNowPlaying: boolean;
};

export class RemoveTrackAdapter extends UseCaseAdapter<RemoveTrackParams> {
	constructor(params: Partial<RemoveTrackParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<RemoveTrackParams>({
		guildId: Joi.string(),
		index: Joi.number().min(0).failover(0).allow(0),
		trackId: Joi.string(),
		isNowPlaying: Joi.boolean(),
	})
		.required()
		.xor("trackId", "index", "nowPlaying");
}
