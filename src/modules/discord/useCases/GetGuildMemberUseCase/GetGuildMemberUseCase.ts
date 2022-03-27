import { UseCase } from "@core";
import { DiscordClient } from "@modules/discord";
import { GuildMember } from "discord.js";
import Joi from "joi";
import { inject, injectable } from "tsyringe";

interface Params {
	guildId: string;
	userId: string;
}

type Response = GuildMember | undefined;

@injectable()
export class GetGuildMemberUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		guildId: Joi.string().required(),
		userId: Joi.string().required(),
	}).required();

	constructor(@inject(DiscordClient) private discordClient: DiscordClient) {
		super();
	}

	protected async run(params: Params): Promise<Response> {
		const { guildId, userId } = params;

		const guild = await this.discordClient.guilds.fetch(guildId);
		const member = await guild?.members.fetch(userId);

		return member;
	}
}
