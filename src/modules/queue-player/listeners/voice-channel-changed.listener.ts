import { VoiceMemberJoinedEvent, VoiceMemberLeftEvent } from "@discord-bot/events";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { QueuePlayer } from "@queue-player/entities";
import { PlayerVoiceChannelChangedEvent } from "@queue-player/events";
import { AUTO_DISCONNECT_TIMEOUT } from "@queue-player/queue-player.contants";
import { QueuePlayerRepository } from "@queue-player/repositories";
import { PlayerDestroyReason, QueuePlayerService } from "@queue-player/services";

const events = [VoiceMemberLeftEvent, VoiceMemberJoinedEvent, PlayerVoiceChannelChangedEvent];
type Events = InstanceType<(typeof events)[number]>;

@EventsHandler(...events)
export class VoiceChannelChangedListener implements IEventHandler<Events> {
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

    const hasUser = !!this.getUserCount(player);

    if (hasUser && player.disconnectTimeout) {
      clearTimeout(player.disconnectTimeout);
      player.disconnectTimeout = null;
    } else if (!hasUser && !player.disconnectTimeout) {
      player.disconnectTimeout = setTimeout(() => {
        if (this.getUserCount(player)) return;
        this.playerService.destroyPlayer(player, PlayerDestroyReason.AUTO_DISCONNECTED);
      }, AUTO_DISCONNECT_TIMEOUT);
    }
  }

  private getUserCount(player: QueuePlayer): number {
    return player.voiceChannel.members.filter((m) => !m.user.bot).size;
  }
}
