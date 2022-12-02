import { ValidateParams } from "@common/decorators";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueuePlayer } from "@queue-player/entities";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { QueuePlayerService } from "@queue-player/services";
import { Client, ClientUser } from "discord.js";

import { JoinCommand, JoinParamSchema } from "./join.command";

@CommandHandler(JoinCommand)
export class JoinHandler implements IInferredCommandHandler<JoinCommand> {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly playerRepository: QueuePlayerRepository,
    private readonly playerService: QueuePlayerService,
  ) {}

  @ValidateParams(JoinParamSchema)
  public async execute(params: JoinCommand): Promise<void> {
    const { voiceChannel, textChannel } = params;

    if (voiceChannel.guildId !== textChannel.guildId) {
      throw new InternalServerErrorException("Invalid guild");
    }

    if (this.playerRepository.getByGuildId(voiceChannel.guildId)) {
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

    const audioPlayer = this.client.lavalink.createPlayer(voiceChannel.guild.id);

    const player = new QueuePlayer({
      textChannel,
      voiceChannel,
      audioPlayer,
    });

    this.playerRepository.save(player);

    this.playerService.initPlayerConnection(player);
  }
}
