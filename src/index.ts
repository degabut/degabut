import Discord from "discord.js";
import "dotenv/config";
import { promises as fs } from "fs";
import { onInteract, onMessage } from "./handlers/index";

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
client.commands = [];
client.prefix = PREFIX;

const run = async () => {
	// Register all commands to the client
	const commandFolders = await fs.readdir("./dist/commands");
	for (const folder of commandFolders) {
		const { default: command } = await import(`./commands/${folder}`);
		client.commands.push(command);
	}

	// Add event handler
	client.once("ready", () => console.log("Ready!"));
	client.on("messageCreate", onMessage);
	client.on("interactionCreate", onInteract);

	// Run the bot
	client.login(TOKEN);
};

run();
