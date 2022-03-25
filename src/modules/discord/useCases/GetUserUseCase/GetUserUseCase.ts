import { UseCase } from "@core";
import { DiscordOAuthProvider } from "@modules/discord";
import { APIUser } from "discord-api-types/v9";
import Joi from "joi";
import { inject, injectable } from "tsyringe";

interface Params {
	accessToken: string;
}

type Response = APIUser;

@injectable()
export class GetUserUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		accessToken: Joi.string().required(),
	}).required();

	constructor(@inject(DiscordOAuthProvider) private discordOAuthProvider: DiscordOAuthProvider) {
		super();
	}

	protected async run(params: Params): Promise<Response> {
		const { accessToken } = params;

		const user = await this.discordOAuthProvider.getCurrentUser(accessToken);
		if (!user) throw new Error("Invalid Access Token.");

		return user;
	}
}
