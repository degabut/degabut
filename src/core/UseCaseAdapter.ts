import Joi from "joi";

type AdapterConstructor = { name: string; SCHEMA?: Joi.ObjectSchema };

export abstract class UseCaseAdapter<Params = unknown> {
	private params!: Partial<Params>;

	constructor(params: Partial<Params>) {
		this.params = params;
	}

	public async validate(): Promise<Params> {
		const Adapter = this.constructor as unknown as AdapterConstructor;
		const result = await Adapter.SCHEMA?.validateAsync(this.params);
		if (!result) throw new Error(`Couldn't validate ${Adapter.name}`);
		return result;
	}
}
