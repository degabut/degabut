import { SpotifyAlbum, SpotifyPlaylist, SpotifyTrack } from "@spotify/entities";

export interface ISpotifyProvider {
  getTrack(id: string): Promise<SpotifyTrack | undefined>;
  getPlaylist(id: string): Promise<SpotifyPlaylist | undefined>;
  getAlbum(id: string): Promise<SpotifyAlbum | undefined>;
}
