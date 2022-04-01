import { UseCase } from "@core";
import { DiscordOAuthProvider } from "@modules/discord/providers/DiscordOAuthProvider";
import { APIUser } from "discord-api-types/v9";
import { inject, injectable } from "tsyringe";
import { GetUserParams } from "./GetUserAdapter";

type Response = APIUser;

@injectable()
export class GetUserUseCase extends UseCase<GetUserParams, Response> {
	constructor(@inject(DiscordOAuthProvider) private discordOAuthProvider: DiscordOAuthProvider) {
		super();
	}

	protected async run(params: GetUserParams): Promise<Response> {
		const { accessToken } = params;

		const user = await this.discordOAuthProvider.getCurrentUser(accessToken);
		if (!user) throw new Error("Invalid Access Token.");

		return user;
	}
}
