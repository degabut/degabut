import { JoinAdapter, JoinUseCase } from "@modules/queue/useCases/JoinUseCase";
import { TextChannel } from "discord.js";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class JoinCommand implements ICommand {
	public readonly name = "join";
	public readonly description = "Join to a voice channel and creates an empty queue";
	public readonly aliases = ["j"];

	constructor(@inject(JoinUseCase) private join: JoinUseCase) {}

	public async execute({ message }: CommandExecuteProps): Promise<void> {
		const adapter = new JoinAdapter({
			textChannel: message.channel instanceof TextChannel ? message.channel : undefined,
			voiceChannel: message.member?.voice.channel || undefined,
		});
		await this.join.execute(adapter, { userId: message.author.id });
	}
}
