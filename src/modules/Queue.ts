import { Player, PlayerOptions, Queue as DefaultQueue, Song, Utils } from "discord-music-player";
import { Guild, TextBasedChannels } from "discord.js";
import { Client as Youtube, VideoCompact } from "youtubei";
import { getEmbedFromSong } from "../utils/Utils";

class Queue extends DefaultQueue {
	autoplay = false;
	lastPlayed: Song | undefined;
	youtube: Youtube;
	channel: TextBasedChannels;

	constructor(channel: TextBasedChannels, player: Player, guild: Guild, options?: PlayerOptions) {
		super(player, guild, options);
		this.youtube = new Youtube();
		this.channel = channel;

		this.initializeEventListener();
	}

	setAutoPlay(value: boolean): void {
		this.autoplay = value;
	}

	private initializeEventListener(): void {
		this.player.on("queueEnd", (queue) => {
			if (queue.guild.id !== this.guild.id) return;
			this.onQueueEnd();
		});
		this.player.on("songFirst", (_, song) => {
			this.onSongStart(song);
		});
		this.player.on("error", (err, queue) => {
			if (queue.guild?.id !== this.guild?.id) return;
			this.channel.send("Something went wrong: " + err);
		});
	}

	private onQueueEnd(): void {
		if (this.destroyed) return;
		if (this.lastPlayed && this.autoplay && this.songs.length === 0) this.autoPlay();
	}

	private onSongStart(song: Song): void {
		if (this.destroyed) return;
		this.lastPlayed = song;
		this.channel.send({
			content: "🎶 **Now Playing**",
			embeds: [getEmbedFromSong(song, this.createProgressBar().prettier)],
		});
	}

	private async autoPlay(): Promise<Song> {
		if (!this.lastPlayed) throw new Error("Last played song is undefined");
		let videoId: string | null;
		try {
			videoId = new URL(this.lastPlayed.url).searchParams.get("v");
			if (!videoId) throw new Error();
		} catch (err) {
			throw new Error("Not a Youtube Video");
		}

		const video = await this.youtube.getVideo(videoId);
		if (!video) throw new Error("Video not found");

		const relatedVideo = video.related.find((r) => r instanceof VideoCompact) as
			| VideoCompact
			| undefined;
		if (!relatedVideo) throw new Error("No related video found");

		const song = new Song(
			{
				author: relatedVideo.channel?.name || "",
				duration: Utils.msToTime((relatedVideo.duration || 0) * 1000),
				isLive: relatedVideo.isLive,
				name: relatedVideo.title,
				thumbnail: relatedVideo.thumbnails.best || "_",

				url: `http://youtube.com/watch?v=${relatedVideo.id}`,
			},
			this,
			this.lastPlayed.requestedBy
		);

		this.play(song);
		return song;
	}
}

export default Queue;
