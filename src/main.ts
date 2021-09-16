import Discord from "discord.js";
import "dotenv/config";
import fs from "fs";
import Player from "./modules/Player";

const PREFIX = process.env.PREFIX as string;
const TOKEN = process.env.TOKEN as string;

const client = new Discord.Client({
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Discord.Intents.FLAGS.GUILD_VOICE_STATES,
		Discord.Intents.FLAGS.DIRECT_MESSAGES,
	],
});

const player = new Player(client, {
	leaveOnEnd: false,
	leaveOnEmpty: false,
	leaveOnStop: true,
	deafenOnJoin: true,
});

client.commands = [];
client.player = player;

// Dynamically reading command files from ./commands directory
const commandFolders = fs.readdirSync("./dist/commands");

// Register all commands to the client
for (const folder of commandFolders) {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { default: command } = require(`./commands/${folder}/index.js`);
	client.commands.push(command.name, command);
}

client.once("ready", () => console.log("Ready!"));

client.on("messageCreate", async (message) => {
	if (!message.content.startsWith(PREFIX) || message.author.bot) return;

	const args = message.content.slice(PREFIX.length).trim().split(/ +/);
	const commandName = (args.shift() as string).toLowerCase();

	const command = client.commands.find(
		(c) => c.name === commandName || c.aliases?.includes(commandName)
	);

	if (!command || command.enabled === false || !message.guild) return;

	try {
		const queue = client.player.getQueue(message.guild.id);
		message.guild.queue = queue;

		await command.execute(message, args);
	} catch (error) {
		await message.reply(`Failed to execute the command: ${(error as Error).message}`);
	}
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isButton()) return;
	const commands = [...client.commands.values()];
	const customId = interaction.customId;
	const prefixId = customId.split("/").shift();

	const command = commands.find((command) => command.buttonInteractionIdPrefix === prefixId);
	if (!command?.buttonInteraction) return;

	try {
		const meta = command.buttonInteractionIdParser?.(customId) || {};
		await command.buttonInteraction(interaction, meta);
	} catch (error) {
		await interaction.channel?.send(`Failed to execute the command: ${(error as Error).message}`);
	}
});

client.login(TOKEN);
