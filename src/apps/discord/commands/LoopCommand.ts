import { LoopType } from "@modules/queue/domain/Queue";
import { ChangeLoopTypeUseCase } from "@modules/queue/useCases/ChangeLoopTypeUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class LoopCommand implements ICommand {
	public readonly name = "loop";
	public readonly description = "Loop Queue";

	constructor(@inject(ChangeLoopTypeUseCase) private changeLoopType: ChangeLoopTypeUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const loopType = await this.changeLoopType.execute(
			{
				guildId: message.guild?.id,
				loopType: LoopType.Song,
			},
			{ userId: message.author.id }
		);

		await message.reply(
			loopType === LoopType.Song ? "🔂 **Looping Song**" : "▶ **Loop Song Disabled**"
		);
	}
}
