import { UserPlayHistoryRepository } from "@history/repositories";
import { Logger } from "@nestjs/common";
import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PlayerReadyEvent } from "@queue-player/events";
import { Guild, Member, Queue, TextChannel, Track, VoiceChannel } from "@queue/entities";
import { QueueCreatedEvent } from "@queue/events";
import { MAX_QUEUE_HISTORY_TRACKS } from "@queue/queue.constants";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(PlayerReadyEvent)
export class PlayerReadyListener implements IEventHandler<PlayerReadyEvent> {
  private readonly logger = new Logger(PlayerReadyListener.name);

  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly playHistoryRepository: UserPlayHistoryRepository,
    private readonly eventBus: EventBus,
  ) {}

  public async handle({ player }: PlayerReadyEvent): Promise<void> {
    const queueExists = !!this.queueRepository.getByVoiceChannelId(player.voiceChannel.id);
    if (queueExists) {
      return this.logger.error({
        error: "Attempting to create a queue for a voice channel that already has one",
        voiceChannelId: player.voiceChannel.id,
      });
    }

    const queue = new Queue({
      guild: new Guild({
        id: player.guild.id,
        name: player.guild.name,
        icon: player.guild.iconURL(),
      }),
      voiceChannel: new VoiceChannel({
        id: player.voiceChannel.id,
        name: player.voiceChannel.name,
        members: player.voiceChannel.members
          .filter((m) => !m.user.bot)
          .map((m) => Member.fromDiscordGuildMember(m)),
      }),
      textChannel: player.textChannel
        ? new TextChannel({
            id: player.textChannel.id,
            name: player.textChannel.name,
          })
        : null,
    });

    const history = await this.playHistoryRepository.getLastPlayedByVoiceChannelId(
      player.voiceChannel.id,
      { count: MAX_QUEUE_HISTORY_TRACKS, includeContent: true },
    );

    queue.history = history.reduce<Track[]>((curr, { mediaSource }) => {
      if (mediaSource) curr.push(new Track({ queue, mediaSource }));
      return curr;
    }, []);

    this.queueRepository.save(queue);

    this.eventBus.publish(new QueueCreatedEvent({ queue }));
  }
}
