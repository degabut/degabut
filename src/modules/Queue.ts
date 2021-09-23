import { Player, PlayerOptions, Queue as DefaultQueue, Song, Utils } from "discord-music-player";
import { Guild, TextBasedChannels } from "discord.js";
import { Client as Youtube, VideoCompact } from "youtubei";
import { getEmbedFromSong } from "../utils/Utils";

class Queue extends DefaultQueue {
	autoplay = false;
	lastPlayedSongs: Song[] = [];
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

	get lastPlayed(): Song {
		return this.lastPlayedSongs[this.lastPlayedSongs.length - 1];
	}

	private initializeEventListener(): void {
		this.player.on("queueEnd", (queue) => {
			if (queue.guild.id !== this.guild.id) return;
			this.onQueueEnd();
		});
		this.player.on("songFirst", (_, song) => {
			this.onSongChanged(song);
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

	onSongChanged(song: Song): void {
		if (this.destroyed || !song) return;
		if (!this.lastPlayedSongs.find((s) => s.url === song.url)) {
			this.lastPlayedSongs.push(song);
			if (this.lastPlayedSongs.length > 5) this.lastPlayedSongs.shift();
		}

		this.channel.send({
			content: "🎶 **Now Playing**",
			embeds: [getEmbedFromSong(song, this.createProgressBar().prettier)],
		});
	}

	private async autoPlay(): Promise<Song> {
		if (!this.lastPlayed) throw new Error("Last played song is undefined");
		let lastVideoId: string | null;
		try {
			lastVideoId = new URL(this.lastPlayed.url).searchParams.get("v");
			if (!lastVideoId) throw new Error();
		} catch (err) {
			throw new Error("Not a Youtube Video");
		}

		const video = await this.youtube.getVideo(lastVideoId);
		if (!video) throw new Error("Video not found");

		const lastPlayedIds = this.lastPlayedSongs.map((s) => new URL(s.url).searchParams.get("v"));
		const relatedVideos = [video.upNext, ...video.related].filter(
			(r) => r instanceof VideoCompact && !lastPlayedIds.includes(r.id)
		) as VideoCompact[];

		const relatedVideo = relatedVideos.shift();
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
