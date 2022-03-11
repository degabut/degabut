import cheerio from "cheerio";
import fetch from "node-fetch";
import qs from "qs";

const SITE = "azlyrics.com";
const SEARCH_ENGINE = "https://www.bing.com/search";

export const scrapeSearchEngine = async (keyword: string): Promise<string | undefined> => {
	const params = qs.stringify({ q: `${keyword} site:${SITE}` });
	const response = await fetch(`${SEARCH_ENGINE}?${params}`, { headers: { "User-Agent": "-" } });

	const html = await response.text();

	const $ = cheerio.load(html);
	const result = $("#b_results").find("li");
	const url = result.first().find("h2").find("a").attr("href");

	return url;
};
