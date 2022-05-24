import { UseCaseAdapter } from "@core";
import Joi from "joi";

export interface ChangeTrackOrderParams {
	guildId?: string;
	trackId: string;
	from: number;
	to: number;
}

export class ChangeTrackOrderAdapter extends UseCaseAdapter<ChangeTrackOrderParams> {
	constructor(params: Partial<ChangeTrackOrderParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<ChangeTrackOrderParams>({
		guildId: Joi.string(),
		trackId: Joi.string(),
		from: Joi.number().min(1),
		to: Joi.number().required().min(1),
	})
		.required()
		.xor("trackId", "from");
}
