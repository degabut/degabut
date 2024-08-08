import { HttpService } from "@nestjs/axios";

import { IYoutubeiMusicProvider, YoutubeMusicSong } from "./youtubei-music.interface";

export class DegabutYoutubeiMusicProvider implements IYoutubeiMusicProvider {
  constructor(
    private readonly httpService: HttpService,
    private readonly baseUrl: string,
    private readonly authToken: string,
  ) {}

  public async searchAll(keyword: string) {
    const response = await this.get("/music/search", { keyword });
    return response.data;
  }

  public async searchSong(keyword: string): Promise<YoutubeMusicSong[]> {
    const response = await this.get("/music/songs", { keyword });
    return response.data.items;
  }

  private async get(path: string, params?: Record<string, string>) {
    const response = await this.httpService.axiosRef.get(this.baseUrl + path, {
      params,
      headers: { Authorization: "Bearer " + this.authToken },
    });
    return response;
  }
}
