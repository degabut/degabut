import { SkipTrackAdapter, SkipTrackUseCase } from "@modules/queue/useCases/SkipTrackUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class SkipCommand implements ICommand {
	public readonly name = "skip";
	public readonly description = "Skip now playing song";

	constructor(@inject(SkipTrackUseCase) private skipTrack: SkipTrackUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new SkipTrackAdapter({ guildId: message.guild?.id });
		await this.skipTrack.execute(adapter, { userId: message.author.id });
	}
}
