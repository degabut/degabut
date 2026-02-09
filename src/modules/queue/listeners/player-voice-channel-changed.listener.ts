import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerVoiceChannelChangedEvent } from "@queue-player/events";
import { Member, VoiceChannel } from "@queue/entities";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(PlayerVoiceChannelChangedEvent)
export class PlayerVoiceChannelChangedListener
  implements IEventHandler<PlayerVoiceChannelChangedEvent>
{
  constructor(private readonly queueRepository: QueueRepository) {}

  public async handle({ player }: PlayerVoiceChannelChangedEvent): Promise<void> {
    const queue = this.queueRepository.getByGuildId(player.guild.id);
    if (!queue) return;

    this.queueRepository.deleteByVoiceChannelId(queue.voiceChannelId);

    queue.setVoiceChannel(
      new VoiceChannel({
        id: player.voiceChannel.id,
        name: player.voiceChannel.name,
        members: player.voiceChannel.members.map((m) =>
          Member.fromDiscordGuildMember(m, true, false),
        ),
      }),
    );

    this.queueRepository.save(queue);
  }
}
