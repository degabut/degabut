import { QueuePlayer } from "@discord-bot/entities/queue-player";
import {
  TrackAudioEndedEvent,
  TrackAudioErrorEvent,
  TrackAudioFinishedEvent,
  TrackAudioStartedEvent,
  VoiceChannelChangedEvent,
  VoiceReadyEvent,
} from "@discord-bot/events";
import { VoiceDestroyedEvent } from "@discord-bot/events/voice-destroyed.event";
import { QueuePlayerRepository } from "@discord-bot/repositories";
import { InjectDiscordClient } from "@discord-nestjs/core";
import {
  AudioPlayerStatus,
  AudioResource,
  entersState,
  VoiceConnectionDisconnectedState,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { Track } from "@queue/entities";
import { Client } from "discord.js";

@Injectable()
export class QueuePlayerService {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly eventBus: EventBus,
    private readonly playerRepository: QueuePlayerRepository,
  ) {}

  public stopPlayer(playerOrId: string | QueuePlayer): void {
    let player: QueuePlayer | undefined;
    if (typeof playerOrId === "string") {
      player = this.playerRepository.getByVoiceChannelId(playerOrId);
    } else {
      player = playerOrId;
    }
    if (!player) return;

    player.readyLock = true;
    if (player.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
      player.voiceConnection.destroy();
    }
    player.audioPlayer.stop(true);
    this.playerRepository.deleteByVoiceChannelId(player.voiceChannel.id);
  }

  public initPlayerConnection(player: QueuePlayer): void {
    player.voiceConnection.on("stateChange", async (_, newState) => {
      const { status } = newState;

      if (status === VoiceConnectionStatus.Disconnected) {
        await this.onVoiceDisconnected(player, newState);
      } else if (status === VoiceConnectionStatus.Destroyed) {
        this.onVoiceDestroyed(player);
      } else if (
        !player.readyLock &&
        (status === VoiceConnectionStatus.Connecting || status === VoiceConnectionStatus.Signalling)
      ) {
        await this.onVoiceConnecting(player);
      } else if (status === VoiceConnectionStatus.Ready) {
        this.onVoiceReady(player);
      }
    });

    player.audioPlayer.on("stateChange", (oldState, newState) => {
      if (
        oldState.status !== AudioPlayerStatus.Idle &&
        newState.status === AudioPlayerStatus.Idle &&
        player.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed
      ) {
        const resource = oldState.resource as AudioResource<Track>;
        const track = resource.metadata;
        const isFinished = Math.abs(track.video.duration - resource.playbackDuration / 1000) < 3;

        this.eventBus.publish(new TrackAudioEndedEvent({ track }));
        if (isFinished) this.eventBus.publish(new TrackAudioFinishedEvent({ track }));
      } else if (
        oldState.status !== AudioPlayerStatus.Paused &&
        newState.status === AudioPlayerStatus.Playing
      ) {
        const track = (newState.resource as AudioResource<Track>).metadata;
        this.eventBus.publish(new TrackAudioStartedEvent({ track }));
      }
    });

    player.audioPlayer.on("error", () => {
      if (player.audioPlayer.state.status !== AudioPlayerStatus.Playing) return;
      const track = player.audioPlayer.state.resource.metadata as Track;
      this.eventBus.publish(new TrackAudioErrorEvent({ track }));
    });

    player.voiceConnection.subscribe(player.audioPlayer);
  }

  private async onVoiceDisconnected(
    player: QueuePlayer,
    newState: VoiceConnectionDisconnectedState,
  ): Promise<void> {
    if (
      newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
      newState.closeCode === 4014
    ) {
      try {
        await entersState(player.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
      } catch {
        this.stopPlayer(player);
      }
    } else if (player.voiceConnection.rejoinAttempts < 5) {
      await new Promise((r) => setTimeout(r, (player.voiceConnection.rejoinAttempts + 1) * 5_000));
      player.voiceConnection.rejoin();
    } else {
      this.stopPlayer(player);
    }
  }

  private onVoiceDestroyed(player: QueuePlayer): void {
    this.stopPlayer(player);
    this.eventBus.publish(new VoiceDestroyedEvent({ player }));
  }

  private async onVoiceConnecting(player: QueuePlayer): Promise<void> {
    player.readyLock = true;
    try {
      await entersState(player.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
    } catch {
      if (player.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed)
        this.stopPlayer(player);
    } finally {
      player.readyLock = false;
    }
  }

  private onVoiceReady(player: QueuePlayer): void {
    const voiceChannel =
      this.client.user &&
      player.voiceChannel.guild.members.resolve(this.client.user.id)?.voice.channel;

    if (!voiceChannel) return;

    if (voiceChannel.id !== player.voiceChannel.id) {
      this.playerRepository.deleteByVoiceChannelId(player.voiceChannel.id);
      player.voiceChannel = voiceChannel;
      this.eventBus.publish(new VoiceChannelChangedEvent({ player }));
      this.playerRepository.save(player);
    } else {
      this.eventBus.publish(new VoiceReadyEvent({ player }));
    }
  }
}
