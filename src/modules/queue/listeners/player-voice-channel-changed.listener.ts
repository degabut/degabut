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

    const from = queue.voiceChannel;

    const newMembers = [
      ...player.voiceChannel.members.map((m) => Member.fromDiscordGuildMember(m, true)),
    ];
    const oldMembers = queue.voiceChannel.members
      .filter((m) => !newMembers.some((nm) => nm.id === m.id))
      .map((m) => {
        m.isInVoiceChannel = false;
        return m;
      });

    queue.voiceChannelId = player.voiceChannel.id;
    queue.voiceChannel = new VoiceChannel({
      id: player.voiceChannel.id,
      name: player.voiceChannel.name,
      members: [...newMembers, ...oldMembers],
    });

    const to = queue.voiceChannel;

    this.queueRepository.save(queue);
    this.eventBus.publish(new QueueVoiceChannelChangedEvent({ queue, from, to }));
  }
}
