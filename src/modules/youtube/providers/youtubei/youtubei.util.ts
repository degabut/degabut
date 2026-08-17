import { YoutubeChannel, YoutubeVideo, YoutubeVideoCompact } from "@youtube/entities";
import { LiveVideo, Video, VideoCompact as YoutubeiVideoCompact } from "youtubei";

export class YoutubeiUtil {
  static videoToEntity(video: Video | LiveVideo) {
    const channel = video.channel
      ? new YoutubeChannel({
          id: video.channel.id,
          name: video.channel.name,
          thumbnails: video.channel.thumbnails || [],
        })
      : null;

    const entity = new YoutubeVideo({
      id: video.id,
      title: video.title,
      duration: "duration" in video ? video.duration || 0 : 0,
      thumbnails: video.thumbnails,
      viewCount: video.viewCount || null,
      channel,
      related: video.related.items
        .filter((r): r is YoutubeiVideoCompact => r instanceof YoutubeiVideoCompact)
        .map(this.videoCompactToEntity),
      musicMetadata: "music" in video ? video.music : null,
    });
    return entity;
  }

  static videoCompactToEntity(video: YoutubeiVideoCompact | YoutubeVideo): YoutubeVideoCompact {
    return new YoutubeVideoCompact({
      id: video.id,
      title: video.title,
      duration: "duration" in video ? video.duration || 0 : 0,
      thumbnails: video.thumbnails,
      viewCount: video.viewCount || null,
      channel: video.channel
        ? new YoutubeChannel({
            id: video.channel.id,
            name: video.channel.name,
            thumbnails: video.channel.thumbnails || [],
          })
        : null,
      musicMetadata: "musicMetadata" in video ? video.musicMetadata || null : null,
    });
  }
}
