import { RawSong, Song, Utils } from "discord-music-player";
import { Command } from "discord.js";
import { Client } from "youtubei";
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
			} else if (url.hostname === "open.spotify.com") {
				if (url.pathname.startsWith("/track"))
					await queue.play(query, { requestedBy: message.author });
				else if (url.pathname.startsWith("/playlist"))
					await queue.playlist(query, { requestedBy: message.author });
			}
		} catch (e) {
			const youtube = new Client();

			const item = await youtube.findOne(query, { type: "video" });
			if (!item) throw new Error("❌ **Not Found**");

			const addedSong = new Song(
				{
					name: item.title,
					url: "http://www.youtube.com/watch?v=" + item.id,
					duration: Utils.msToTime((item.duration || 0) * 1000),
					author: item.channel?.name,
					isLive: item.isLive,
					thumbnail: item.thumbnails.best,
				} as RawSong,
				queue,
				message.author
			);

			const song = await queue.play(addedSong, { requestedBy: message.author }).catch((err) => {
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
