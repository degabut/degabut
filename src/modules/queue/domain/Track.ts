import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import { VideoCompact } from "@modules/youtube/domains/VideoCompact";
import { secondToTime } from "@utils";
import { GuildMember, MessageEmbed } from "discord.js";
import { EventEmitter } from "events";
import play from "play-dl";
import { uuid } from "uuidv4";

interface ConstructorProps {
	video: VideoCompact;
	requestedBy: GuildMember;
}

export class Track extends EventEmitter {
	public readonly id: string;
	public readonly video: VideoCompact;
	public readonly requestedBy: GuildMember;

	constructor(props: ConstructorProps) {
		super();

		this.id = uuid();
		this.video = props.video;
		this.requestedBy = props.requestedBy;
	}

	public async createAudioSource(): Promise<AudioResource<Track>> {
		const { stream } = await play.stream(this.video.id);
		const resource = createAudioResource<Track>(stream, {
			inputType: StreamType.Opus,
			metadata: this,
		});

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
