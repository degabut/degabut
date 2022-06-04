import { SetPauseAdapter, SetPauseUseCase } from "@modules/queue/useCases/SetPauseUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class PauseCommand implements ICommand {
	public readonly name = "pause";
	public readonly description = "Pause queue";

	constructor(@inject(SetPauseUseCase) private setPause: SetPauseUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new SetPauseAdapter({ guildId: message.guild?.id, isPaused: true });
		await this.setPause.execute(adapter, { userId: message.author.id });
	}
}
