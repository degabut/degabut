import { ClearQueueAdapter, ClearQueueUseCase } from "@modules/queue/useCases/ClearQueueUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class ClearCommand implements ICommand {
	public readonly name = "clear";
	public readonly description = "Clear tracks on queue";

	constructor(@inject(ClearQueueUseCase) private clearQueue: ClearQueueUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new ClearQueueAdapter({ guildId: message.guild?.id });
		await this.clearQueue.execute(adapter, { userId: message.author.id });
		await message.react("🗑️");
	}
}
