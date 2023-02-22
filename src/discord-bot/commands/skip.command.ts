import { DiscordUtil } from "@common/utils";
import { IPrefixCommand } from "@discord-bot/interfaces";
import { Command, Handler, InteractionEvent } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { SkipCommand } from "@queue-player/commands";
import { CommandInteraction, Message } from "discord.js";

import { PrefixCommand } from "../decorators";

type HandlerOptions = {
  voiceChannelId: string;
  userId: string;
};

@Injectable()
@PrefixCommand({
  name: "skip",
})
@Command({
  name: "skip",
  description: "Skip current song",
})
export class SkipDiscordCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  @Handler()
  public async slashHandler(@InteractionEvent() interaction: CommandInteraction) {
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData) return;

    await this.handler({
      userId: voiceData.member.id,
      voiceChannelId: voiceData.voiceChannel.id,
    });

    await interaction.deferReply();
    await interaction.deleteReply();
  }

  public async prefixHandler(message: Message): Promise<void> {
    const voiceData = DiscordUtil.getVoiceFromMessage(message);
    if (!voiceData) return;

    await this.handler({
      userId: voiceData.member.id,
      voiceChannelId: voiceData.voiceChannel.id,
    });
  }

  private async handler(options: HandlerOptions) {
    const command = new SkipCommand({
      voiceChannelId: options.voiceChannelId,
      executor: { id: options.userId },
    });

    await this.commandBus.execute(command);
  }
}
