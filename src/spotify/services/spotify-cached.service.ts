import { TimeUtil } from "@common/utils";
import { Inject, Injectable } from "@nestjs/common";
import { SpotifyTrack } from "@spotify/entities";
import { ISpotifyProvider } from "@spotify/providers";
import {
  SpotifyAlbumRepository,
  SpotifyArtistRepository,
  SpotifyTrackArtistRepository,
  SpotifyTrackRepository,
} from "@spotify/repositories";
import { MAX_TRACK_AGE, SPOTIFY_PROVIDER } from "@spotify/spotify.constants";

@Injectable()
export class SpotifyCachedService {
  constructor(
    private readonly trackRepository: SpotifyTrackRepository,
    private readonly artistRepository: SpotifyArtistRepository,
    private readonly albumRepository: SpotifyAlbumRepository,
    private readonly trackArtistRepository: SpotifyTrackArtistRepository,
    @Inject(SPOTIFY_PROVIDER)
    private readonly spotifyProvider: ISpotifyProvider,
  ) {}

  async getTrack(trackId: string): Promise<SpotifyTrack | undefined> {
    let track = await this.trackRepository.getById(trackId);

    if (!track || TimeUtil.getSecondDifference(track.updatedAt, new Date()) > MAX_TRACK_AGE) {
      track = await this.spotifyProvider.getTrack(trackId);
      if (track) await this.cacheTrack(track);
    }

    return track;
  }

  async cacheTrack(track: SpotifyTrack) {
    if (track.album) await this.albumRepository.upsert(track.album);

    await this.trackRepository.upsert(track);

    if (track.artists) {
      await this.artistRepository.upsert(track.artists);
      await this.trackArtistRepository.upsert(
        track.id,
        track.artists.map((a) => a.id),
      );
    }
  }
}
