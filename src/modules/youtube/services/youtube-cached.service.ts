import { TimeUtil } from "@common/utils";
import { Logger } from "@logger/logger.service";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { YoutubeChannel, YoutubeVideo, YoutubeVideoCompact } from "@youtube/entities";
import { YoutubeEmbedProvider } from "@youtube/providers/youtube-embed.provider";
import { IYoutubeiProvider } from "@youtube/providers/youtubei/youtubei.interface";
import { YoutubeChannelRepository, YoutubeVideoRepository } from "@youtube/repositories";
import { MAX_VIDEO_AGE, YOUTUBEI_PROVIDER } from "@youtube/youtube.constants";

@Injectable()
export class YoutubeCachedService {
  constructor(
    private readonly videoRepository: YoutubeVideoRepository,
    private readonly channelRepository: YoutubeChannelRepository,
    @Inject(forwardRef(() => YOUTUBEI_PROVIDER))
    private readonly youtubeProvider: IYoutubeiProvider,
    private readonly youtubeEmbedProvider: YoutubeEmbedProvider,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(YoutubeCachedService.name);
  }

  async getVideo(videoId: string): Promise<YoutubeVideoCompact | undefined> {
    let video: YoutubeVideoCompact | undefined = await this.videoRepository.getById(videoId);
    if (!video || TimeUtil.getSecondDifference(video.updatedAt, new Date()) > MAX_VIDEO_AGE) {
      const newVideo = await this.youtubeProvider.getVideo(videoId);
      if (newVideo) {
        video = this.videoToVideoCompact(newVideo);
        await this.cacheVideo(video);
      }
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

  async cacheVideo(
    video: YoutubeVideoCompact | YoutubeVideoCompact[],
    options?: { ignoreEmbedFetch: boolean; newOnly?: boolean },
  ): Promise<void> {
    const ignoreEmbedFetch = options?.ignoreEmbedFetch ?? false;
    const videos = Array.isArray(video) ? video : [video];

    // fetch embed only if passing single video
    if (!ignoreEmbedFetch && videos.length === 1) {
      try {
        // YouTube with its infinite wisdom decided to auto translate video titles
        // this fetches the original title from the embed API to store in the database
        const embedVideo = await this.youtubeEmbedProvider.getVideo(videos[0].id);
        if (embedVideo) videos[0].title = embedVideo.title;
      } catch (e) {
        this.logger.error({ error: "Fetch embed error", e });
      }
    }

    const channels = videos.map((v) => v.channel).filter((c): c is YoutubeChannel => !!c);
    const uniqueChannelsMap = new Map<string, YoutubeChannel>();
    for (const channel of channels) {
      uniqueChannelsMap.set(channel.id, channel);
    }
    const uniqueChannels = [...uniqueChannelsMap.values()];

    await Promise.all([
      this.videoRepository.upsert(videos, options?.newOnly),
      uniqueChannels.length && this.channelRepository.upsert(uniqueChannels, options?.newOnly),
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
      musicMetadata: video.musicMetadata || null,
    });
  }
}
