import { MessageActionRow, MessageButton } from "discord.js";
import { injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core";

@injectable()
export class TogetherCommand implements ICommand {
	public readonly name = "together";
	public readonly description = "Do something fun together!";
	public readonly aliases = ["tg", "activity"];

	public async execute({ message, args }: CommandExecuteProps): Promise<void> {
		const channel = message.member?.voice.channel;

		const appId = args.shift();

		if (!appId) {
			await message.reply("You need to provide an app id.");
			return;
		}
		if (!channel) {
			await message.reply("You must be in a voice channel!");
			return;
		}

		const invite = await channel.createInvite({
			targetApplication: appId,
			targetType: 2,
			maxUses: 0,
		});

		const row = new MessageActionRow({
			components: [
				new MessageButton({
					label: "JOIN",
					style: "LINK",
					url: invite.url,
				}),
			],
		});

		await message.channel.send({
			content: `**<@!${message.author.id}> has started an activity!** (${appId})`,
			components: [row],
		});
	}
}
