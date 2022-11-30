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
import { Injectable, Logger } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { Client, VoiceChannel } from "discord.js";

@Injectable()
export class QueuePlayerService {
  private logger = new Logger(QueuePlayerService.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly eventBus: EventBus,
    private readonly playerRepository: QueuePlayerRepository,
  ) {}

  public async stopPlayer(playerOrId: string | QueuePlayer): Promise<void> {
    let player: QueuePlayer | undefined;
    if (typeof playerOrId === "string") {
      player = this.playerRepository.getByVoiceChannelId(playerOrId);
    } else {
      player = playerOrId;
    }
    if (!player) return;

    player.audioPlayer.disconnect();
    await player.audioPlayer.node.destroyPlayer(player.audioPlayer.guildId);
    this.playerRepository.deleteByVoiceChannelId(player.voiceChannel.id);
    this.eventBus.publish(new VoiceDestroyedEvent({ player }));
  }

  public initPlayerConnection(player: QueuePlayer): void {
    player.audioPlayer.on("channelJoin", () => {
      this.eventBus.publish(new VoiceReadyEvent({ player }));
    });

    player.audioPlayer.on("channelMove", async (_, to) => {
      const voiceChannel = this.client.channels.resolve(to) as VoiceChannel;

      this.playerRepository.deleteByVoiceChannelId(player.voiceChannel.id);
      player.voiceChannel = voiceChannel;
      this.playerRepository.save(player);

      this.eventBus.publish(new VoiceChannelChangedEvent({ player }));
    });

    player.audioPlayer.on("disconnected", async () => {
      await new Promise((r) => setTimeout(r, 2500));
      if (player.audioPlayer.connected) return;
      this.stopPlayer(player);
    });

    player.audioPlayer.on("trackStart", () => {
      const lavaTrack = player.currentTrack;
      if (!lavaTrack) return;
      this.eventBus.publish(new TrackAudioStartedEvent({ track: lavaTrack.track }));
    });

    player.audioPlayer.on("trackEnd", (_, reason) => {
      const lavaTrack = player.currentTrack;
      if (!lavaTrack) return;
      const { track } = lavaTrack;
      this.eventBus.publish(new TrackAudioEndedEvent({ track }));
      if (reason === "FINISHED") this.eventBus.publish(new TrackAudioFinishedEvent({ track }));

      player.currentTrack = null;
    });

    player.audioPlayer.on("trackException", (_, err) => {
      this.logger.error(err);
      const lavaTrack = player.currentTrack;
      if (!lavaTrack) return;
      this.eventBus.publish(new TrackAudioErrorEvent({ track: lavaTrack.track }));
    });

    player.audioPlayer.connect(player.voiceChannel.id);
  }
}
