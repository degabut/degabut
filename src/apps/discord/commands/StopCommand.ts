import { DisconnectAdapter, DisconnectUseCase } from "@modules/queue/useCases/DisconnectUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class StopCommand implements ICommand {
	public readonly name = "stop";
	public readonly aliases = ["disconnect", "dc"];
	public readonly description = "Disconnects the bot from voice channel";

	constructor(@inject(DisconnectUseCase) private disconnect: DisconnectUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new DisconnectAdapter({ guildId: message.guild?.id });
		await this.disconnect.execute(adapter, { userId: message.author.id });

		await message.react("👋🏻");
	}
}
