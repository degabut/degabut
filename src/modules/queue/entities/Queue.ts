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
	public tracks: Track[];
	public history: Track[];
	public textChannel: BaseGuildTextChannel;
	public voiceChannel: BaseGuildVoiceChannel;
	public nowPlaying: Track | null;
	public nextTrack: Track | null;
	public loopType: LoopType;
	public autoplay: boolean;
	public readyLock: boolean;
	public isPaused: boolean;
	public shuffle: boolean;
	public shuffleHistoryIds: string[];
	public previousShuffleHistoryIds: string[];

	constructor(props: ConstructorProps) {
		super();

		this.voiceConnection = props.voiceConnection;
		this.voiceChannel = props.voiceChannel;
		this.textChannel = props.textChannel;
		this.nextTrack = null;
		this.nowPlaying = null;
		this.tracks = [];
		this.history = [];
		this.loopType = LoopType.Disabled;
		this.autoplay = false;
		this.readyLock = false;
		this.shuffle = false;
		this.isPaused = false;
		this.shuffleHistoryIds = [];
		this.previousShuffleHistoryIds = [];
		this.audioPlayer = createAudioPlayer();
	}

	public hasMember(userId: string): boolean {
		return this.voiceChannel.members.some((m) => m.id === userId);
	}
}
