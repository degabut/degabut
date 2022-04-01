import {
	ToggleAutoPlayAdapter,
	ToggleAutoplayUseCase,
} from "@modules/queue/useCases/ToggleAutoplayUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class AutoplayCommand implements ICommand {
	public readonly name = "autoplay";
	public readonly aliases = ["ap"];
	public readonly description = "Toggle autoplay";

	constructor(@inject(ToggleAutoplayUseCase) private toggleAutoplay: ToggleAutoplayUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new ToggleAutoPlayAdapter({ guildId: message.guild?.id });
		const isActive = await this.toggleAutoplay.execute(adapter, { userId: message.author.id });

		await message.reply(isActive ? "🎧 **Autoplay enabled**" : "▶ **Autoplay Disabled**");
	}
}
