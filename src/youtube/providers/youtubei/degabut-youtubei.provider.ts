import { HttpService } from "@nestjs/axios";
import { YoutubeChannel, YoutubeVideo, YoutubeVideoCompact } from "@youtube/entities";
import { MAX_PLAYLIST_VIDEOS_PAGE } from "@youtube/youtube.constants";
import { LiveVideo, Video, VideoCompact as YoutubeiVideoCompact } from "youtubei";

import { IYoutubeiProvider } from "./youtubei.interface";

type YoutubeiVideo = Video & {
  related: YoutubeiVideoCompact[];
};

type YoutubeiLiveVideo = LiveVideo & {
  related: YoutubeiVideoCompact[];
};

export class DegabutYoutubeiProvider implements IYoutubeiProvider {
  constructor(
    private readonly httpService: HttpService,
    private readonly baseUrl: string,
    private readonly authToken: string,
  ) {}

  public async searchVideo(keyword: string): Promise<YoutubeVideoCompact[]> {
    const response = await this.get("/videos", { keyword });
    return response.data.map(this.videoCompactToEntity) || [];
  }

  public async searchOneVideo(keyword: string): Promise<YoutubeVideoCompact | undefined> {
    const response = await this.get("/videos", { keyword });
    return this.videoCompactToEntity(response.data[0]) || undefined;
  }

  public async getVideo(id: string): Promise<YoutubeVideo | undefined> {
    const response = await this.get(`/videos/${id}`);
    if (response.status === 404) return;
    return this.videoToEntity(response.data) || undefined;
  }

  public async getPlaylistVideos(id: string): Promise<YoutubeVideoCompact[]> {
    const response = await this.get(`/playlists/${id}`);
    if (response.status === 404) return [];

    const { videos } = response.data;
    if (Array.isArray(videos)) return videos;

    let token = videos.continuation;
    const items = videos.items;

    for (let i = 0; i < MAX_PLAYLIST_VIDEOS_PAGE - 1; i++) {
      if (!token) break;
      const response = await this.get("/continuation/playlists-videos", { token });
      if (response.status === 404) break;

      token = response.data.continuation;
      items.push(...response.data.items);
    }

    return items.map(this.videoCompactToEntity);
  }

  private async get(path: string, params?: Record<string, string>) {
    const response = await this.httpService.axiosRef.get(this.baseUrl + path, {
      params,
      headers: { Authorization: "Bearer " + this.authToken },
    });
    return response;
  }

  private videoToEntity(video: YoutubeiVideo | YoutubeiLiveVideo) {
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
      related: video.related.map(this.videoCompactToEntity),
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
