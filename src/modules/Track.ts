import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import { GuildMember, MessageEmbed } from "discord.js";
import { EventEmitter } from "events";
import play from "play-dl";
import { ChannelCompact } from "youtubei";
import { secondToTime } from "../utils";

interface ConstructorProps {
	id: string;
	title: string;
	channel?: ChannelCompact;
	thumbnailUrl: string;
	duration: number;
	requestedBy: GuildMember;
}

export class Track extends EventEmitter {
	public readonly id!: string;
	public readonly title!: string;
	public readonly channel?: ChannelCompact;
	public readonly thumbnailUrl!: string;
	public readonly duration!: number;
	public readonly requestedBy!: GuildMember;

	constructor(props: ConstructorProps) {
		super();
		Object.assign(this, props);
	}

	async createAudioSource(): Promise<AudioResource<Track>> {
		const { stream } = await play.stream(this.id);
		const resource = createAudioResource<Track>(stream, {
			inputType: StreamType.Opus,
			metadata: this,
		});

		return resource;
	}

	get url(): string {
		return `https://youtu.be/${this.id}`;
	}

	get embed(): MessageEmbed {
		const fields = [{ name: "Duration", value: secondToTime(this.duration) }];
		const descriptions: string[] = [];
		if (this.channel) descriptions.push(`**${this.channel.name}**`);
		if (this.requestedBy) descriptions.push(`Requested by <@!${this.requestedBy.id}>`);

		return new MessageEmbed({
			title: this.title,
			description: descriptions.join("\r\n"),
			url: this.url,
			image: { url: this.thumbnailUrl },
			fields,
		});
	}
}
