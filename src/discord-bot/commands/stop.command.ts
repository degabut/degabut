import { DiscordUtil } from "@common/utils";
import { IPrefixCommand } from "@discord-bot/interfaces";
import { Command, Handler, InteractionEvent } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { StopCommand } from "@queue-player/commands";
import { CommandInteraction, Message } from "discord.js";

import { PrefixCommand } from "../decorators";

type HandlerOptions = {
  voiceChannelId: string;
  userId: string;
};

@Injectable()
@PrefixCommand({
  name: "stop",
  aliases: ["disconnect", "dc", "leave"],
})
@Command({
  name: "stop",
  description: "Disconnect bot from the voice channel",
})
export class StopDiscordCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  @Handler()
  async slashHandler(@InteractionEvent() interaction: CommandInteraction) {
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);

    if (!voiceData) return;

    await this.handler({
      userId: voiceData.member.id,
      voiceChannelId: voiceData.voiceChannel.id,
    });
    return `Left <#${voiceData.voiceChannel.id}>`;
  }

  public async prefixHandler(message: Message): Promise<void> {
    const voiceData = DiscordUtil.getVoiceFromMessage(message);
    if (!voiceData) return;

    await this.handler({
      userId: voiceData.member.id,
      voiceChannelId: voiceData.voiceChannel.id,
    });

    await message.react("👋🏻");
  }

  private async handler(options: HandlerOptions) {
    const command = new StopCommand({
      voiceChannelId: options.voiceChannelId,
      executor: { id: options.userId },
    });

    await this.commandBus.execute(command);
  }
}
