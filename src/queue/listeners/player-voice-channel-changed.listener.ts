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
      members: player.voiceChannel.members.map(
        (m) =>
          new Member({
            id: m.id,
            username: m.user.username,
            nickname: m.nickname,
            displayName: m.displayName,
            discriminator: m.user.discriminator,
            avatar: m.user.avatarURL(),
          }),
      ),
    });

    this.queueRepository.save(queue);
    this.eventBus.publish(new QueueVoiceChannelChangedEvent({ queue }));
  }
}
