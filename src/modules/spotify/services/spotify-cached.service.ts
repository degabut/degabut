import { TimeUtil } from "@common/utils";
import { Inject, Injectable } from "@nestjs/common";
import { SpotifyAlbumCompact, SpotifyArtist, SpotifyTrack } from "@spotify/entities";
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

  async getTracks(trackIds: string[], cacheOnly = false): Promise<SpotifyTrack[]> {
    if (!trackIds.length) return [];

    const tracks = await this.trackRepository.getByIds(trackIds);
    if (cacheOnly) return tracks;

    const tracksMap = new Map(tracks.map((t) => [t.id, t]));
    const staleIds = trackIds.filter(
      (id) =>
        !tracksMap.has(id) ||
        TimeUtil.getSecondDifference(tracksMap.get(id)!.updatedAt, new Date()) > MAX_TRACK_AGE,
    );

    if (staleIds.length) {
      const freshTracks = (
        await Promise.all(staleIds.map((id) => this.spotifyProvider.getTrack(id)))
      ).filter((t): t is SpotifyTrack => !!t);

      await this.cacheTrack(freshTracks);
      for (const track of freshTracks) tracksMap.set(track.id, track);
    }

    return trackIds.map((id) => tracksMap.get(id)).filter((t): t is SpotifyTrack => !!t);
  }

  async cacheTrack(track: SpotifyTrack | SpotifyTrack[]) {
    const tracks = Array.isArray(track) ? track : [track];

    const albums = tracks.map((t) => t.album).filter((a): a is SpotifyAlbumCompact => !!a);
    if (albums.length) await this.albumRepository.upsert(albums);

    await this.trackRepository.upsert(tracks);

    const artists = tracks.flatMap((t) => t.artists || []);
    const uniqueArtistsMap = new Map<string, SpotifyArtist>();
    for (const artist of artists) uniqueArtistsMap.set(artist.id, artist);

    if (uniqueArtistsMap.size) await this.artistRepository.upsert([...uniqueArtistsMap.values()]);

    await Promise.all(
      tracks
        .filter((t) => t.artists?.length)
        .map((t) =>
          this.trackArtistRepository.upsert(
            t.id,
            t.artists!.map((a) => a.id),
          ),
        ),
    );
  }
}
