import { ValidateParams } from "@common/decorators";
import { BadRequestException, Inject, InternalServerErrorException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueuePlayer } from "@queue-player/entities";
import { IAudioPlayerManager } from "@queue-player/providers/player/audio-player-manager.interface";
import { AUDIO_PLAYER_MANAGER_PROVIDER } from "@queue-player/queue-player.contants";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { QueuePlayerService } from "@queue-player/services";
import { BaseGuildTextChannel, BaseGuildVoiceChannel, Client, ClientUser } from "discord.js";

import { JoinCommand, JoinParamSchema } from "./join.command";

@CommandHandler(JoinCommand)
export class JoinHandler implements IInferredCommandHandler<JoinCommand> {
  constructor(
    private readonly client: Client,
    @Inject(AUDIO_PLAYER_MANAGER_PROVIDER)
    private readonly playerManager: IAudioPlayerManager,
    private readonly playerRepository: QueuePlayerRepository,
    private readonly playerService: QueuePlayerService,
  ) {}

  @ValidateParams(JoinParamSchema)
  public async execute(params: JoinCommand): Promise<void> {
    // resolve voice and text channel
    let voiceChannel: BaseGuildVoiceChannel | null = null;
    let textChannel: BaseGuildTextChannel | null = null;

    if (!this.playerManager.isReady) {
      throw new InternalServerErrorException("Audio player is not connected");
    }

    // resolve channels
    if (params.voiceChannelId) {
      // using ids
      const fetchedVoiceChannel = await this.client.channels.fetch(params.voiceChannelId);
      if (fetchedVoiceChannel && !(fetchedVoiceChannel instanceof BaseGuildVoiceChannel)) {
        throw new BadRequestException("Invalid voice channel id");
      }
      voiceChannel = fetchedVoiceChannel;

      if (params.textChannelId) {
        const fetchedTextChannel = await this.client.channels.fetch(params.textChannelId);
        if (fetchedTextChannel && !(fetchedTextChannel instanceof BaseGuildTextChannel)) {
          throw new BadRequestException("Invalid text channel id");
        }

        if (fetchedTextChannel) {
          const user = await fetchedTextChannel.guild.members.fetch(params.executor.id);
          const me = fetchedTextChannel.guild.members.me;

          if (
            !me ||
            !fetchedTextChannel.permissionsFor(user)?.has("SendMessages") ||
            !fetchedTextChannel.permissionsFor(me).has("SendMessages")
          ) {
            throw new BadRequestException("No permission to send messages to text channel");
          }
        }
        textChannel = fetchedTextChannel;
      }
    } else {
      // using channel object
      voiceChannel = params.voiceChannel || null;
      textChannel = params.textChannel || null;
    }

    if (!voiceChannel || !voiceChannel.members.find((m) => m.id === params.executor.id)) {
      throw new BadRequestException("Voice channel not found");
    }
    if (textChannel && voiceChannel.guildId !== textChannel.guildId) {
      throw new BadRequestException("Invalid voice channel and text channel combination");
    }
    if (this.playerRepository.getByGuildId(voiceChannel.guild.id)) {
      throw new BadRequestException("Queue Already Exists");
    }

    const clientUser = this.client.user as ClientUser;
    const botGuildMember = await voiceChannel.guild.members.fetch(clientUser.id);
    const voiceChannelMemberLength = voiceChannel.members.filter(
      (m) => m.id !== clientUser.id,
    ).size;

    const canJoin =
      botGuildMember.permissionsIn(voiceChannel.id).has("Connect") &&
      (!voiceChannel.userLimit || voiceChannelMemberLength < voiceChannel.userLimit);

    if (!canJoin) {
      throw new BadRequestException("Bot does not have permission to join voice channel");
    }

    const audioPlayer = this.playerManager.createAudioPlayer(voiceChannel.guild.id);

    const player = new QueuePlayer({
      textChannel,
      voiceChannel,
      audioPlayer,
    });

    this.playerRepository.save(player);

    this.playerService.initPlayerConnection(player);
  }
}
