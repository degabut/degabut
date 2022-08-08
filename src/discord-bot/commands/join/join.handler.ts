import { ValidateParams } from "@common/decorators";
import { QueuePlayer } from "@discord-bot/entities";
import { PlayerRepository } from "@discord-bot/repositories";
import { DiscordPlayerService } from "@discord-bot/services";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { BadRequestException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { Client, ClientUser } from "discord.js";

import { JoinCommand, JoinParamSchema } from "./join.command";

@CommandHandler(JoinCommand)
export class JoinHandler implements IInferredCommandHandler<JoinCommand> {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly playerRepository: PlayerRepository,
    private readonly playerService: DiscordPlayerService,
  ) {}

  @ValidateParams(JoinParamSchema)
  public async execute(params: JoinCommand): Promise<void> {
    const { voiceChannel, textChannel } = params;

    if (this.playerRepository.getByGuildId(voiceChannel.guild.id)) {
      throw new Error("Already Exists");
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

    this.playerService.initPlayerConnection(player);
  }
}
