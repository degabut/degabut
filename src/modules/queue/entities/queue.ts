import { ArrayUtil, RandomUtil } from "@common/utils";
import { MediaSource } from "@media-source/entities";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AggregateRoot } from "@nestjs/cqrs";
import {
  MemberJammedEvent,
  MemberJoinedEvent,
  MemberLeftEvent,
  MemberUpdatedEvent,
  QueueClearedEvent,
  QueueCreatedEvent,
  QueueDestroyedEvent,
  QueueLoopModeChangedEvent,
  QueueProcessedEvent,
  QueueShuffleToggledEvent,
  QueueTextChannelChangedEvent,
  QueueVoiceChannelChangedEvent,
  TrackMarkedPlayNextEvent,
  TrackOrderChangedEvent,
  TracksAddedEvent,
  TracksRemovedEvent,
} from "@queue/events";
import { MAX_QUEUE_TRACKS } from "@queue/queue.constants";

import { Guild } from "./guild";
import { Jam, JamCollection } from "./jam";
import { Member } from "./member";
import { TextChannel } from "./text-channel";
import { Track } from "./track";
import { VoiceChannel } from "./voice-channel";

interface ConstructorProps {
  voiceChannel: VoiceChannel;
  textChannel?: TextChannel | null;
  guild: Guild;
}

export enum LoopMode {
  Disabled = "DISABLED",
  Track = "TRACK",
  Queue = "QUEUE",
}

type RemoveTrackOptions = {
  index?: number;
  trackId?: string;
  isNowPlaying?: boolean;
};

type RemoveTracksOptions = {
  memberId?: string;
  trackIds?: string[];
};

export class Queue extends AggregateRoot {
  private isCreated: boolean = false;
  private isDestroyed: boolean = false;

  public voiceChannelId: string;
  public tracks: Array<Track> = [];
  public history: Array<Track> = [];
  public nowPlaying: Track | null = null;
  public nextTrack: Track | null = null;
  public loopMode: LoopMode = LoopMode.Disabled;
  public shuffle: boolean = false;
  public historyIds: Array<string> = [];
  public previousHistoryIds: Array<string> = [];
  public guild: Guild;
  public voiceChannel: VoiceChannel;
  public textChannel: TextChannel | null;

  constructor(props: ConstructorProps) {
    super();
    this.autoCommit = true;

    this.guild = props.guild;
    this.voiceChannelId = props.voiceChannel.id;
    this.voiceChannel = props.voiceChannel;
    this.textChannel = props.textChannel || null;
  }

  public create() {
    if (this.isCreated) return;
    this.isCreated = true;
    this.apply(new QueueCreatedEvent({ queue: this }));
  }

  public destroy() {
    if (this.isDestroyed || !this.isCreated) return;
    this.isDestroyed = true;
    this.apply(new QueueDestroyedEvent({ queue: this }));
  }

  //#region tracks
  get unplayedTrack() {
    return this.tracks.filter((t) => !this.historyIds.includes(t.id));
  }

  public addTracks(sources: MediaSource[], member: Member): Track[] {
    const limit = MAX_QUEUE_TRACKS - this.tracks.length;
    if (limit <= 0) throw new BadRequestException("Queue is full");

    const tracks = sources.slice(0, limit).map(
      (source) =>
        new Track({
          queue: this,
          mediaSource: source,
          requestedBy: member,
        }),
    );

    this.tracks.push(...tracks);
    this.apply(new TracksAddedEvent({ queue: this, tracks, member }));

    if (!this.nowPlaying) this.processQueue();

    return tracks;
  }

  public removeTrack(opts: RemoveTrackOptions, member?: Member): Track | null {
    let index: number;

    if (opts.index !== undefined) {
      index = opts.index;
    } else if (opts.trackId) {
      index = this.tracks.findIndex((track) => track.id === opts.trackId);
    } else if (opts.isNowPlaying) {
      index = this.tracks.findIndex((track) => track.id === this.nowPlaying?.id);
    } else {
      throw new Error("Invalid remove track options");
    }

    const removed = this.tracks.at(index);
    if (!removed) return null;

    if (removed.id === this.nowPlaying?.id && !this.shuffle) {
      this.nextTrack = this.tracks[index + 1] || null;
    }

    const tracks = this.tracks.splice(index, 1);

    if (removed) {
      this.apply(
        new TracksRemovedEvent({
          tracks,
          member,
        }),
      );
    }

    return removed;
  }

