import { UseCaseAdapter } from "core/UseCaseAdapter";
import Joi from "joi";

export type GetGuildMemberParams = {
	guildId: string;
	userId: string;
};

export class GetGuildMemberAdapter extends UseCaseAdapter<GetGuildMemberParams> {
	constructor(params: Partial<GetGuildMemberParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<GetGuildMemberParams>({
		guildId: Joi.string().required(),
		userId: Joi.string().required(),
	}).required();
}
