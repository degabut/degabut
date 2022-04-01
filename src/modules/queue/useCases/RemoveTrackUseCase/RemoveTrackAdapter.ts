import { UseCaseAdapter } from "core/UseCaseAdapter";
import Joi from "joi";

export type RemoveTrackParams = {
	guildId: string;
	index?: number;
};

export class RemoveTrackAdapter extends UseCaseAdapter<RemoveTrackParams> {
	constructor(params: Partial<RemoveTrackParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<RemoveTrackParams>({
		guildId: Joi.string().required(),
		index: Joi.number().min(0).failover(0),
	}).required();
}
