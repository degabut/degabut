import { GetNowPlayingUseCase } from "@modules/queue/useCases/GetNowPlayingUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class NowPlayingCommand implements ICommand {
	public readonly name = "nowplaying";
	public readonly aliases = ["np"];
	public readonly description = "Show currently playing song";

	constructor(@inject(GetNowPlayingUseCase) private getNowPlaying: GetNowPlayingUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const track = await this.getNowPlaying.execute(
			{ guildId: message.guild?.id },
			{ userId: message.author.id }
		);

		if (!track) return;
		await message.reply({ embeds: [track.embed] });
	}
}
