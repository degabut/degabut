type YoutubeIds = {
  videoId?: string;
  playlistId?: string;
};

export class YoutubeUtil {
  static HOSTS = ["youtube.com", "youtu.be", "music.youtube.com"];

  static extractIds(urlString: string): YoutubeIds {
    try {
      const url = new URL(urlString);
      const host = url.host.replace(/^www\./, "");

      if (!YoutubeUtil.HOSTS.includes(host)) return {};

      const videoId = url.searchParams.get("v") || url.pathname.split("/").pop();
      const playlistId = url.searchParams.get("list") || undefined;

      return { videoId, playlistId };
    } catch {
      return {};
    }
  }
}
