import { load } from "cheerio";
import fetch from "node-fetch";
import QueryString from "qs";
import { Lyric } from "../entities/Lyric";
import { ILyricProvider } from "./ILyricProvider";

export class LyricProvider implements ILyricProvider {
	private static SITE = "azlyrics.com";
	private static SEARCH_ENGINE = "https://www.bing.com/search";

	public async getLyric(keyword: string): Promise<Lyric | undefined> {
		const url = await this.scrapeSearchEngine(keyword);
		if (!url) return;

		const lyric = await this.scrapeLyric(url);
		return lyric;
	}

	private async scrapeSearchEngine(keyword: string): Promise<string | undefined> {
		const params = QueryString.stringify({ q: `${keyword} site:${LyricProvider.SITE}` });
		const response = await fetch(`${LyricProvider.SEARCH_ENGINE}?${params}`, {
			headers: { "User-Agent": "-" },
		});

		const html = await response.text();

		const $ = load(html);
		const result = $("#b_results").find("li");
		const url = result.first().find("h2").find("a").attr("href");

		return url;
	}

	private async scrapeLyric(url: string): Promise<Lyric | undefined> {
		const response = await fetch(url);
		const html = await response.text();
		const $ = load(html);

		const container = $(".col-xs-12.col-lg-8.text-center");
		const [title, subtitle] = container
			.find("b")
			.map((_, b) => $(b).text())
			.get();
		const content = container.find("div:not([class])").first().text().trim();

		if (!title || !subtitle || !content) return;

		return {
			title: subtitle.slice(1, -1),
			author: title.substring(0, title.lastIndexOf(" ")),
			sourceUrl: url,
			content,
		};
	}
}
