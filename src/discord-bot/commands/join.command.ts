import { DiscordUtil } from "@common/utils";
import { IPrefixCommand } from "@discord-bot/interfaces";
import { Command, Handler, InteractionEvent } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JoinCommand } from "@queue-player/commands";
import { BaseGuildTextChannel, CommandInteraction, Message, VoiceBasedChannel } from "discord.js";

import { PrefixCommand } from "../decorators";

@Injectable()
@PrefixCommand({
  name: "join",
  aliases: ["j"],
})
@Command({
  name: "join",
  description: "Join to voice channel you are in",
})
export class JoinDiscordCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  @Handler()
  async slashHandler(@InteractionEvent() interaction: CommandInteraction) {
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);

    if (!voiceData || !(interaction.channel instanceof BaseGuildTextChannel)) {
      return;
    }

    await this.handler(voiceData.voiceChannel, interaction.channel, interaction.user.id);
    return `Joined <#${voiceData.voiceChannel.id}>`;
  }

  public async prefixHandler(message: Message): Promise<void> {
    if (
      !message.member?.voice?.channel ||
      !(message.channel instanceof BaseGuildTextChannel) ||
      !message.guild
    ) {
      return;
    }

    await this.handler(message.member.voice.channel, message.channel, message.author.id);
  }

  private async handler(
    voiceChannel: VoiceBasedChannel,
    textChannel: BaseGuildTextChannel,
    userId: string,
  ) {
    const command = new JoinCommand({
      voiceChannel,
      textChannel,
      executor: { id: userId },
    });

    await this.commandBus.execute(command);
  }
}
