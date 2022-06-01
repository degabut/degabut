import { AudioResource, createAudioResource } from "@discordjs/voice";
import { VideoCompact } from "@modules/youtube/entities/VideoCompact";
import { secondToTime } from "@utils";
import { GuildMember, MessageEmbed } from "discord.js";
import { EventEmitter } from "events";
import { v4 } from "uuid";
import ytdl from "ytdl-core";

interface ConstructorProps {
	video: VideoCompact;
	requestedBy: GuildMember;
}

export class Track extends EventEmitter {
	public readonly id: string;
	public readonly video: VideoCompact;
	public readonly requestedBy: GuildMember;
	public playedAt: Date | null;

	constructor(props: ConstructorProps) {
		super();

		this.id = v4();
		this.video = props.video;
		this.requestedBy = props.requestedBy;
		this.playedAt = null;
	}

	public async createAudioSource(): Promise<AudioResource<Track>> {
		const stream = ytdl(this.video.id, {
			filter: "audioonly",
			highWaterMark: 1 << 62,
			liveBuffer: 1 << 62,
			dlChunkSize: 0,
			quality: "highestaudio",
		});
		const resource = createAudioResource<Track>(stream, { metadata: this });

		return resource;
	}

	public get url(): string {
		return `https://youtu.be/${this.video.id}`;
	}

	public get embed(): MessageEmbed {
		const fields = [{ name: "Duration", value: secondToTime(this.video.duration) }];
		const descriptions: string[] = [];
		if (this.video.channel) descriptions.push(`**${this.video.channel.name}**`);
		if (this.requestedBy) descriptions.push(`Requested by <@!${this.requestedBy.id}>`);

		return new MessageEmbed({
			title: this.video.title,
			description: descriptions.join("\r\n"),
			url: this.url,
			image: this.video.thumbnails.at(-1) ? { url: this.video.thumbnails.at(-1)?.url } : undefined,
			fields,
		});
	}
}
