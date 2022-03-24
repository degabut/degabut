import { DisconnectUseCase } from "@modules/queue";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core";

@injectable()
export class StopCommand implements ICommand {
	public readonly name = "stop";
	public readonly aliases = ["disconnect", "dc"];
	public readonly description = "Disconnects the bot from voice channel";

	constructor(@inject(DisconnectUseCase) private disconnect: DisconnectUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		await this.disconnect.execute({
			guildId: message.guild?.id,
		});
		await message.react("👋🏻");
	}
}
