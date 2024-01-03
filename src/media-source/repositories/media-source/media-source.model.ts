import { SpotifyTrackModel } from "@spotify/repositories";
import { YoutubeVideoModel } from "@youtube/repositories";
import { Model, RelationMappingsThunk, snakeCaseMappers } from "objection";

export type MediaSourceModelProps = {
  id: string;
  youtubeVideoId?: string | null;
  spotifyTrackId?: string | null;
  playedYoutubeVideoId?: string | null;
};

export class MediaSourceModel extends Model implements MediaSourceModelProps {
  id!: string;
  youtubeVideoId!: string | null;
  spotifyTrackId!: string | null;
  playedYoutubeVideoId!: string | null;

  youtubeVideo?: YoutubeVideoModel;
  spotifyTrack?: SpotifyTrackModel;

  static tableName = "media_source";
  static get idColumn() {
    return "id";
  }
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static relationMappings: RelationMappingsThunk = () => ({
    youtubeVideo: {
      relation: Model.HasOneRelation,
      modelClass: YoutubeVideoModel,
      join: {
        from: "media_source.youtube_video_id",
        to: "youtube_video.id",
      },
    },
    spotifyTrack: {
      relation: Model.HasOneRelation,
      modelClass: SpotifyTrackModel,
      join: {
        from: "media_source.spotify_track_id",
        to: "spotify_track.id",
      },
    },
  });
}
