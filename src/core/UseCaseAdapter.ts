import Joi from "joi";

export abstract class UseCaseAdapter<Params = unknown> {
	private params!: Partial<Params>;
	static SCHEMA?: Joi.ObjectSchema;

	constructor(params: Partial<Params>) {
		this.params = params;
	}

	public async validate(): Promise<Params> {
		const Adapter = this.constructor as typeof UseCaseAdapter;
		const result = await Adapter.SCHEMA?.validateAsync(this.params);
		if (!result) throw new Error(`Couldn't validate ${Adapter.name}`);
		return result;
	}
}
