type YoutubeIds = {
  videoId?: string;
  playlistId?: string;
};

export class YoutubeUtil {
  static HOSTS = ["youtube.com", "youtu.be"];

  static extractIds(urlString: string): YoutubeIds {
    try {
      const url = new URL(urlString);
      const [domain, tld] = url.hostname.split(".").slice(-2);
      const host = `${domain}.${tld}`;

      if (!YoutubeUtil.HOSTS.includes(host)) return {};

      const videoId =
        url.searchParams.get("v") ||
        (host === "youtube.be" ? url.pathname.split("/").pop() : undefined);
      const playlistId = url.searchParams.get("list") || undefined;

      return { videoId, playlistId };
    } catch {
      return {};
    }
  }
}
