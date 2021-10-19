import { RawSong, Song, Utils } from "discord-music-player";
import { Command } from "discord.js";
import { Client, LiveVideo } from "youtubei";
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
		queue.channel = message.channel;

		const youtube = new Client();

		try {
			const url = new URL(query);
			if (url.hostname.endsWith("youtube.com") && url.pathname === "/playlist") {
				// Youtube Playlist
				const playlist = await queue
					.playlist(query, { requestedBy: message.author })
					.catch((err) => {
						message.channel.send("Something went wrong: " + err);
						queue.stop();
					});
				if (playlist) {
					await message.reply(`🎶 **Added ${playlist.songs.length} songs from ${playlist.name}**`);
				}
			} else if (url.hostname.endsWith("youtu.be") || url.hostname.endsWith("youtube.com")) {
				// Youtube Video
				let id: string | null;
				if (url.hostname.endsWith("youtu.be")) id = url.pathname.split("/")[1];
				else id = url.searchParams.get("v");
				if (!id) throw null;

				const video = await youtube.getVideo(id);
				if (!video) throw new Error("❌ **Not Found**");

				const addedSong = new Song(
					{
						name: video.title,
						url: "http://www.youtube.com/watch?v=" + video.id,
						duration: Utils.msToTime(("duration" in video ? video.duration : 0) * 1000),
						author: video.channel?.name,
						isLive: video instanceof LiveVideo,
						thumbnail: video.thumbnails.best,
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
			} else if (url.hostname === "open.spotify.com") {
				// Spotify
				if (url.pathname.startsWith("/track"))
					await queue.play(query, { requestedBy: message.author });
				else if (url.pathname.startsWith("/playlist"))
					await queue.playlist(query, { requestedBy: message.author });
			}
		} catch (e) {
			// Search by args
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
	},
};

export default command;
