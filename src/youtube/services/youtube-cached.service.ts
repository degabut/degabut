import { TimeUtil } from "@common/utils";
import { Injectable, Logger } from "@nestjs/common";
import { Channel, Video, VideoCompact } from "@youtube/entities";
import { YoutubeEmbedProvider, YoutubeiProvider } from "@youtube/providers";
import { ChannelRepository, VideoRepository } from "@youtube/repositories";
import { MAX_VIDEO_AGE } from "@youtube/youtube.constants";

@Injectable()
export class YoutubeCachedService {
  private readonly logger = new Logger(YoutubeCachedService.name);

  constructor(
    private readonly videoRepository: VideoRepository,
    private readonly channelRepository: ChannelRepository,
    private readonly youtubeProvider: YoutubeiProvider,
    private readonly youtubeEmbedProvider: YoutubeEmbedProvider,
  ) {}

  async getVideo(videoId: string): Promise<VideoCompact | undefined> {
    let video: VideoCompact | undefined = await this.videoRepository.getById(videoId);
    if (!video || TimeUtil.getSecondDifference(video.updatedAt, new Date()) > MAX_VIDEO_AGE) {
      const newVideo = await this.youtubeProvider.getVideo(videoId);
      if (!newVideo) return undefined;

      video = this.videoToVideoCompact(newVideo);
      await this.cacheVideo(video);
    }

    return video;
  }

  async searchOneVideo(keyword: string): Promise<VideoCompact | undefined> {
    const videos = await this.youtubeProvider.searchVideo(keyword);
    const firstVideo = videos.at(0);

    if (firstVideo) await this.cacheVideo(firstVideo);

    return firstVideo;
  }

  private async cacheVideo(video: VideoCompact) {
    try {
      // YouTube with its infinite wisdom decided to auto translate video titles
      // this fetches the original title from the embed API to store in the database
      const embedVideo = await this.youtubeEmbedProvider.getVideo(video.id);
      if (embedVideo) video.title = embedVideo.title;
    } catch (error) {
      this.logger.error(error);
    }

    await Promise.all([
      this.videoRepository.upsert(video),
      video.channel && this.channelRepository.upsert(video.channel),
    ]);
  }

  private videoToVideoCompact(video: Video): VideoCompact {
    return new VideoCompact({
      id: video.id,
      title: video.title,
      duration: video.duration || 0,
      channel: video.channel
        ? new Channel({
            id: video.channel.id,
            name: video.channel.name,
            thumbnails: video.channel.thumbnails || [],
          })
        : null,
      thumbnails: video.thumbnails,
      viewCount: video.viewCount || 0,
    });
  }
}
