import { SkipAdapter, SkipUseCase } from "@modules/queue/useCases/SkipUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class SkipCommand implements ICommand {
	public readonly name = "skip";
	public readonly description = "Skip now playing song";

	constructor(@inject(SkipUseCase) private skip: SkipUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new SkipAdapter({ guildId: message.guild?.id });
		await this.skip.execute(adapter, { userId: message.author.id });
	}
}
