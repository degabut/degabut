import { inject, injectable } from "tsyringe";
import { SkipTrackUseCase } from "../../modules/queue";
import { CommandExecuteProps, ICommand } from "../core";

@injectable()
export class SkipCommand implements ICommand {
	public readonly name = "skip";
	public readonly description = "Skip now playing song";

	constructor(@inject(SkipTrackUseCase) private skipTrack: SkipTrackUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		await this.skipTrack.execute({ guildId: message.guild?.id });
	}
}
