import { Player as DefaultPlayer, PlayerOptions } from "discord-music-player";
import { Client as DiscordClient, Collection, Snowflake, TextBasedChannels } from "discord.js";
import Queue from "./Queue";

class Player extends DefaultPlayer {
	public queues: Collection<Snowflake, Queue> = new Collection();

	constructor(client: DiscordClient, options?: PlayerOptions) {
		super(client, options);
	}

	createQueue(
		guildId: Snowflake,
		options: PlayerOptions & { channel?: TextBasedChannels } = this.options
	): Queue {
		options = Object.assign({} as PlayerOptions, this.options, options);

		const guild = this.client.guilds.resolve(guildId);
		if (!guild || !options.channel) throw new Error("Guild / Channel not found");
		if (this.hasQueue(guildId)) return this.getQueue(guildId) as Queue;

		const { channel } = options;
		delete options.channel;
		const queue = new Queue(channel, this, guild, options);
		this.setQueue(guildId, queue);

		return queue;
	}

	getQueue(guildId: Snowflake): Queue | undefined {
		return this.queues.get(guildId);
	}
}

export default Player;
