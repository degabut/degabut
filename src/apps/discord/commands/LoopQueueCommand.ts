import { LoopType } from "@modules/queue/domain/Queue";
import { ChangeLoopTypeUseCase } from "@modules/queue/useCases/ChangeLoopTypeUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class LoopQueueCommand implements ICommand {
	public readonly name = "loopqueue";
	public readonly description = "Loop Queue";

	constructor(@inject(ChangeLoopTypeUseCase) private changeLoopType: ChangeLoopTypeUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const loopType = await this.changeLoopType.execute(
			{
				guildId: message.guild?.id,
				loopType: LoopType.Queue,
			},
			{ userId: message.author.id }
		);

		await message.reply(
			loopType === LoopType.Queue ? "🔂 **Looping Queue**" : "▶ **Loop Queue Disabled**"
		);
	}
}
