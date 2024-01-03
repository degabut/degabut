import { TimeUtil } from "@common/utils";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { YoutubeChannel, YoutubeVideo, YoutubeVideoCompact } from "@youtube/entities";
import { YoutubeEmbedProvider } from "@youtube/providers";
import { IYoutubeiProvider } from "@youtube/providers/youtubei/youtubei.interface";
import { YoutubeChannelRepository, YoutubeVideoRepository } from "@youtube/repositories";
import { MAX_VIDEO_AGE, YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";

@Injectable()
export class YoutubeCachedService {
  private readonly logger = new Logger(YoutubeCachedService.name);

  constructor(
    private readonly videoRepository: YoutubeVideoRepository,
    private readonly channelRepository: YoutubeChannelRepository,
    @Inject(YOUTUBEI_PROVIDER)
    private readonly youtubeProvider: IYoutubeiProvider,
    private readonly youtubeEmbedProvider: YoutubeEmbedProvider,
  ) {}

  async getVideo(videoId: string): Promise<YoutubeVideoCompact | undefined> {
    let video: YoutubeVideoCompact | undefined = await this.videoRepository.getById(videoId);
    if (!video || TimeUtil.getSecondDifference(video.updatedAt, new Date()) > MAX_VIDEO_AGE) {
      const newVideo = await this.youtubeProvider.getVideo(videoId);
      if (!newVideo) return undefined;

      video = this.videoToVideoCompact(newVideo);
      await this.cacheVideo(video);
    }

    return video;
  }

  async searchOneVideo(
    keyword: string,
    matchDuration?: number,
  ): Promise<YoutubeVideoCompact | undefined> {
    const videos = await this.youtubeProvider.searchVideo(keyword);
    const video = !matchDuration
      ? videos.at(0)
      : videos.find((v) => Math.abs(v.duration - matchDuration) < 10);

    if (video) await this.cacheVideo(video);

    return video;
  }

  async cacheVideo(video: YoutubeVideoCompact) {
    try {
      // YouTube with its infinite wisdom decided to auto translate video titles
      // this fetches the original title from the embed API to store in the database
      const embedVideo = await this.youtubeEmbedProvider.getVideo(video.id);
      if (embedVideo) video.title = embedVideo.title;
    } catch (e) {
      this.logger.error({ error: "Fetch embed error", e });
    }

    await Promise.all([
      this.videoRepository.upsert(video),
      video.channel && this.channelRepository.upsert(video.channel),
    ]);
  }

  private videoToVideoCompact(video: YoutubeVideo): YoutubeVideoCompact {
    return new YoutubeVideoCompact({
      id: video.id,
      title: video.title,
      duration: video.duration || 0,
      channel: video.channel
        ? new YoutubeChannel({
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
