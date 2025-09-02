import { DiscordUtil } from "@common/utils";
import { CommandExceptionFilter } from "@main/filters";
import { Injectable, UseFilters } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JoinCommand } from "@queue-player/commands";
import { BaseGuildTextChannel, Message, VoiceBasedChannel } from "discord.js";
import { Context, SlashCommand, SlashCommandContext } from "necord";

import { TextCommand } from "../decorators";

@Injectable()
export class JoinDiscordCommand {
  private static readonly commandName = "join";
  private static readonly description = "Join to voice channel you are in";

  constructor(private readonly commandBus: CommandBus) {}

  @TextCommand({
    name: JoinDiscordCommand.commandName,
    aliases: ["j"],
    description: JoinDiscordCommand.description,
  })
  public async prefixHandler(message: Message) {
    if (
      !message.member?.voice?.channel ||
      !(message.channel instanceof BaseGuildTextChannel) ||
      !message.guild
    ) {
      return;
    }

    await this.handler(message.member.voice.channel, message.channel, message.author.id);
  }

  @UseFilters(new CommandExceptionFilter())
  @SlashCommand({
    name: JoinDiscordCommand.commandName,
    description: JoinDiscordCommand.description,
  })
  public async slashHandler(@Context() context: SlashCommandContext) {
    const [interaction] = context;
    const voiceData = DiscordUtil.getVoiceFromInteraction(interaction);

    if (!voiceData || !(interaction.channel instanceof BaseGuildTextChannel)) {
      return;
    }

    await this.handler(voiceData.voiceChannel, interaction.channel, interaction.user.id);
    await interaction.reply(`Joined <#${voiceData.voiceChannel.id}>`);
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
