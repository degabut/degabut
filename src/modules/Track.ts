import { AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import ytdl from "discord-ytdl-core";
import { GuildMember } from "discord.js";
import { EventEmitter } from "events";

interface ConstructorProps {
	id: string;
	title: string;
	thumbnailUrl: string;
	duration: number;
	requestedBy: GuildMember;
}

export class Track extends EventEmitter {
	public readonly id!: string;
	public readonly title!: string;
	public readonly thumbnailUrl!: string;
	public readonly duration!: number;
	public readonly requestedBy!: GuildMember;

	constructor(props: ConstructorProps) {
		super();
		Object.assign(this, props);
	}

	createAudioSource(): AudioResource<Track> {
		const stream = ytdl(this.id, {
			filter: "audioonly",
			quality: "highestaudio",
			opusEncoded: true,
		});

		const resource = createAudioResource<Track>(stream, {
			inputType: StreamType.Opus,
			metadata: this,
		});

		return resource;
	}

	get url(): string {
		return `https://youtu.be/${this.id}`;
	}
}