  public removeTracks({ trackIds, memberId }: RemoveTracksOptions, member: Member): Track[] {
    let queueTrackIds = this.tracks.map((t) => t.id);
    const removedTracks: Track[] = [];

    if (trackIds) {
      removedTracks.push(...this.tracks.filter((t) => trackIds.includes(t.id)));
      this.tracks = this.tracks.filter((t) => !trackIds.includes(t.id));
    }

    if (memberId) {
      removedTracks.push(...this.tracks.filter((t) => t.requestedBy?.id === memberId));
      this.tracks = this.tracks.filter((t) => t.requestedBy?.id !== memberId);
    }

    const nowPlayingId = this.nowPlaying?.id;
    const hasNowPlaying = removedTracks.some((t) => t.id === nowPlayingId);

    if (!removedTracks.length) return [];

    if (!this.shuffle && hasNowPlaying) {
      queueTrackIds = queueTrackIds.filter(
        (id) => removedTracks.some((t) => t.id === id) || id === nowPlayingId,
      );
      const nowPlayingIndex = queueTrackIds.findIndex((id) => id === nowPlayingId);
      this.nextTrack = this.tracks[nowPlayingIndex] || null;
    }

    this.apply(
      new TracksRemovedEvent({
        tracks: removedTracks,
        member,
      }),
    );

    return removedTracks;
  }

  public clearTracks(includeNowPlaying: boolean, member: Member) {
    this.tracks = !includeNowPlaying ? this.tracks.filter((t) => t.id === this.nowPlaying?.id) : [];
    this.apply(new QueueClearedEvent({ queue: this, member, includeNowPlaying }));
  }

  public orderTracks(idOrIndex: string | number, to: number, member: Member) {
    const fromIndex =
      typeof idOrIndex === "number"
        ? idOrIndex
        : this.tracks.findIndex((track) => track.id === idOrIndex);

    const track = this.tracks.at(fromIndex);
    if (!track) throw new BadRequestException("Track not found");
    this.tracks.splice(fromIndex, 1);
    this.tracks.splice(to, 0, track);

    this.apply(new TrackOrderChangedEvent({ track, to, member }));
  }

  public playTrack(idOrIndex: string | number, member: Member) {
    const track =
      typeof idOrIndex === "number"
        ? this.tracks[idOrIndex]
        : this.tracks.find((t) => t.id === idOrIndex);

    if (!track) throw new NotFoundException("Track not found");
    if (track.id === this.nowPlaying?.id) {
      throw new BadRequestException("Track is currently playing");
    }

    this.nextTrack = track;
    this.apply(new TrackMarkedPlayNextEvent({ track, member }));

    return track;
  }
  //#endregion

  //#region queue settings
  public toggleShuffle(member: Member) {
    this.shuffle = !this.shuffle;
    this.apply(new QueueShuffleToggledEvent({ queue: this, member }));

    return this.shuffle;
  }

  public changeLoopMode(loopMode: LoopMode, member: Member): LoopMode {
    if (!loopMode) this.loopMode = LoopMode.Disabled;
    else if (this.loopMode === LoopMode.Disabled) this.loopMode = loopMode;
    else if (this.loopMode === loopMode) this.loopMode = LoopMode.Disabled;
    else this.loopMode = loopMode;

    this.apply(new QueueLoopModeChangedEvent({ queue: this, member }));

    return this.loopMode;
  }
  //#endregion

  //#region member
  public getMember(userId: string, isActive = true): Member | undefined {
    return this.voiceChannel.members.find(
      (m) => m.id === userId && m.isInVoiceChannel === isActive,
    );
  }

  public addMember(member: Member) {
    const existingMember = this.voiceChannel.members.find((m) => m.id === member.id);

    if (existingMember) existingMember.isInVoiceChannel = true;
    else this.voiceChannel.members.push(member);

    this.apply(new MemberJoinedEvent({ member, queue: this }));
  }

  public removeMember(memberId: string) {
    const leftMember = this.voiceChannel.members.find((m) => m.id === memberId);
    if (!leftMember) return;

    leftMember.isInVoiceChannel = false;

    this.apply(new MemberLeftEvent({ member: leftMember, queue: this }));
  }

