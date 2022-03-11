import cheerio from "cheerio";
import fetch from "node-fetch";

/*
Comment from azlyrics.com website:

"Usage of azlyrics.com content by any third-party lyrics provider is prohibited by our licensing agreement. Sorry about that."

Use this at your own risk.
*/

type Response = {
	title: string;
	subtitle: string;
	content: string;
};

export const scrapeLyric = async (url: string): Promise<Response | undefined> => {
	const response = await fetch(url);
	const html = await response.text();
	const $ = cheerio.load(html);

	const container = $(".col-xs-12.col-lg-8.text-center");
	const [title, subtitle] = container
		.find("b")
		.map((_, b) => $(b).text())
		.get();
	const content = container.find("div:not([class])").first().text().trim();

	if (!title || !subtitle || !content) return;
	return { title, subtitle, content };
};
