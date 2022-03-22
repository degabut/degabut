import { Config } from "@core";
import { Message } from "discord.js";
import { inject, injectable, injectAll } from "tsyringe";
import { ICommand } from "../core";

@injectable()
export class OnMessageHandler {
	constructor(
		@inject(Config) private config: Config,
		@injectAll("commands") private commands: ICommand[]
	) {}

	async execute(message: Message): Promise<void> {
		const prefix = this.config.prefix;

		if (!message.content.startsWith(prefix) || message.author.bot) return;

		const args = message.content.slice(prefix.length).trim().split(/ +/);
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
