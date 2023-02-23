import { ValidateParams } from "@common/decorators";
import { InjectDiscordClient } from "@discord-nestjs/core";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { BaseGuildTextChannel, Client } from "discord.js";

import { RedirectCommand, RedirectParamSchema } from "./redirect.command";

@CommandHandler(RedirectCommand)
export class RedirectHandler implements IInferredCommandHandler<RedirectCommand> {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly playerRepository: QueuePlayerRepository,
  ) {}

  @ValidateParams(RedirectParamSchema)
  public async execute(params: RedirectCommand): Promise<void> {
    const { voiceChannelId, textChannelId, executor } = params;

    const player = this.playerRepository.getByVoiceChannelId(voiceChannelId);
    if (!player) throw new NotFoundException("Player not found");
    const member = player.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const textChannel = await this.client.channels.fetch(textChannelId);
    if (!textChannel || !(textChannel instanceof BaseGuildTextChannel)) {
      throw new BadRequestException("Invalid text channel id");
    }

    const user = await textChannel.guild.members.fetch(executor.id);
    const me = textChannel.guild.members.me;

    if (
      !me ||
      !textChannel.permissionsFor(user)?.has("SendMessages") ||
      !textChannel.permissionsFor(me).has("SendMessages")
    ) {
      throw new BadRequestException("No permission to send messages to text channel");
    }

    if (player.voiceChannel.guildId !== textChannel.guildId) {
      throw new BadRequestException("Invalid voice channel and text channel combination");
    }

    player.textChannel = textChannel;
  }
}
