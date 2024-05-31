import { AsyncUtil } from "@common/utils";
import { Logger } from "@logger/logger.service";
import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { NotifyKey } from "@queue-player/entities";
import { QueuePlayer } from "@queue-player/entities/queue-player";
import {
  PlayerDestroyedEvent,
  PlayerReadyEvent,
  PlayerTextChannelChangedEvent,
  PlayerTickEvent,
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
  constructor(
    private readonly client: Client,
    private readonly eventBus: EventBus,
    private readonly playerRepository: QueuePlayerRepository,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(QueuePlayerService.name);
  }

  public async destroyPlayer(
    playerOrId: string | QueuePlayer,
    reason: PlayerDestroyReason,
  ): Promise<void> {
    const player =
      typeof playerOrId === "string"
        ? this.playerRepository.getByVoiceChannelId(playerOrId)
        : playerOrId;

    if (!player) return;

    this.logger.info({
      method: "destroyPlayer",
      voiceChannelId: player.voiceChannel.id,
      reason,
    });

    player.destroy();
    this.playerRepository.deleteByVoiceChannelId(player.voiceChannel.id);
    this.eventBus.publish(new PlayerDestroyedEvent({ player }));
  }

  public initPlayerConnection(player: QueuePlayer): void {
    player.audioPlayer.on("ready", () => {
      this.logger.info({
        event: "playerReady",
        voiceChannelId: player.voiceChannel.id,
        guildId: player.guild.id,
      });

      this.eventBus.publish(new PlayerReadyEvent({ player }));
    });

    player.audioPlayer.on("moved", async (_, to) => {
      const newVoiceChannel = this.client.channels.resolve(to) as VoiceChannel;

      this.playerRepository.deleteByVoiceChannelId(player.voiceChannel.id);
      player.voiceChannel = newVoiceChannel;
      this.playerRepository.save(player);

      this.eventBus.publish(new PlayerVoiceChannelChangedEvent({ player }));
    });

    player.audioPlayer.on("disconnected", async () => {
      await AsyncUtil.sleep(2500);
      if (player.audioPlayer.isConnected || player.isDestroyed) return;
      this.destroyPlayer(player, PlayerDestroyReason.DISCONNECTED);
    });

    player.audioPlayer.on("tick", async (position) => {
      this.eventBus.publish(new PlayerTickEvent({ player, position }));
    });

    player.audioPlayer.on("trackStart", () => {
      const track = player.currentTrack;
      if (!track) return;

      this.logger.info({
        event: "trackStart",
        trackId: track.id,
        mediaSourceId: track.mediaSource.id,
        voiceChannelId: player.voiceChannel.id,
        guildId: player.guild.id,
      });

      if (player.audioPlayer.isPaused) player.audioPlayer.pause();

      this.eventBus.publish(new TrackAudioStartedEvent({ track }));
    });

    player.audioPlayer.on("trackEnd", async (isFinished) => {
      const track = player.currentTrack;
      if (!track) return;
      player.currentTrack = null;

      this.logger.info({
        event: "trackEnd",
        trackId: track.id,
        mediaSourceId: track.mediaSource.id,
        voiceChannelId: player.voiceChannel.id,
        guildId: player.guild.id,
        isFinished,
      });

      if (!isFinished) await AsyncUtil.sleep(2500);

      this.eventBus.publish(new TrackAudioEndedEvent({ track }));
      if (isFinished) this.eventBus.publish(new TrackAudioFinishedEvent({ track }));
    });

    player.audioPlayer.on("trackException", (e) => {
      this.logger.error({ error: "trackException", ...e });
      const track = player.currentTrack;
      if (!track) return;
      this.eventBus.publish(new TrackAudioErrorEvent({ track }));
    });

    player.audioPlayer.on("error", (e) => {
      this.logger.error({ error: "audioPlayerError", ...e });
    });

    player.audioPlayer.connect(player.voiceChannel.id);
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
