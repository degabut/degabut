import { LiveVideo, Video, VideoCompact } from "youtubei";

export interface IYoutubeProvider {
	searchVideo(keyword: string): Promise<VideoCompact[]>;
	getVideo(id: string): Promise<Video | LiveVideo | undefined>;
}
