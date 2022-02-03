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

const run = async () => {
	client.prefix = PREFIX;

	const commandFolders = await fs.readdir("./dist/commands");
	// Register all commands to the client
	for (const folder of commandFolders) {
		const command = await import(`./commands/${folder}/index.js`);
		client.commands.push(command.name, command);
	}

	client.once("ready", () => console.log("Ready!"));
	client.on("messageCreate", onMessage);
	client.on("interactionCreate", onInteract);

	client.login(TOKEN);
};

run();
