import { SpotifyTrackRepositoryMapper } from "@spotify/repositories";
import { YoutubeVideoRepositoryMapper } from "@youtube/repositories";

import { MediaSource } from "../../entities";
import { MediaSourceModel, MediaSourceModelProps } from "./media-source.model";

export class MediaSourceRepositoryMapper {
  public static toRepository(entity: MediaSource): MediaSourceModelProps {
    return entity;
  }

  public static toDomainEntity(props: MediaSourceModel): MediaSource {
    const entity = new MediaSource({
      ...props,
      youtubeVideoId: props.youtubeVideoId || undefined,
      spotifyTrackId: props.spotifyTrackId || undefined,
      youtubeVideo: props.youtubeVideo
        ? YoutubeVideoRepositoryMapper.toDomainEntity(props.youtubeVideo)
        : undefined,
      spotifyTrack: props.spotifyTrack
        ? SpotifyTrackRepositoryMapper.toDomainEntity(props.spotifyTrack)
        : undefined,
    });

    return entity;
  }
}
