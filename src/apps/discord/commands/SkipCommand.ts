import { RemoveTrackAdapter } from "@modules/queue/useCases/RemoveTrackUseCase";
import { SkipUseCase } from "@modules/queue/useCases/SkipUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class SkipCommand implements ICommand {
	public readonly name = "skip";
	public readonly description = "Skip now playing song";

	constructor(@inject(SkipUseCase) private skip: SkipUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new RemoveTrackAdapter({ isNowPlaying: true, guildId: message.guild?.id });
		await this.skip.execute(adapter, { userId: message.author.id });
	}
}
