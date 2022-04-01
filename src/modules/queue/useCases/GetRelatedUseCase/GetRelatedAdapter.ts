import { UseCaseAdapter } from "core/UseCaseAdapter";
import Joi from "joi";

export type GetRelatedParams = {
	guildId: string;
};

export class GetRelatedAdapter extends UseCaseAdapter<GetRelatedParams> {
	constructor(params: Partial<GetRelatedParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetRelatedParams>({
		guildId: Joi.string().required(),
	}).required();
}
