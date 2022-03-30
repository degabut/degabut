import { injectable } from "tsyringe";
import { Client as YoutubeClient, LiveVideo, Video, VideoCompact } from "youtubei";
import { IYoutubeProvider } from "./IYoutubeProvider";

@injectable()
export class YoutubeProvider implements IYoutubeProvider {
	constructor(private youtubeClient: YoutubeClient) {}

	public async searchVideo(keyword: string): Promise<VideoCompact[]> {
		const videos = await this.youtubeClient.search(keyword, { type: "video" });
		return videos;
	}

	public async getVideo(id: string): Promise<Video | LiveVideo | undefined> {
		const video = await this.youtubeClient.getVideo(id);
		if (!video) return;
		return video;
	}
}
