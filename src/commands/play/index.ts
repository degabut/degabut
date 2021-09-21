import { Command } from "discord.js";
import { getEmbedFromSong } from "../../utils/Utils";

const command: Command = {
	name: "play",
	aliases: ["p"],
	description: "Play a song",
	async execute(message, args) {
		if (!message.member?.voice.channel || !message.guild) return;
		const queue = message.client.player.createQueue(message.guild.id, {
			channel: message.channel,
		});
		await queue.join(message.member.voice.channel);

		const query = args.join(" ");

		try {
			// check if args is a youtube playlist
			const url = new URL(query);
			if (url.hostname === "www.youtube.com" && url.pathname === "/playlist") {
				const playlist = await queue
					.playlist(query, { requestedBy: message.author })
					.catch((err) => {
						message.channel.send("Something went wrong: " + err);
						queue.stop();
					});
				if (playlist) {
					await message.reply(`🎶 **Added ${playlist.songs.length} songs from ${playlist.name}**`);
				}
			} else {
				throw new Error();
			}
		} catch (e) {
			const song = await queue.play(query, { requestedBy: message.author }).catch((err) => {
				message.channel.send("Something went wrong: " + err);
				queue.stop();
			});

			if (song && queue.songs.length > 1) {
				await message.reply({
					content: `🎵 **Added To Queue** (${queue.songs.length})`,
					embeds: [getEmbedFromSong(song)],
				});
			}
		}
		queue.channel = message.channel;
	},
};

export default command;
