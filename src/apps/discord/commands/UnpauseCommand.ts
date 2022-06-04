import { SetPauseAdapter, SetPauseUseCase } from "@modules/queue/useCases/SetPauseUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class UnpauseCommand implements ICommand {
	public readonly name = "unpause";
	public readonly description = "Unpause queue";
	public readonly aliases = ["resume"];

	constructor(@inject(SetPauseUseCase) private setPause: SetPauseUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new SetPauseAdapter({ guildId: message.guild?.id, isPaused: false });
		await this.setPause.execute(adapter, { userId: message.author.id });
	}
}
