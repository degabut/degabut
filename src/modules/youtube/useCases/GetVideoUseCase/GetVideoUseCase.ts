import { UseCase } from "@core";
import { VideoDto } from "@modules/youtube/dto/VideoDto";
import { DIYoutubeProvider, IYoutubeProvider } from "@modules/youtube/providers/IYoutubeProvider";
import { inject, injectable } from "tsyringe";
import { GetVideoParams } from "./GetVideoAdapter";

type Response = VideoDto | undefined;

@injectable()
export class GetVideoUseCase extends UseCase<GetVideoParams, Response> {
	constructor(@inject(DIYoutubeProvider) private youtubeProvider: IYoutubeProvider) {
		super();
	}

	public async run(params: GetVideoParams): Promise<Response> {
		const { id } = params;

		const video = await this.youtubeProvider.getVideo(id);

		return video ? VideoDto.create(video) : undefined;
	}
}
