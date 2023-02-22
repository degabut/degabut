import { DiscordUtil } from "@common/utils";
import { CommandResult, IPrefixCommand } from "@discord-bot/interfaces";
import { SlashCommandPipe } from "@discord-nestjs/common";
import { Command, Handler, InteractionEvent, Param, ParamType } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { RemoveTrackCommand } from "@queue/commands";
import { CommandInteraction, Message } from "discord.js";

import { PrefixCommand } from "../decorators";

class RemoveDto {
  @Param({
    description: "Track position (remove last track if not provided)",
    required: false,
    type: ParamType.INTEGER,
    minValue: 1,
  })
  position?: number;
}

type HandlerOptions = {
  position?: number;
  voiceChannelId: string;
  userId: string;
};

@Injectable()
@Command({
  name: "remove",
  description: "Remove a track from queue",
})
@PrefixCommand({
  name: "remove",
  aliases: ["rm"],
})
export class RemoveDiscordCommand implements IPrefixCommand {
  constructor(private readonly commandBus: CommandBus) {}

  @Handler()
  async slashHandler(
    @InteractionEvent() interaction: CommandInteraction,
    @InteractionEvent(SlashCommandPipe) options: RemoveDto,
  ) {
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);
    if (!voiceData) return;

    const position = options.position;

    const removed = await this.handler({
      userId: interaction.user.id,
      voiceChannelId: voiceData.voiceChannel.id,
      position,
    });

    if (!removed) {
      return "Invalid index!";
    } else {
      await interaction.deferReply();
      await interaction.deleteReply();
    }
  }

  public async prefixHandler(message: Message, args: string[]): Promise<CommandResult> {
    if (!message.member?.voice.channelId) return;

    const position = +args[0];
    const removed = await this.handler({
      userId: message.author.id,
      voiceChannelId: message.member.voice.channelId,
      position,
    });
    if (!removed) return "Invalid index!";
  }

  private async handler(options: HandlerOptions) {
    const { position, voiceChannelId, userId } = options;

    const command = new RemoveTrackCommand({
      voiceChannelId,
      index: position && !Number.isNaN(position) ? position - 1 : undefined,
      executor: { id: userId },
    });

    try {
      const removed = await this.commandBus.execute(command);
      return removed;
    } catch (err) {
      console.log(err);
    }
  }
}
