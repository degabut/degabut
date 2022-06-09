import { ClearQueueAdapter, ClearQueueUseCase } from "@modules/queue/useCases/ClearQueueUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class ClearAllCommand implements ICommand {
	public readonly name = "clearall";
	public readonly description = "Clear all tracks on queue";

	constructor(@inject(ClearQueueUseCase) private clearQueue: ClearQueueUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new ClearQueueAdapter({ guildId: message.guild?.id, removeNowPlaying: true });
		await this.clearQueue.execute(adapter, { userId: message.author.id });
		await message.react("🗑️");
	}
}
