import {
	GetNowPlayingAdapter,
	GetNowPlayingUseCase,
} from "@modules/queue/useCases/GetNowPlayingUseCase";
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

	constructor(
		@inject(GetQueueTracksUseCase) private getQueueTracks: GetQueueTracksUseCase,
		@inject(GetNowPlayingUseCase) private getNowPlaying: GetNowPlayingUseCase
	) {}

	public async execute({ message, args }: CommandExecuteProps): Promise<void> {
		const page = Number(args.shift() || 1);
		const perPage = 10;

		const queueTracksAdapter = new GetQueueTracksAdapter({
			guildId: message.guild?.id,
			page,
			perPage,
		});

		const nowPlayingAdapter = new GetNowPlayingAdapter({
			guildId: message.guild?.id,
		});

		const [{ tracks, totalLength }, nowPlaying] = await Promise.all([
			this.getQueueTracks.execute(queueTracksAdapter, { userId: message.author.id }),
			this.getNowPlaying.execute(nowPlayingAdapter, { userId: message.author.id }),
		]);

		const start = (page - 1) * perPage;
		const embed = new MessageEmbed({
			title: "Queue",
			description: `Showing page **${page}** / **${Math.ceil(totalLength / perPage)}**`,
			fields: tracks.map((track, index) => {
				let name = `${start + index + 1}. ${track.video.title}`;
				console.log(track.id);
				if (track.id === nowPlaying?.id) name = `__${name}__`;

				return {
					name,
					value: `${track.url}\r\nRequested by <@!${track.requestedBy?.id}>`,
				};
			}),
		});

		await message.reply({ embeds: [embed] });
	}
}
