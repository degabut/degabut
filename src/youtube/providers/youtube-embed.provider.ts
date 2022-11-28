import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

interface RawVideoEmbed {
  title: string;
  author_name: string;
  author_url: string;
  type: string;
  height: number;
  width: number;
  thumbnail_height: number;
  thumbnail_width: number;
  thumbnail_url: string;
}

export interface VideoEmbed {
  title: string;
  authorName: string;
  authorUrl: string;
  type: string;
  height: number;
  width: number;
  thumbnailHeight: number;
  thumbnailWidth: number;
  thumbnailUrl: string;
}

@Injectable()
export class YoutubeEmbedProvider {
  constructor(private readonly httpService: HttpService) {}

  public async getVideo(videoId: string): Promise<VideoEmbed | undefined> {
    const url = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" + videoId;
    try {
      const response = await this.httpService.axiosRef.get<RawVideoEmbed>(url);
      if (response.status !== 200) return undefined;
      return {
        title: response.data.title,
        authorName: response.data.author_name,
        authorUrl: response.data.author_url,
        type: response.data.type,
        height: response.data.height,
        width: response.data.width,
        thumbnailHeight: response.data.thumbnail_height,
        thumbnailWidth: response.data.thumbnail_width,
        thumbnailUrl: response.data.thumbnail_url,
      };
    } catch {
      return undefined;
    }
  }
}
