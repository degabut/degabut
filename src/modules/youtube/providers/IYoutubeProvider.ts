import { Video } from "../entities/Video";
import { VideoCompact } from "../entities/VideoCompact";

export const DIYoutubeProvider = Symbol("YoutubeProvider"); // TODO where to put this

export interface IYoutubeProvider {
	searchVideo(keyword: string): Promise<VideoCompact[]>;
	getVideo(id: string): Promise<Video | undefined>;
}