  public updateMember(member: Member) {
    const index = this.voiceChannel.members.findIndex((m) => m.id === member.id);
    if (index === -1) return;

    const memberToUpdate = this.voiceChannel.members[index];
    member.isInVoiceChannel = memberToUpdate.isInVoiceChannel;

    this.voiceChannel.members[index] = member;

    this.apply(new MemberUpdatedEvent({ member, queue: this }));
  }

  public jam(count: number, member: Member) {
    const jam = new JamCollection({
      member,
      jams: [...Array(count)].map(
        () =>
          new Jam({
            jamSpeed: Math.random(),
            xOffset: Math.random(),
            ySpeed: Math.random(),
          }),
      ),
    });

    this.apply(new MemberJammedEvent({ jam, queue: this }));
  }
  //#endregion

  //#region channel
  public setTextChannel(channel: TextChannel | null) {
    this.textChannel = channel;
    this.apply(new QueueTextChannelChangedEvent({ queue: this }));
  }

  public setVoiceChannel(channel: VoiceChannel) {
    const from = this.voiceChannel;

    const newMembers = channel.members;
    const oldMembers = this.voiceChannel.members
      .filter((m) => !newMembers.some((nm) => nm.id === m.id))
      .map((m) => {
        m.isInVoiceChannel = false;
        return m;
      });

    channel.members.push(...oldMembers);

    this.voiceChannelId = channel.id;
    this.voiceChannel = channel;

    const to = this.voiceChannel;

    this.apply(new QueueVoiceChannelChangedEvent({ queue: this, from, to }));
  }
  //#endregion

  //#region processor
  public processQueue(): void {
    const nowPlayingIndex = this.tracks.findIndex((t) => t.id === this.nowPlaying?.id);

    if (this.loopMode === LoopMode.Disabled && nowPlayingIndex >= 0) {
      const tracks = this.tracks.splice(nowPlayingIndex, 1);
      this.apply(new TracksRemovedEvent({ tracks }));
    } else if (this.nowPlaying) {
      this.historyIds.push(this.nowPlaying.id);

      if (!this.unplayedTrack.length) {
        this.previousHistoryIds = [...this.historyIds];
        this.historyIds = [this.nowPlaying.id];
      }

      this.nowPlaying.playedAt = null;
    }

    let nextIndex = 0;

    if (this.nextTrack) {
      const index = this.tracks.findIndex((t) => t.id === this.nextTrack?.id);
      nextIndex = Math.max(index, 0);
      this.nextTrack = null;
    } else {
      if (this.loopMode === LoopMode.Track) {
        nextIndex = Math.max(nowPlayingIndex, 0);
      } else if (this.shuffle) {
        nextIndex = this.getShuffledTrackIndex();
      } else if (this.loopMode === LoopMode.Queue) {
        nextIndex = nowPlayingIndex + 1;
      } else if (nowPlayingIndex >= 0) {
        nextIndex = nowPlayingIndex;
      }
    }

    this.nowPlaying = this.tracks.at(nextIndex) || this.tracks.at(0) || null;

    this.apply(new QueueProcessedEvent({ queue: this }));
  }

  private getShuffledTrackIndex(): number {
    const unplayedTracks = this.unplayedTrack;

    if (!unplayedTracks.length) return 0;

    let randomTrack: Track | undefined;

    if (!this.previousHistoryIds.length) {
      randomTrack = unplayedTracks.at(RandomUtil.randomInt(0, unplayedTracks.length - 1));
    } else {
      const randomTracks = unplayedTracks.sort((a, b) => {
        return (
          this.previousHistoryIds.findIndex((id) => id === a.id) -
          this.previousHistoryIds.findIndex((id) => id === b.id)
        );
      });
      randomTrack = ArrayUtil.pickRankedRandom(randomTracks);
    }

    return randomTrack ? this.tracks.findIndex((t) => t.id === randomTrack?.id) : 0;
  }
  //#endregion

  //#region event handlers
  private onTracksRemovedEvent({ tracks }: TracksRemovedEvent) {
    this.previousHistoryIds = this.previousHistoryIds.filter(
      (id) => !tracks.some((t) => t.id === id),
    );
    this.historyIds = this.historyIds.filter((id) => !tracks.some((t) => t.id === id));
  }
  //#endregion
}
