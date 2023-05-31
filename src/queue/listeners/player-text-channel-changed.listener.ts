import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerTextChannelChangedEvent } from "@queue-player/events";
import { TextChannel } from "@queue/entities";
import { QueueTextChannelChangedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(PlayerTextChannelChangedEvent)
export class PlayerTextChannelChangedListener
  implements IEventHandler<PlayerTextChannelChangedEvent>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly queueRepository: QueueRepository,
  ) {}

  public async handle({ player }: PlayerTextChannelChangedEvent): Promise<void> {
    const queue = this.queueRepository.getByGuildId(player.guild.id);
    if (!queue) return;

    queue.textChannel = player.textChannel
      ? new TextChannel({
          id: player.textChannel.id,
          name: player.textChannel.name,
        })
      : null;

    this.queueRepository.save(queue);
    this.eventBus.publish(new QueueTextChannelChangedEvent({ queue }));
  }
}
