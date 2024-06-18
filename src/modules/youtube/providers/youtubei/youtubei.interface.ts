import { YoutubeVideo, YoutubeVideoCompact } from "@youtube/entities";

export interface IYoutubeiProvider {
  searchVideo(keyword: string): Promise<YoutubeVideoCompact[]>;
  searchOneVideo(keyword: string): Promise<YoutubeVideoCompact | undefined>;
  getVideo(id: string): Promise<YoutubeVideo | undefined>;
  getPlaylistVideos(youtubePlaylistId: string): Promise<YoutubeVideoCompact[]>;
}
