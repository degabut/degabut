import {
	GetQueueTracksAdapter,
	GetQueueTracksUseCase,
} from "@modules/queue/useCases/GetQueueTracksUseCase";
import { MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class QueueCommand implements ICommand {
	public readonly name = "queue";
	public readonly aliases = ["q"];
	public readonly description = "Show current queue";

	constructor(@inject(GetQueueTracksUseCase) private getQueueTracks: GetQueueTracksUseCase) {}

	public async execute({ message, args }: CommandExecuteProps): Promise<void> {
		const page = Number(args.shift() || 1);
		const perPage = 10;

		const adapter = new GetQueueTracksAdapter({
			guildId: message.guild?.id,
			page,
			perPage,
		});
		const { tracks, totalLength } = await this.getQueueTracks.execute(adapter, {
			userId: message.author.id,
		});

		const start = (page - 1) * perPage;
		const embed = new MessageEmbed({
			title: "Queue",
			description: `Showing page **${page}** / **${Math.ceil(totalLength / perPage)}**`,
			fields: tracks.map((track, index) => ({
				name: `${start + index + 1}. ${track.title}`,
				value: `${track.url}\r\nRequested by <@!${track.requestedBy?.id}>`,
			})),
		});

		await message.reply({ embeds: [embed] });
	}
}
