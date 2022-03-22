import { ChangeLoopTypeUseCase, LoopType } from "@modules/queue";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core";

@injectable()
export class LoopQueueCommand implements ICommand {
	public readonly name = "loopqueue";
	public readonly description = "Loop Queue";

	constructor(@inject(ChangeLoopTypeUseCase) private changeLoopType: ChangeLoopTypeUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const loopType = await this.changeLoopType.execute({
			guildId: message.guild?.id,
			loopType: LoopType.Queue,
		});

		await message.reply(
			loopType === LoopType.Queue ? "🔂 **Looping Queue**" : "▶ **Loop Queue Disabled**"
		);
	}
}
