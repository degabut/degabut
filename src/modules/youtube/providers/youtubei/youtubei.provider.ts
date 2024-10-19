import { Injectable } from "@nestjs/common";
import { YoutubeChannel, YoutubeVideo, YoutubeVideoCompact } from "@youtube/entities";
import { MAX_PLAYLIST_VIDEOS_PAGE } from "@youtube/youtube.constants";
import {
  LiveVideo,
  MixPlaylist,
  Client as YoutubeiClient,
  Video as YoutubeiVideo,
  VideoCompact as YoutubeiVideoCompact,
} from "youtubei";

import { IYoutubeiProvider } from "./youtubei.interface";

@Injectable()
export class YoutubeiProvider implements IYoutubeiProvider {
  private readonly youtubeClient: YoutubeiClient;

  constructor(refreshToken?: string) {
    this.youtubeClient = new YoutubeiClient({
      oauth: refreshToken
        ? {
            enabled: true,
            refreshToken,
          }
        : undefined,
    });
  }

  public async searchVideo(keyword: string): Promise<YoutubeVideoCompact[]> {
    const videos = await this.youtubeClient.search(keyword, { type: "video" });
    return videos.items.map(this.videoCompactToEntity);
  }

  public async searchOneVideo(keyword: string): Promise<YoutubeVideoCompact | undefined> {
    const video = (await this.youtubeClient.search(keyword, { type: "video" })).items.at(0);
    return video ? this.videoCompactToEntity(video) : undefined;
  }

  public async getVideo(id: string): Promise<YoutubeVideo | undefined> {
    const video = await this.youtubeClient.getVideo(id);
    if (!video) return;

    return this.videoToEntity(video);
  }

  public async getPlaylistVideos(youtubePlaylistId: string): Promise<YoutubeVideoCompact[]> {
    const playlist = await this.youtubeClient.getPlaylist(youtubePlaylistId);
    if (!playlist) return [];
    if (playlist instanceof MixPlaylist) return playlist.videos.map(this.videoCompactToEntity);

    await playlist.videos.next(MAX_PLAYLIST_VIDEOS_PAGE - 1);
    return playlist.videos.items.map(this.videoCompactToEntity);
  }

  private videoToEntity(video: YoutubeiVideo | LiveVideo) {
    const channel = video.channel
      ? new YoutubeChannel({
          id: video.channel.id,
          name: video.channel.name,
          thumbnails: video.channel.thumbnails || [],
        })
      : null;

    const entity = new YoutubeVideo({
      id: video.id,
      title: video.title,
      duration: "duration" in video ? video.duration || 0 : 0,
      thumbnails: video.thumbnails,
      viewCount: video.viewCount || null,
      channel,
      related: video.related.items
        .filter((r): r is YoutubeiVideoCompact => r instanceof YoutubeiVideoCompact)
        .map(this.videoCompactToEntity),
    });
    return entity;
  }

  private videoCompactToEntity(video: YoutubeiVideoCompact): YoutubeVideoCompact {
    return new YoutubeVideoCompact({
      id: video.id,
      title: video.title,
      duration: "duration" in video ? video.duration || 0 : 0,
      thumbnails: video.thumbnails,
      viewCount: video.viewCount || null,
      channel: video.channel
        ? new YoutubeChannel({
            id: video.channel.id,
            name: video.channel.name,
            thumbnails: video.channel.thumbnails || [],
          })
        : null,
    });
  }
}
