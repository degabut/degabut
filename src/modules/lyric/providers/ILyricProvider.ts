import { Lyric } from "../domains";

export interface ILyricProvider {
	getLyric(keyword: string): Promise<Lyric | undefined>;
}
