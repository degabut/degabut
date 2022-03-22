import Joi from "joi";
import { inject, injectable } from "tsyringe";
import { UseCase } from "../../../core";
import { Lyric, LyricProvider } from "../../lyric";
import { ILyricProvider } from "../../lyric/providers/ILyricProvider";

interface Params {
	keyword: string;
}

type Response = Lyric;

@injectable()
export class GetLyricUseCase extends UseCase<Params, Response> {
	public paramsSchema = Joi.object<Params>({
		keyword: Joi.string().required(),
	}).required();

	constructor(@inject(LyricProvider) private lyricProvider: ILyricProvider) {
		super();
	}

	public async run(params: Params): Promise<Response> {
		const { keyword } = params;

		const lyric = await this.lyricProvider.getLyric(keyword);
		if (!lyric) throw new Error("Lyric not found");

		return lyric;
	}
}
