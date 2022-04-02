import { UseCase } from "@core";
import { VideoCompact } from "@modules/youtube/domains/VideoCompact";
import { VideoCompactDto } from "@modules/youtube/dto/VideoCompactDto";
import { DIYoutubeProvider, IYoutubeProvider } from "@modules/youtube/providers/IYoutubeProvider";
import { inject, injectable } from "tsyringe";
import { SearchVideoParams } from "./SearchVideoAdapter";

type Response = VideoCompact[];

@injectable()
export class SearchVideoUseCase extends UseCase<SearchVideoParams, Response> {
	constructor(@inject(DIYoutubeProvider) private youtubeProvider: IYoutubeProvider) {
		super();
	}

	public async run(params: SearchVideoParams): Promise<Response> {
		const { keyword } = params;

		const videos = await this.youtubeProvider.searchVideo(keyword);

		return videos.map(VideoCompactDto.create);
	}
}
