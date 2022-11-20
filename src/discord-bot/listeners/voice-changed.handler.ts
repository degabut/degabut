import { AUTO_DISCONNECT_TIMEOUT } from "@discord-bot/discord-bot.contants";
import {
  VoiceChannelChangedEvent,
  VoiceMemberJoinedEvent,
  VoiceMemberLeftEvent,
} from "@discord-bot/events";
import { QueuePlayerService } from "@discord-bot/services";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";

@EventsHandler(VoiceMemberLeftEvent, VoiceMemberJoinedEvent, VoiceChannelChangedEvent)
export class VoiceChangedEvent implements IEventHandler<VoiceChannelChangedEvent> {
  constructor(private readonly playerService: QueuePlayerService) {}

  public async handle({ player }: VoiceMemberLeftEvent): Promise<void> {
    if (player.voiceChannel.members.size > 1 && player.disconnectTimeout) {
      clearTimeout(player.disconnectTimeout);
      player.disconnectTimeout = null;
    } else if (player.voiceChannel.members.size <= 1 && !player.disconnectTimeout) {
      player.disconnectTimeout = setTimeout(() => {
        if (player.voiceChannel.members.size > 1) return;
        this.playerService.stopPlayer(player);
      }, AUTO_DISCONNECT_TIMEOUT);
    }
  }
}
