import Joi from "joi";

export abstract class UseCase<ParamsSchema = unknown, Response = unknown> {
	public abstract paramsSchema: Joi.ObjectSchema<ParamsSchema>;
	protected abstract run(params: ParamsSchema): Promise<Response>;

	public execute(params: Partial<ParamsSchema>): Promise<Response> {
		const validatedParams = this.validate(params);
		return this.run(validatedParams);
	}

	private validate(params: Partial<ParamsSchema>): ParamsSchema {
		const result = this.paramsSchema.validate(params);
		if (result.error) throw new Error(result.error.message);
		return result.value;
	}
}
