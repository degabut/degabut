import { ValidateParams } from "@common/decorators";
import { BadRequestException, ForbiddenException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, IInferredCommandHandler } from "@nestjs/cqrs";
import { PlaylistRepository, PlaylistVideoRepository } from "@playlist/repositories";
import { Track } from "@queue/entities";
import { TracksAddedEvent } from "@queue/events";
import { MAX_QUEUE_TRACKS } from "@queue/queue.constants";
import { QueueRepository } from "@queue/repositories";
import { QueueService } from "@queue/services";
import { VideoCompact } from "@youtube/entities";
import { IYoutubeiProvider } from "@youtube/providers";
import { YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";

import { AddTracksCommand, AddTracksParamSchema, AddTracksResult } from "./add-tracks.command";

@CommandHandler(AddTracksCommand)
export class AddTracksHandler implements IInferredCommandHandler<AddTracksCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistVideoRepository: PlaylistVideoRepository,
    private readonly queueService: QueueService,
    @Inject(YOUTUBEI_PROVIDER)
    private readonly youtubeProvider: IYoutubeiProvider,
    private readonly eventBus: EventBus,
  ) {}

  @ValidateParams(AddTracksParamSchema)
  public async execute(params: AddTracksCommand): Promise<AddTracksResult> {
    const { playlistId, youtubePlaylistId, executor, voiceChannelId } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");

    const member = queue.getMember(executor.id);
    if (!member) throw new ForbiddenException("Missing permissions");

    let videos: VideoCompact[] = [];

    if (playlistId) {
      const playlist = await this.playlistRepository.getById(playlistId);
      if (!playlist) throw new NotFoundException("Playlist not found");
      if (playlist?.ownerId !== executor.id) throw new ForbiddenException("Missing permissions");

      const playlistVideos = await this.playlistVideoRepository.getByPlaylistId(playlist.id);
      videos = playlistVideos.map((pv) => pv.video!);
    } else if (youtubePlaylistId) {
      videos = await this.youtubeProvider.getPlaylistVideos(youtubePlaylistId);
    }

    if (!videos.length) throw new BadRequestException("Playlist is empty");

    const tracks = videos
      .slice(0, MAX_QUEUE_TRACKS - queue.tracks.length)
      .map((video) => new Track({ queue, video, requestedBy: member }));

    if (!tracks.length) throw new BadRequestException("Queue is full");

    queue.tracks.push(...tracks);
    this.eventBus.publish(new TracksAddedEvent({ queue, tracks, member }));

    if (!queue.nowPlaying) {
      queue.nextTrack = tracks[0];
      this.queueService.processQueue(queue);
    }

    return tracks.map((t) => t.id);
  }
}
