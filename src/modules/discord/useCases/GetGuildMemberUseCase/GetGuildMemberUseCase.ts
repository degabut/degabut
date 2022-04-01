import { UseCase } from "@core";
import { DiscordClient } from "@modules/discord/DiscordClient";
import { GuildMember } from "discord.js";
import { inject, injectable } from "tsyringe";
import { GetGuildMemberParams } from "./GetGuildMemberAdapter";

type Response = GuildMember | undefined;

@injectable()
export class GetGuildMemberUseCase extends UseCase<GetGuildMemberParams, Response> {
	constructor(@inject(DiscordClient) private discordClient: DiscordClient) {
		super();
	}

	protected async run(params: GetGuildMemberParams): Promise<Response> {
		const { guildId, userId } = params;

		const guild = await this.discordClient.guilds.fetch(guildId);
		const member = await guild?.members.fetch(userId);

		return member;
	}
}
