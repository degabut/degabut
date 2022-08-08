import { ValidateParams } from "@common/decorators";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { Track } from "@queue/entities";
import { TrackAddedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";
import { QueueService } from "@queue/services";
import { YoutubeiProvider } from "@youtube/providers";

import { AddTrackCommand, AddTrackParamSchema, AddTrackResult } from "./add-track.command";

@CommandHandler(AddTrackCommand)
export class AddTrackHandler implements IInferredCommandHandler<AddTrackCommand> {
  constructor(
    private readonly youtubeProvider: YoutubeiProvider,
    private readonly queueRepository: QueueRepository,
    private readonly queueService: QueueService,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(AddTrackParamSchema)
  public async execute(params: AddTrackCommand): Promise<AddTrackResult> {
    const { keyword, videoId, requestedBy, voiceChannelId } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");

    const video = keyword
      ? (await this.youtubeProvider.searchVideo(keyword)).shift()
      : videoId
      ? await this.youtubeProvider.getVideo(videoId)
      : undefined;

    if (!video) throw new BadRequestException("Video not found");

    const track = new Track({
      queue,
      video,
      requestedBy,
    });

    const isPlayedImmediately = !queue.nowPlaying;
    if (queue.tracks.length >= 250) throw new BadRequestException("Queue is full");

    queue.tracks.push(track);
    this.eventBus.publish(new TrackAddedEvent({ track, isPlayedImmediately }));

    if (!queue.nowPlaying) this.queueService.processQueue(queue);

    return track.id;
  }
}
