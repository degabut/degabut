import { Lyric } from "../domains/Lyric";

export interface ILyricProvider {
	getLyric(keyword: string): Promise<Lyric | undefined>;
}
