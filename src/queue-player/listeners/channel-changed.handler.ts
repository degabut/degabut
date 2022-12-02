import { VoiceMemberJoinedEvent, VoiceMemberLeftEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerChannelChangedEvent } from "@queue-player/events";
import { AUTO_DISCONNECT_TIMEOUT } from "@queue-player/queue-player.contants";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { PlayerDestroyReason, QueuePlayerService } from "@queue-player/services";

const events = [VoiceMemberLeftEvent, VoiceMemberJoinedEvent, PlayerChannelChangedEvent];
type Events = InstanceType<typeof events[number]>;

@EventsHandler(...events)
export class ChannelChangedEvent implements IEventHandler<Events> {
  constructor(
    private readonly playerService: QueuePlayerService,
    private readonly playerRepository: QueuePlayerRepository,
  ) {}

  public async handle(event: Events): Promise<void> {
    const player =
      "voiceChannel" in event
        ? this.playerRepository.getByVoiceChannelId(event.voiceChannel.id)
        : event.player;

    if (!player) return;

    if (player.voiceChannel.members.size > 1 && player.disconnectTimeout) {
      clearTimeout(player.disconnectTimeout);
      player.disconnectTimeout = null;
    } else if (player.voiceChannel.members.size <= 1 && !player.disconnectTimeout) {
      player.disconnectTimeout = setTimeout(() => {
        if (player.voiceChannel.members.size > 1) return;
        this.playerService.destroyPlayer(player, PlayerDestroyReason.AUTO_DISCONNECTED);
      }, AUTO_DISCONNECT_TIMEOUT);
    }
  }
}
