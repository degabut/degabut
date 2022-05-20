import { Lyric } from "../entities/Lyric";

export interface ILyricProvider {
	getLyric(keyword: string): Promise<Lyric | undefined>;
}
