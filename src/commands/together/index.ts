import { Command, MessageActionRow, MessageButton } from "discord.js";

const appsId = {
	youtube: "880218394199220334",
	poker: "755827207812677713",
	betrayal: "773336526917861400",
	fishing: "814288819477020702",
	chess: "832012774040141894",
};

const command: Command = {
	name: "together",
	description: "Do something fun together!",
	aliases: ["tg"],
	async execute(message, args) {
		const channel = message.member?.voice.channel;

		const appId = (args.shift() || "") as keyof typeof appsId;

		if (!channel) return await message.reply("You must be in a voice channel!");
		if (!appId) return await message.reply("Invalid app id");

		const invite = await channel.createInvite({
			targetApplication: appsId[appId] || appId,
			targetType: 2,
			maxUses: 0,
		});

		const row = new MessageActionRow({
			components: [
				new MessageButton({
					label: `JOIN ${appId.toUpperCase()}`,
					style: "LINK",
					url: invite.url,
				}),
			],
		});

		await message.channel.send({
			content: `**<@!${message.author.id}> has started an activity!** (${appId.toUpperCase()})`,
			components: [row],
		});
	},
};

export default command;
