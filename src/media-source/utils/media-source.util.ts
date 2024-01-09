import { MediaSourceType } from "@media-source/entities";

export class MediaSourceUtil {
  static extractSourceId(id?: string) {
    if (!id) return { youtubeVideoId: undefined, spotifyTrackId: undefined };

    const [source, contentId] = id.split("/") as [MediaSourceType, string];
    return {
      youtubeVideoId: source === MediaSourceType.YOUTUBE ? contentId : undefined,
      spotifyTrackId: source === MediaSourceType.SPOTIFY ? contentId : undefined,
    };
  }
}
