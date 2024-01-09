import { SpotifyTrack } from "@spotify/entities";
import { YoutubeVideoCompact } from "@youtube/entities";
import { v4 } from "uuid";

interface ConstructorProps {
  id?: string;
  playedYoutubeVideoId?: string | null;
  youtubeVideoId?: string;
  spotifyTrackId?: string;
  updatedAt?: Date;
  youtubeVideo?: YoutubeVideoCompact;
  spotifyTrack?: SpotifyTrack;
}

export enum MediaSourceType {
  YOUTUBE = "youtube",
  SPOTIFY = "spotify",
}

export class MediaSource {
  public readonly id: string;
  public playedYoutubeVideoId: string | null = null;
  public readonly youtubeVideoId?: string;
  public readonly spotifyTrackId?: string;
  public updatedAt: Date;
  public youtubeVideo?: YoutubeVideoCompact;
  public spotifyTrack?: SpotifyTrack;

  constructor(props: ConstructorProps) {
    this.id = props.id || v4();
    this.youtubeVideoId = props.youtubeVideoId;
    this.spotifyTrackId = props.spotifyTrackId;
    this.playedYoutubeVideoId = props.playedYoutubeVideoId || null;
    this.updatedAt = props.updatedAt || new Date();
    this.youtubeVideo = props.youtubeVideo;
    this.spotifyTrack = props.spotifyTrack;
  }

  static fromYoutube(id: string): MediaSource;
  static fromYoutube(video: YoutubeVideoCompact): MediaSource;
  static fromYoutube(idOrVideo: string | YoutubeVideoCompact) {
    const id = typeof idOrVideo === "string" ? idOrVideo : idOrVideo.id;
    const video = typeof idOrVideo === "string" ? undefined : idOrVideo;

    return new MediaSource({
      id: `${MediaSourceType.YOUTUBE}/${id}`,
      youtubeVideoId: id,
      youtubeVideo: video,
    });
  }

  static fromSpotify(id: string): MediaSource;
  static fromSpotify(track: SpotifyTrack): MediaSource;
  static fromSpotify(idOrTrack: string | SpotifyTrack) {
    const id = typeof idOrTrack === "string" ? idOrTrack : idOrTrack.id;
    const track = typeof idOrTrack === "string" ? undefined : idOrTrack;

    return new MediaSource({
      id: `${MediaSourceType.SPOTIFY}/${id}`,
      spotifyTrackId: id,
      spotifyTrack: track,
    });
  }

  static fromSource(source: YoutubeVideoCompact | SpotifyTrack) {
    if (source instanceof SpotifyTrack) return MediaSource.fromSpotify(source);
    return MediaSource.fromYoutube(source);
  }

  public get title(): string {
    if (this.youtubeVideo) return this.youtubeVideo.title;
    if (this.spotifyTrack) return this.spotifyTrack.name;
    return "";
  }

  public get creator(): string {
    if (this.youtubeVideo) return this.youtubeVideo.channel?.name || "";
    if (this.spotifyTrack?.artists) {
      return this.spotifyTrack.artists.map((a) => a.name).join(", ") || "";
    }
    return "";
  }

  public get sourceId(): string {
    if (this.youtubeVideo) return this.youtubeVideo.id;
    if (this.spotifyTrack) return this.spotifyTrack.id;
    return "";
  }

  public get duration(): number {
    if (this.youtubeVideo) return this.youtubeVideo.duration;
    if (this.spotifyTrack) return this.spotifyTrack.duration;
    return 0;
  }

  public get type(): MediaSourceType {
    if (this.spotifyTrack) return MediaSourceType.SPOTIFY;
    return MediaSourceType.YOUTUBE;
  }

  public get maxThumbnailUrl(): string | undefined {
    const thumbnails = this.youtubeVideo?.thumbnails || this.spotifyTrack?.album?.images;
    return thumbnails?.sort((a, b) => b.width - a.width).at(0)?.url;
  }

  public get minThumbnailUrl(): string | undefined {
    const thumbnails = this.youtubeVideo?.thumbnails || this.spotifyTrack?.album?.images;
    return thumbnails?.sort((a, b) => a.width - b.width).at(0)?.url;
  }

  public get url(): string {
    if (this.youtubeVideo) return `https://youtu.be/${this.youtubeVideo.id}`;
    if (this.spotifyTrack) return `https://open.spotify.com/track/${this.spotifyTrack.id}`;
    return "";
  }
}
