import { RemoveTrackUseCase } from "@modules/queue";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core";

@injectable()
export class RemoveCommand implements ICommand {
	public readonly name = "remove";
	public readonly description = "Remove a song from queue";
	public readonly aliases = ["rm"];

	constructor(@inject(RemoveTrackUseCase) private removeTrack: RemoveTrackUseCase) {}

	public async execute({ message, args }: CommandExecuteProps): Promise<void> {
		const index = +args[0];

		const removed = await this.removeTrack.execute({
			guildId: message.guild?.id,
			index: index ? index - 1 : undefined,
		});

		if (removed) await message.reply(`🚮 **${removed.title} removed from queue**`);
		else await message.reply("Invalid index!");
	}
}
