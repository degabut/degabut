import { UseCase } from "@core";
import Joi from "joi";
import { inject, injectable } from "tsyringe";
import { VideoCompact } from "youtubei";
import { IYoutubeProvider, YoutubeProvider } from "../../";

type Params = {
	keyword: string;
};

type Response = VideoCompact[];

@injectable()
export class SearchVideoUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		keyword: Joi.string().required(),
	}).required();

	constructor(@inject(YoutubeProvider) private youtubeProvider: IYoutubeProvider) {
		super();
	}

	public async run(params: Params): Promise<Response> {
		const { keyword } = params;

		const videos = await this.youtubeProvider.searchVideo(keyword);

		return videos;
	}
}
