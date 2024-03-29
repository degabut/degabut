import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerVoiceChannelChangedEvent } from "@queue-player/events";
import { Member, VoiceChannel } from "@queue/entities";
import { QueueVoiceChannelChangedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(PlayerVoiceChannelChangedEvent)
export class PlayerVoiceChannelChangedListener
  implements IEventHandler<PlayerVoiceChannelChangedEvent>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly queueRepository: QueueRepository,
  ) {}

  public async handle({ player }: PlayerVoiceChannelChangedEvent): Promise<void> {
    const queue = this.queueRepository.getByGuildId(player.guild.id);
    if (!queue) return;

    this.queueRepository.deleteByVoiceChannelId(queue.voiceChannelId);

    queue.voiceChannelId = player.voiceChannel.id;
    queue.voiceChannel = new VoiceChannel({
      id: player.voiceChannel.id,
      name: player.voiceChannel.name,
      members: player.voiceChannel.members.map((m) =>
        Member.fromDiscordGuildMember(
          m,
          queue.voiceChannel.members.find((m2) => m2.id === m.id)?.isInVoiceChannel ?? false,
        ),
      ),
    });

    this.queueRepository.save(queue);
    this.eventBus.publish(new QueueVoiceChannelChangedEvent({ queue }));
  }
}
