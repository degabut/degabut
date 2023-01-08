import { HttpService } from "@nestjs/axios";
import { Video, VideoCompact } from "@youtube/entities";
import { MAX_PLAYLIST_VIDEOS_PAGE } from "@youtube/youtube.constants";

import { IYoutubeiProvider } from "./youtubei.interface";

export class DegabutYoutubeiProvider implements IYoutubeiProvider {
  constructor(
    private readonly httpService: HttpService,
    private readonly baseUrl: string,
    private readonly authToken: string,
  ) {}

  public async searchVideo(keyword: string): Promise<VideoCompact[]> {
    const response = await this.get("/videos", { keyword });
    return response.data || [];
  }

  public async getVideo(id: string): Promise<Video | undefined> {
    const response = await this.get(`/videos/${id}`);
    if (response.status === 404) return;
    return response.data || undefined;
  }

  public async getPlaylistVideos(id: string): Promise<VideoCompact[]> {
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

    return items;
  }

  private async get(path: string, params?: Record<string, string>) {
    const response = await this.httpService.axiosRef.get(this.baseUrl + path, {
      params,
      headers: { Authorization: "Bearer " + this.authToken },
    });
    return response;
  }
}
