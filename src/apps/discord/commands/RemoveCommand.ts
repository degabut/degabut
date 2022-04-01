import { RemoveTrackAdapter, RemoveTrackUseCase } from "@modules/queue/useCases/RemoveTrackUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class RemoveCommand implements ICommand {
	public readonly name = "remove";
	public readonly description = "Remove a song from queue";
	public readonly aliases = ["rm"];

	constructor(@inject(RemoveTrackUseCase) private removeTrack: RemoveTrackUseCase) {}

	public async execute({ message, args }: CommandExecuteProps): Promise<void> {
		const index = +args[0];

		const adapter = new RemoveTrackAdapter({
			guildId: message.guild?.id,
			index: index ? index - 1 : undefined,
		});
		const removed = await this.removeTrack.execute(adapter, { userId: message.author.id });

		if (removed) await message.reply(`🚮 **${removed.title} removed from queue**`);
		else await message.reply("Invalid index!");
	}
}
