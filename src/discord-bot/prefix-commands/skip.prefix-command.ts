import { TrackAudioSkippedEvent } from "@discord-bot/events";
import { PlayerRepository } from "@discord-bot/repositories";
import { AudioPlayerStatus } from "@discordjs/voice";
import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { Track } from "@queue/entities";
import { Message } from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "skip",
})
export class SkipPrefixCommand implements IPrefixCommand {
  constructor(
    private readonly eventBus: EventBus,
    private readonly playerRepository: PlayerRepository,
  ) {}

  public async handler(message: Message): Promise<void> {
    if (!message.guild || !message.member) return;

    const player = this.playerRepository.getByGuildId(message.guild.id);

    if (!player || player.audioPlayer.state.status !== AudioPlayerStatus.Playing) return;

    const track = player.audioPlayer.state.resource.metadata as Track;
    player.audioPlayer.stop();
    this.eventBus.publish(new TrackAudioSkippedEvent({ track, skippedBy: message.member }));
  }
}
