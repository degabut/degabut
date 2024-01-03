import { ValidateParams } from "@common/decorators";
import { MediaSourceService } from "@media-source/services";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { Track } from "@queue/entities";
import { TrackAddedEvent } from "@queue/events";
import { MAX_QUEUE_TRACKS } from "@queue/queue.constants";
import { QueueRepository } from "@queue/repositories";
import { QueueService } from "@queue/services";

import { AddTrackCommand, AddTrackParamSchema, AddTrackResult } from "./add-track.command";

@CommandHandler(AddTrackCommand)
export class AddTrackHandler implements IInferredCommandHandler<AddTrackCommand> {
  constructor(
    private readonly mediaSourceService: MediaSourceService,
    private readonly queueRepository: QueueRepository,
    private readonly queueService: QueueService,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(AddTrackParamSchema)
  public async execute(params: AddTrackCommand): Promise<AddTrackResult> {
    const { youtubeKeyword, mediaSourceId, executor, voiceChannelId } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    const mediaSource = await this.mediaSourceService.getSource({ mediaSourceId, youtubeKeyword });
    if (!mediaSource) throw new BadRequestException("Media source not found");

    const track = new Track({
      queue,
      mediaSource,
      requestedBy: member,
    });

    const isPlayedImmediately = !queue.nowPlaying;
    if (queue.tracks.length >= MAX_QUEUE_TRACKS) throw new BadRequestException("Queue is full");

    queue.tracks.push(track);
    this.eventBus.publish(new TrackAddedEvent({ track, isPlayedImmediately, member }));

    if (!queue.nowPlaying) this.queueService.processQueue(queue);

    return track.id;
  }
}
