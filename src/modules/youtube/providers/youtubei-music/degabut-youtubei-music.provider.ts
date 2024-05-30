import { HttpService } from "@nestjs/axios";
import { YoutubeSong } from "@youtube/entities";

import { IYoutubeiMusicProvider } from "./youtubei-music.interface";

export class DegabutYoutubeiMusicProvider implements IYoutubeiMusicProvider {
  constructor(
    private readonly httpService: HttpService,
    private readonly baseUrl: string,
    private readonly authToken: string,
  ) {}

  public async searchSong(keyword: string): Promise<YoutubeSong[]> {
    const response = await this.get("/music/songs", { keyword });
    return response.data.items.map((s: { id: string }) => new YoutubeSong({ id: s.id }));
  }

  private async get(path: string, params?: Record<string, string>) {
    const response = await this.httpService.axiosRef.get(this.baseUrl + path, {
      params,
      headers: { Authorization: "Bearer " + this.authToken },
    });
    return response;
  }
}
