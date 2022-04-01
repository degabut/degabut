import { UseCase } from "@core";
import { Lyric } from "@modules/lyric/domains/Lyric";
import { ILyricProvider } from "@modules/lyric/providers/ILyricProvider";
import { LyricProvider } from "@modules/lyric/providers/LyricProvider";
import { inject, injectable } from "tsyringe";
import { GetLyricParams } from "./GetLyricAdapter";

type Response = Lyric;

@injectable()
export class GetLyricUseCase extends UseCase<GetLyricParams, Response> {
	constructor(@inject(LyricProvider) private lyricProvider: ILyricProvider) {
		super();
	}

	public async run(params: GetLyricParams): Promise<Response> {
		const { keyword } = params;

		const lyric = await this.lyricProvider.getLyric(keyword);
		if (!lyric) throw new Error("Lyric not found");

		return lyric;
	}
}
