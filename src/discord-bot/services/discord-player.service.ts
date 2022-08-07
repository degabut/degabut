import { QueuePlayer } from "@discord-bot/entities/queue-player";
import { TrackAudioEndedEvent, TrackAudioStartedEvent, VoiceReadyEvent } from "@discord-bot/events";
import { VoiceDestroyedEvent } from "@discord-bot/events/voice-destroyed.event";
import { PlayerRepository } from "@discord-bot/repositories";
import { InjectDiscordClient } from "@discord-nestjs/core";
import {
  AudioPlayerStatus,
  AudioResource,
  DiscordGatewayAdapterCreator,
  entersState,
  joinVoiceChannel,
  VoiceConnectionDisconnectedState,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { BadRequestException, Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { Track } from "@queue/entities";
import { BaseGuildTextChannel, BaseGuildVoiceChannel, Client, ClientUser, Guild } from "discord.js";

type CreatePlayerParams = {
  guild: Guild;
  voiceChannel: BaseGuildVoiceChannel;
  textChannel: BaseGuildTextChannel;
};

@Injectable()
export class DiscordPlayerService {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly eventBus: EventBus,
    private readonly playerRepository: PlayerRepository,
  ) {}

  async createPlayer({ guild, voiceChannel, textChannel }: CreatePlayerParams) {
    if (this.playerRepository.getByGuildId(guild.id)) throw new Error("Already Exists");

    const clientUser = this.client.user as ClientUser;
    const botGuildMember = await guild.members.fetch(clientUser.id);
    const voiceChannelMemberLength = voiceChannel.members.filter(
      (m) => m.id !== clientUser.id,
    ).size;

    const canJoin =
      botGuildMember.permissionsIn(voiceChannel.id).has("Connect") &&
      (!voiceChannel.userLimit || voiceChannelMemberLength < voiceChannel.userLimit);

    if (!canJoin) {
      throw new BadRequestException("Bot does not have permission to join voice channel");
    }

    const voiceConnection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
    });

    const player = new QueuePlayer({
      textChannel,
      voiceChannel,
      voiceConnection,
    });

    this.playerRepository.save(player);

    this.initQueueConnection(player);
  }

  public stopPlayer(playerOrId: string | QueuePlayer): void {
    let player: QueuePlayer | undefined;
    if (typeof playerOrId === "string") {
      player = this.playerRepository.getByGuildId(playerOrId);
    } else {
      player = playerOrId;
    }

    if (!player) return;

    player.readyLock = true;
    if (player.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
      player.voiceConnection.destroy();
    }
    player.audioPlayer.stop(true);
    this.playerRepository.deleteByGuildId(player.guild.id);
  }

  private initQueueConnection(player: QueuePlayer): void {
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
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status !== AudioPlayerStatus.Idle
      ) {
        const track = (oldState.resource as AudioResource<Track>).metadata;
        // TODO use own event
        this.eventBus.publish(new TrackAudioEndedEvent({ track }));
      } else if (newState.status === AudioPlayerStatus.Playing) {
        const track = (newState.resource as AudioResource<Track>).metadata;
        this.eventBus.publish(new TrackAudioStartedEvent({ track }));
      }
    });

    player.audioPlayer.on("error", (error) => {
      // TODO handle error
      // (error.resource as AudioResource<Track>).metadata.emit("error", error);
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
    if (voiceChannel) player.voiceChannel = voiceChannel;
    this.eventBus.publish(new VoiceReadyEvent({ player }));
  }
}
