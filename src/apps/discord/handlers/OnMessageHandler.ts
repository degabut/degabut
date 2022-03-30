import { Message } from "discord.js";
import { ICommand } from "../core/ICommand";

export class OnMessageHandler {
	constructor(private commands: ICommand[], private prefix: string) {}

	async execute(message: Message): Promise<void> {
		if (!message.content.startsWith(this.prefix) || message.author.bot) return;

		const args = message.content.slice(this.prefix.length).trim().split(/ +/);
		const commandName = (args.shift() as string).toLowerCase();
		const command = this.commands.find(
			(c) => c.name === commandName || c.aliases?.includes(commandName)
		);

		if (!command || command.enabled === false || !message.guild) return;

		try {
			await command.execute({ message, args });
		} catch (error) {
			await message.reply(`Failed to execute the command: ${(error as Error).message}`);
		}
	}
}
