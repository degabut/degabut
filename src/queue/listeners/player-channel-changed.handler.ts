import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerChannelChangedEvent } from "@queue-player/events";
import { Member, VoiceChannel } from "@queue/entities";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(PlayerChannelChangedEvent)
export class PlayerChannelChangedHandler implements IEventHandler<PlayerChannelChangedEvent> {
  constructor(private readonly queueRepository: QueueRepository) {}

  public async handle({ player }: PlayerChannelChangedEvent): Promise<void> {
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
  }
}
