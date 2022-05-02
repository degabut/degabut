import { UseCaseAdapter } from "@core";
import Joi from "joi";

export type GetNowPlayingParams = {
	guildId: string;
};

export class GetNowPlayingAdapter extends UseCaseAdapter<GetNowPlayingParams> {
	constructor(params: Partial<GetNowPlayingParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetNowPlayingParams>({
		guildId: Joi.string().required(),
	}).required();
}
