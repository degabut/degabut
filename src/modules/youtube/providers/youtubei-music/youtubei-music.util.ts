import { Image } from "@common/entities";
import { YoutubeVideoCompact } from "@youtube/entities";
import { MusicSongCompact, MusicVideoCompact } from "youtubei";

import {
  AllResultType,
  SearchAllResult,
  YoutubeMusicSong,
  YoutubeMusicVideo,
} from "./youtubei-music.interface";

export class YoutubeiMusicUtil {
  static searchResultToVideoCompact(result: SearchAllResult) {
    const items: AllResultType[] = [];
    if (result.top) items.push(result.top.item, ...result.top.more);
    items.push(...result.items);
    return items.filter(this.isMusicVideo);
  }

  private static isMusicVideo(item: AllResultType): item is YoutubeMusicSong | YoutubeMusicVideo {
    return (
      item instanceof MusicSongCompact ||
      item instanceof MusicVideoCompact ||
      ("duration" in item && "title" in item && "thumbnails" in item)
    );
  }

  static musicToVideoCompact(item: YoutubeMusicSong | YoutubeMusicVideo): YoutubeVideoCompact {
    const thumbnails = item.thumbnails.map((t) => new Image(t));

    return new YoutubeVideoCompact({
      id: item.id,
      title: item.title,
      duration: item.duration || 0,
      thumbnails,
      channel: null, // TODO implement this
      viewCount: null,
      musicMetadata: {
        imageUrl: thumbnails.at(-1)?.url || thumbnails[0]?.url || "",
        title: item.title,
        artist: item.artists?.map((a) => a.name).join(", ") || "",
        album: "album" in item ? item.album?.title : undefined,
      },
    });
  }
}
