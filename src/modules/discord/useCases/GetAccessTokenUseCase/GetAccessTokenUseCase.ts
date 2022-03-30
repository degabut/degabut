import { UseCase } from "@core";
import { DiscordOAuthProvider } from "@modules/discord/providers/DiscordOAuthProvider";
import Joi from "joi";
import { inject, injectable } from "tsyringe";

interface Params {
	code: string;
}

type Response = string;

@injectable()
export class GetAccessTokenUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		code: Joi.string().required(),
	}).required();

	constructor(@inject(DiscordOAuthProvider) private discordOAuthProvider: DiscordOAuthProvider) {
		super();
	}

	protected async run(params: Params): Promise<Response> {
		const { code } = params;

		const token = await this.discordOAuthProvider.getAccessToken(code);
		if (!token) throw new Error("Invalid Access Token.");

		return token;
	}
}
