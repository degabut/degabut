import { Video, VideoCompact } from "@youtube/entities";

export interface IYoutubeiProvider {
  searchVideo(keyword: string): Promise<VideoCompact[]>;
  getVideo(id: string): Promise<Video | undefined>;
  getPlaylistVideos(youtubePlaylistId: string): Promise<VideoCompact[]>;
}
