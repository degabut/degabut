import { Inject, Injectable } from "@nestjs/common";

import { SpotifyTrackArtistModel } from "./spotify-track-artist.model";

@Injectable()
export class SpotifyTrackArtistRepository {
  constructor(
    @Inject(SpotifyTrackArtistModel)
    private readonly artistTrackModel: typeof SpotifyTrackArtistModel,
  ) {}

  public async upsert(trackId: string, artistIds: string[]): Promise<void> {
    await this.artistTrackModel
      .query()
      .insert(artistIds.map((artistId) => ({ trackId, artistId })))
      .onConflict(["track_id", "artist_id"])
      .merge()
      .returning("*");
  }
}
