import { Injectable } from "@nestjs/common";
import { Channel, PlaylistCompact, Transcript, Video, VideoCompact } from "@youtube/entities";
import { MAX_PLAYLIST_VIDEOS_PAGE } from "@youtube/youtube.constants";
import {
  Client as YoutubeiClient,
  LiveVideo,
  MixPlaylist,
  PlaylistCompact as YoutubeiPlaylistCompact,
  Video as YoutubeiVideo,
  VideoCompact as YoutubeiVideoCompact,
} from "youtubei";

@Injectable()
export class YoutubeiProvider {
  private readonly youtubeClient = new YoutubeiClient();

  public async searchPlaylist(keyword: string): Promise<PlaylistCompact[]> {
    const playlist = await this.youtubeClient.search(keyword, { type: "playlist" });
    return playlist.items.map(this.playlistCompactToEntity);
  }

  public async searchVideo(keyword: string): Promise<VideoCompact[]> {
    const videos = await this.youtubeClient.search(keyword, { type: "video" });
    return videos.items.map(this.videoCompactToEntity);
  }

  public async getVideo(id: string): Promise<Video | undefined> {
    const video = await this.youtubeClient.getVideo(id);
    if (!video) return;

    return this.videoToEntity(video);
  }

  public async getVideoTranscript(id: string): Promise<Transcript[] | undefined> {
    const transcript = await this.youtubeClient.getVideoTranscript(id);
    return transcript?.map((t) => new Transcript(t));
  }

  public async getPlaylistVideos(youtubePlaylistId: string): Promise<VideoCompact[]> {
    const playlist = await this.youtubeClient.getPlaylist(youtubePlaylistId);
    if (!playlist) return [];
    if (playlist instanceof MixPlaylist) return playlist.videos.map(this.videoCompactToEntity);

    await playlist.videos.next(MAX_PLAYLIST_VIDEOS_PAGE - 1);
    return playlist.videos.items.map(this.videoCompactToEntity);
  }

  private videoToEntity(video: YoutubeiVideo | LiveVideo) {
    const channel = video.channel
      ? new Channel({
          id: video.channel.id,
          name: video.channel.name,
          thumbnails: video.channel.thumbnails || [],
        })
      : null;

    const entity = new Video({
      id: video.id,
      title: video.title,
      duration: "duration" in video ? video.duration || 0 : 0,
      thumbnails: video.thumbnails,
      viewCount: video.viewCount || null,
      channel,
      related: video.related.items
        .filter((r): r is YoutubeiVideoCompact => r instanceof YoutubeiVideoCompact)
        .map(this.videoCompactToEntity),
    });
    return entity;
  }

  private videoCompactToEntity(video: YoutubeiVideoCompact): VideoCompact {
    return new VideoCompact({
      id: video.id,
      title: video.title,
      duration: "duration" in video ? video.duration || 0 : 0,
      thumbnails: video.thumbnails,
      viewCount: video.viewCount || null,
      channel: video.channel
        ? new Channel({
            id: video.channel.id,
            name: video.channel.name,
            thumbnails: video.channel.thumbnails || [],
          })
        : null,
    });
  }

  private playlistCompactToEntity(playlist: YoutubeiPlaylistCompact) {
    return new PlaylistCompact({
      id: playlist.id,
      title: playlist.title,
      videoCount: playlist.videoCount,
      channel: playlist.channel
        ? new Channel({
            id: playlist.channel.id,
            name: playlist.channel.name,
            thumbnails: playlist.channel.thumbnails || [],
          })
        : null,
      thumbnails: playlist.thumbnails,
    });
  }
}
