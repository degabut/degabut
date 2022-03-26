import { ToggleAutoplayUseCase } from "@modules/queue";
import { delay, inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core";

@injectable()
export class AutoplayCommand implements ICommand {
	public readonly name = "autoplay";
	public readonly aliases = ["ap"];
	public readonly description = "Toggle autoplay";

	constructor(
		@inject(delay(() => ToggleAutoplayUseCase)) private toggleAutoplay: ToggleAutoplayUseCase
	) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const isActive = await this.toggleAutoplay.execute({ guildId: message.guild?.id });
		await message.reply(isActive ? "🎧 **Autoplay enabled**" : "▶ **Autoplay Disabled**");
	}
}
