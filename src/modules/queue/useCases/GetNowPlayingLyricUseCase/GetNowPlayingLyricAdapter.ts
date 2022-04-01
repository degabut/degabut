import { UseCaseAdapter } from "core/UseCaseAdapter";
import Joi from "joi";

export type GetNowPlayingLyricParams = {
	guildId: string;
};

export class GetNowPlayingLyricAdapter extends UseCaseAdapter<GetNowPlayingLyricParams> {
	constructor(params: Partial<GetNowPlayingLyricParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetNowPlayingLyricParams>({
		guildId: Joi.string().required(),
	}).required();
}
