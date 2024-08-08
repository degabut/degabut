import { AuthGuard } from "@auth/guards";
import { Controller, Get, NotFoundException, Param, Query, UseGuards } from "@nestjs/common";
import { Playlist, PlaylistCompact } from "youtubei";

import {
  MixPlaylistDto,
  PlaylistCompactDto,
  PlaylistDto,
  PlaylistVideosDto,
  VideoCompactDto,
  VideoDto,
} from "../dtos";
import { YoutubeiProvider } from "../providers";

type IdParams = {
  id: string;
};

type SearchQuery = {
  keyword: string;
};

type ContinuationQuery = {
  token: string;
};

@Controller()
export class YoutubeController {
  constructor(private readonly youtubei: YoutubeiProvider) {}

  @Get("/search")
  @UseGuards(AuthGuard)
  async search(@Query() query: SearchQuery) {
    const result = await this.youtubei.search(query.keyword);
    return result.map((r) =>
      r instanceof PlaylistCompact ? PlaylistCompactDto.create(r) : VideoCompactDto.create(r),
    );
  }

  @Get("/videos/:id")
  @UseGuards(AuthGuard)
  async getVideo(@Param() params: IdParams) {
    const video = await this.youtubei.getVideo(params.id);
    if (!video) throw new NotFoundException();
    return VideoDto.create(video);
  }

  @Get("/videos")
  @UseGuards(AuthGuard)
  async searchVideo(@Query() query: SearchQuery) {
    const videos = await this.youtubei.searchVideo(query.keyword);
    return videos.map(VideoCompactDto.create);
  }

  @Get("/playlists")
  @UseGuards(AuthGuard)
  async searchPlaylist(@Query() query: SearchQuery) {
    const playlists = await this.youtubei.searchPlaylist(query.keyword);
    return playlists.map(PlaylistCompactDto.create);
  }

  @Get("/playlists/:id")
  @UseGuards(AuthGuard)
  async getPlaylist(@Param() params: IdParams) {
    const playlist = await this.youtubei.getPlaylist(params.id);
    if (!playlist) throw new NotFoundException();
    return playlist instanceof Playlist
      ? PlaylistDto.create(playlist)
      : MixPlaylistDto.create(playlist);
  }

  @Get("/continuation/playlists-videos")
  @UseGuards(AuthGuard)
  async getPlaylistVideos(@Query() query: ContinuationQuery) {
    const playlistVideos = await this.youtubei.getPlaylistVideosContinuation(query.token);
    return PlaylistVideosDto.create(playlistVideos);
  }
}
