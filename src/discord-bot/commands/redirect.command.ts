import { DiscordUtil } from "@common/utils";
import { CommandResult, IPrefixCommand } from "@discord-bot/interfaces";
import { Command, Handler, InteractionEvent } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { RedirectCommand } from "@queue-player/commands";
import { BaseGuildTextChannel, CommandInteraction, Message } from "discord.js";

import { PrefixCommand } from "../decorators";

type HandlerOptions = {
  voiceChannelId: string;
  textChannelId: string;
  userId: string;
};

@Injectable()
@PrefixCommand({
  name: "redirect",
})
@Command({
  name: "redirect",
  description: "Redirects all notifications messages to this text channel",
})
export class RedirectDiscordCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  @Handler()
  public async slashHandler(@InteractionEvent() interaction: CommandInteraction) {
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData || !(interaction.channel instanceof BaseGuildTextChannel)) return;

    await this.handler({
      userId: voiceData.member.id,
      textChannelId: interaction.channel.id,
      voiceChannelId: voiceData.voiceChannel.id,
    });

    await interaction.reply("All notifications will be sent to this text channel");
  }

  public async prefixHandler(message: Message): Promise<CommandResult> {
    const voiceData = DiscordUtil.getVoiceFromMessage(message);
    if (!voiceData || !(message.channel instanceof BaseGuildTextChannel)) return;

    await this.handler({
      userId: voiceData.member.id,
      textChannelId: message.channel.id,
      voiceChannelId: voiceData.voiceChannel.id,
    });

    return "All notifications will be sent to this text channel";
  }

  private async handler(options: HandlerOptions) {
    const command = new RedirectCommand({
      voiceChannelId: options.voiceChannelId,
      textChannelId: options.textChannelId,
      executor: { id: options.userId },
    });

    await this.commandBus.execute(command);
  }
}
