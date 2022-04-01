import Joi from "joi";

export abstract class UseCaseAdapter<Params = unknown> {
	private params!: Partial<Params>;

	constructor(params: Partial<Params>) {
		this.params = params;
	}

	public async validate(): Promise<Params> {
		const Adapter = this.constructor as unknown as { SCHEMA: Joi.ObjectSchema };
		const result = await Adapter.SCHEMA.validateAsync(this.params);
		if (!result) throw new Error("Couldn't validate");
		return result;
	}
}
