import { NotImplementedException } from "@nestjs/common";
import { SpotifyPlaylist, SpotifyTrack } from "@spotify/entities";

import { ISpotifyProvider } from "./spotify.interface";

export class SpotifyNotImplementedProvider implements ISpotifyProvider {
  getTrack(): Promise<SpotifyTrack | undefined> {
    throw new NotImplementedException("Spotify not implemented");
  }

  getPlaylist(): Promise<SpotifyPlaylist | undefined> {
    throw new NotImplementedException("Spotify not implemented");
  }

  getAlbum(): Promise<SpotifyPlaylist | undefined> {
    throw new NotImplementedException("Spotify not implemented");
  }
}
