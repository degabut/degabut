type SpotifyIds = {
  trackId?: string;
  playlistId?: string;
  albumId?: string;
};

export class SpotifyUtil {
  static HOSTS = ["open.spotify.com"];

  static extractIds(urlString: string): SpotifyIds {
    try {
      const url = new URL(urlString);
      const host = url.host.replace(/^www\./, "");

      if (!SpotifyUtil.HOSTS.includes(host)) return {};

      const [, type, id] = url.pathname.split("/");

      return {
        trackId: type === "track" ? id : undefined,
        playlistId: type === "playlist" ? id : undefined,
        albumId: type === "album" ? id : undefined,
      };
    } catch {
      return {};
    }
  }
}
