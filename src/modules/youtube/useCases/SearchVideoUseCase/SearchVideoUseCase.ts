import { UseCase } from "@core";
import { IYoutubeProvider } from "@modules/youtube/providers/IYoutubeProvider";
import { YoutubeProvider } from "@modules/youtube/providers/YoutubeProvider";
import { inject, injectable } from "tsyringe";
import { VideoCompact } from "youtubei";
import { SearchVideoParams } from "./SearchVideoAdapter";

type Response = VideoCompact[];

@injectable()
export class SearchVideoUseCase extends UseCase<SearchVideoParams, Response> {
	constructor(@inject(YoutubeProvider) private youtubeProvider: IYoutubeProvider) {
		super();
	}

	public async run(params: SearchVideoParams): Promise<Response> {
		const { keyword } = params;

		const videos = await this.youtubeProvider.searchVideo(keyword);

		return videos;
	}
}
