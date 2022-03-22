import { MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import { GetQueueTracksUseCase } from "../../modules/queue";
import { CommandExecuteProps, ICommand } from "../core";

@injectable()
export class QueueCommand implements ICommand {
	public readonly name = "queue";
	public readonly aliases = ["q"];
	public readonly description = "Show current queue";

	constructor(@inject(GetQueueTracksUseCase) private getQueueTracks: GetQueueTracksUseCase) {}

	public async execute({ message, args }: CommandExecuteProps): Promise<void> {
		const page = +(args.shift() || 1) - 1;
		const perPage = 10;
		const start = page * perPage;

		const { tracks, totalLength } = await this.getQueueTracks.execute({
			guildId: message.guild?.id,
			page,
			perPage,
		});

		const embed = new MessageEmbed({
			title: "Queue",
			description: `Showing page **${page + 1}** / **${Math.ceil(totalLength / perPage)}**`,
			fields: tracks.map((track, index) => ({
				name: `${start + index + 1}. ${track.title}`,
				value: `${track.url}\r\nRequested by <@!${track.requestedBy?.id}>`,
			})),
		});

		await message.reply({ embeds: [embed] });
	}
}
