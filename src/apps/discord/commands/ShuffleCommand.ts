import {
	ToggleShuffleAdapter,
	ToggleShuffleUseCase,
} from "@modules/queue/useCases/ToggleShuffleUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class ShuffleCommand implements ICommand {
	public readonly name = "shuffle";
	public readonly description = "Toggle shuffle";

	constructor(@inject(ToggleShuffleUseCase) private toggleShuffle: ToggleShuffleUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new ToggleShuffleAdapter({ guildId: message.guild?.id });
		const isActive = await this.toggleShuffle.execute(adapter, { userId: message.author.id });

		await message.reply(isActive ? "🔀 **Shuffle enabled**" : "▶ **Shuffle Disabled**");
	}
}
