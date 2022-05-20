import { UseCase } from "@core";
import { DiscordOAuthProvider } from "@modules/discord/providers/DiscordOAuthProvider";
import { inject, injectable } from "tsyringe";
import { GetAccessTokenParams } from "./GetAccessTokenAdapter";

type Response = string;

@injectable()
export class GetAccessTokenUseCase extends UseCase<GetAccessTokenParams, Response> {
	constructor(@inject(DiscordOAuthProvider) private discordOAuthProvider: DiscordOAuthProvider) {
		super();
	}

	public async run(params: GetAccessTokenParams): Promise<Response> {
		const { code } = params;

		const token = await this.discordOAuthProvider.getAccessToken(code);
		if (!token) throw new Error("Invalid Access Token.");

		return token;
	}
}
