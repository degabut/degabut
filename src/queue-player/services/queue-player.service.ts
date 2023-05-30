import { InjectDiscordClient } from "@discord-nestjs/core";
import { Injectable, Logger } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { NotifyKey } from "@queue-player/entities";
import { QueuePlayer } from "@queue-player/entities/queue-player";
import {
  PlayerDestroyedEvent,
  PlayerReadyEvent,
  PlayerTextChannelChangedEvent,
  PlayerVoiceChannelChangedEvent,
  TrackAudioEndedEvent,
  TrackAudioErrorEvent,
  TrackAudioFinishedEvent,
  TrackAudioStartedEvent,
} from "@queue-player/events";
import { QueuePlayerRepository } from "@queue-player/repositories";
import {
  Client,
  DiscordAPIError,
  Message,
  MessageCreateOptions,
  MessagePayload,
  VoiceChannel,
} from "discord.js";

export enum PlayerDestroyReason {
  COMMAND = "COMMAND",
  DISCONNECTED = "DISCONNECTED",
  AUTO_DISCONNECTED = "AUTO_DISCONNECTED",
}

@Injectable()
export class QueuePlayerService {
  private logger = new Logger(QueuePlayerService.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly eventBus: EventBus,
    private readonly playerRepository: QueuePlayerRepository,
  ) {}

  public async destroyPlayer(
    playerOrId: string | QueuePlayer,
    reason: PlayerDestroyReason,
  ): Promise<void> {
    const player =
      typeof playerOrId === "string"
        ? this.playerRepository.getByVoiceChannelId(playerOrId)
        : playerOrId;

    this.logger.log({
      method: "destroyPlayer",
      voiceChannelId: player?.voiceChannel.id,
      reason,
    });

    if (!player) return;

    player.audioPlayer.disconnect();
    await player.audioPlayer.node.destroyPlayer(player.audioPlayer.guildId);
    this.playerRepository.deleteByVoiceChannelId(player.voiceChannel.id);
    this.eventBus.publish(new PlayerDestroyedEvent({ player }));
  }

  public initPlayerConnection(player: QueuePlayer): void {
    player.audioPlayer.on("channelJoin", () => {
      this.logger.log({
        event: "channelJoin",
        voiceChannelId: player.voiceChannel.id,
        guildId: player.guild.id,
      });

      this.eventBus.publish(new PlayerReadyEvent({ player }));
    });

    player.audioPlayer.on("channelMove", async (_, to) => {
      const voiceChannel = this.client.channels.resolve(to) as VoiceChannel;

      this.playerRepository.deleteByVoiceChannelId(player.voiceChannel.id);
      player.voiceChannel = voiceChannel;
      this.playerRepository.save(player);

      this.eventBus.publish(new PlayerVoiceChannelChangedEvent({ player }));
    });

    player.audioPlayer.on("disconnected", async () => {
      await new Promise((r) => setTimeout(r, 2500));
      if (player.audioPlayer.connected) return;
      this.destroyPlayer(player, PlayerDestroyReason.DISCONNECTED);
    });

    player.audioPlayer.on("trackStart", () => {
      const lavaTrack = player.currentTrack;
      if (!lavaTrack) return;
      if (player.audioPlayer.paused) player.audioPlayer.pause(true);
      this.eventBus.publish(new TrackAudioStartedEvent({ track: lavaTrack.track }));
    });

    player.audioPlayer.on("trackEnd", (_, reason) => {
      const lavaTrack = player.currentTrack;
      if (!lavaTrack) return;
      const { track } = lavaTrack;
      player.currentTrack = null;

      this.logger.log({
        event: "trackEnd",
        trackId: track.id,
        videoId: track.video.id,
        voiceChannelId: player.voiceChannel.id,
        guildId: player.guild.id,
        reason,
      });

      this.eventBus.publish(new TrackAudioEndedEvent({ track }));
      if (reason === "FINISHED") this.eventBus.publish(new TrackAudioFinishedEvent({ track }));
    });

    player.audioPlayer.on("trackException", (_, e) => {
      this.logger.error({ error: "trackException", e });
      const lavaTrack = player.currentTrack;
      if (!lavaTrack) return;
      this.eventBus.publish(new TrackAudioErrorEvent({ track: lavaTrack.track }));
    });

    player.audioPlayer.connect(player.voiceChannel.id, { deafened: true });
  }

  public async notify(
    player: QueuePlayer,
    message: string | MessagePayload | MessageCreateOptions,
    key?: NotifyKey,
  ): Promise<Message | undefined> {
    let sentMessage: Message | undefined = undefined;
    if (player.textChannel) {
      try {
        sentMessage = await player.textChannel.send(message);
      } catch (err) {
        if (!(err instanceof DiscordAPIError)) return;
        if (err.code === 10003) {
          player.textChannel = null;
          this.eventBus.publish(new PlayerTextChannelChangedEvent({ player }));
        }
      }
    }

    if (!sentMessage) {
      if (!player.voiceChannel.isTextBased()) return;
      try {
        sentMessage = await player.voiceChannel.send(message);
      } catch {
        // ignore
      }
    }

    if (sentMessage && key) {
      const lastMessage = player.keyedMessage[key];
      try {
        if (lastMessage) await lastMessage.delete();
        player.keyedMessage[key] = sentMessage;
      } catch (err) {
        if (!(err instanceof DiscordAPIError)) return;
        delete player.keyedMessage[key];
      }
    }

    return sentMessage;
  }
}
