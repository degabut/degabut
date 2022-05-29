import { RemoveTrackAdapter, RemoveTrackUseCase } from "@modules/queue/useCases/RemoveTrackUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class SkipCommand implements ICommand {
	public readonly name = "skip";
	public readonly description = "Skip now playing song";

	constructor(@inject(RemoveTrackUseCase) private removeTrack: RemoveTrackUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new RemoveTrackAdapter({ index: 0, guildId: message.guild?.id });
		await this.removeTrack.execute(adapter, { userId: message.author.id });
	}
}
