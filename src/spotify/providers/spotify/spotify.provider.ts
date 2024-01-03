import { Injectable } from "@nestjs/common";
import {
  SpotifyAlbum,
  SpotifyAlbumCompact,
  SpotifyArtist,
  SpotifyImage,
  SpotifyPlaylist,
  SpotifyTrack,
} from "@spotify/entities";
import { SimplifiedTrack, SpotifyApi, Track } from "@spotify/web-api-ts-sdk";

import { ISpotifyProvider } from "./spotify.interface";

@Injectable()
export class SpotifyProvider implements ISpotifyProvider {
  private readonly spotifyApi: SpotifyApi;

  constructor(clientId: string, clientSecret: string) {
    this.spotifyApi = SpotifyApi.withClientCredentials(clientId, clientSecret);
  }

  public async getTrack(id: string): Promise<SpotifyTrack | undefined> {
    try {
      const track = await this.spotifyApi.tracks.get(id);
      return this.trackToEntity(track);
    } catch {
      return undefined;
    }
  }

  public async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    const playlist = await this.spotifyApi.playlists.getPlaylist(playlistId);

    return new SpotifyPlaylist({
      id: playlist.id,
      name: playlist.name,
      images: playlist.images.map((i) => new SpotifyImage(i)),
      tracks: playlist.tracks.items // up to 100 tracks by default
        .filter((t) => t.track.type === "track") // ignore album
        .map((t) => this.trackToEntity(t.track as Track)),
    });
  }

  public async getAlbum(albumId: string): Promise<SpotifyAlbum> {
    const album = await this.spotifyApi.albums.get(albumId);

    return new SpotifyAlbum({
      id: album.id,
      name: album.name,
      images: album.images.map((i) => new SpotifyImage(i)),
      tracks: album.tracks.items.map((t) => this.trackToEntity({ ...t, album })),
    });
  }

  private trackToEntity(
    track: Track | (SimplifiedTrack & { album: SpotifyAlbumCompact }),
  ): SpotifyTrack {
    const { artists, album } = track;

    return new SpotifyTrack({
      id: track.id,
      name: track.name,
      artists: artists.map((a) => new SpotifyArtist({ id: a.id, name: a.name })),
      durationMs: track.duration_ms,
      albumId: album.id,
      album: new SpotifyAlbumCompact({
        id: album.id,
        name: album.name,
        images: album.images.map((i) => new SpotifyImage(i)),
      }),
    });
  }
}
