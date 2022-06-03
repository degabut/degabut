import { AudioPlayer, createAudioPlayer, VoiceConnection } from "@discordjs/voice";
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";
import { EventEmitter } from "events";
import { Track } from "./Track";

interface ConstructorProps {
	voiceConnection: VoiceConnection;
	voiceChannel: BaseGuildVoiceChannel;
	textChannel: BaseGuildTextChannel;
}

export enum LoopType {
	Disabled = "DISABLED",
	Song = "SONG",
	Queue = "QUEUE",
}

export class Queue extends EventEmitter {
	public readonly audioPlayer: AudioPlayer;
	public readonly voiceConnection: VoiceConnection;
	public readonly tracks: Track[];
	public readonly history: Track[];
	public textChannel: BaseGuildTextChannel;
	public voiceChannel: BaseGuildVoiceChannel;
	public nowPlaying: Track | null;
	public loopType: LoopType;
	public autoplay: boolean;
	public readyLock: boolean;

	constructor(props: ConstructorProps) {
		super();

		this.voiceConnection = props.voiceConnection;
		this.voiceChannel = props.voiceChannel;
		this.textChannel = props.textChannel;
		this.nowPlaying = null;
		this.tracks = [];
		this.history = [];
		this.loopType = LoopType.Disabled;
		this.autoplay = false;
		this.readyLock = false;
		this.audioPlayer = createAudioPlayer();
	}

	public hasMember(userId: string): boolean {
		return this.voiceChannel.members.some((m) => m.id === userId);
	}
}
