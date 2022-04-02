import { GetVideoAdapter, GetVideoUseCase } from "@modules/youtube/useCases/GetVideoUseCase";
import { inject, injectable } from "tsyringe";
import { Controller, IRequest, ResponseStatus } from "../../core/Controller";

type Params = {
	id: string;
};

@injectable()
export class GetVideoController extends Controller<unknown, Params> {
	constructor(@inject(GetVideoUseCase) private GetVideo: GetVideoUseCase) {
		super();
	}

	async run({ params }: IRequest<unknown, Params>): Promise<void> {
		const adapter = new GetVideoAdapter({ id: params.id });
		const videos = await this.GetVideo.execute(adapter);

		this.status(ResponseStatus.OK).send(videos);
	}
}
