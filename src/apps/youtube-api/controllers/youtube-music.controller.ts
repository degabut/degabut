import { AuthGuard } from "@auth/guards";
import { Controller, Get, NotFoundException, Param, Query, UseGuards } from "@nestjs/common";

import { MusicLyricsDto, MusicSongsDto } from "../dtos";
import { YoutubeiMusicProvider } from "../providers";
import { YoutubeApiDtoUtils } from "../utils";

type IdParams = {
  id: string;
};

type SearchQuery = {
  keyword: string;
};

type ContinuationQuery = {
  token: string;
};

@Controller({ path: "/music" })
export class YoutubeMusicController {
  constructor(private readonly youtubeiMusic: YoutubeiMusicProvider) {}

  @Get("/search")
  @UseGuards(AuthGuard)
  async search(@Query() query: SearchQuery) {
    const result = await this.youtubeiMusic.searchAll(query.keyword);
    return {
      top: result.top
        ? {
            item: YoutubeApiDtoUtils.toDto(result.top.item),
            more: result.top.more?.map((item) => YoutubeApiDtoUtils.toDto(item)) || null,
          }
        : null,
      shelves: result.shelves.map(({ title, items }) => ({
        title,
        items: items.map((item) => YoutubeApiDtoUtils.toDto(item)),
      })),
    };
  }

  @Get("/songs")
  @UseGuards(AuthGuard)
  async searchSong(@Query() query: SearchQuery) {
    const result = await this.youtubeiMusic.searchSong(query.keyword);
    return MusicSongsDto.create(result);
  }

  @Get("/songs/:id/lyrics")
  @UseGuards(AuthGuard)
  async getVideo(@Param() params: IdParams) {
    const lyrics = await this.youtubeiMusic.getLyrics(params.id);
    if (!lyrics) throw new NotFoundException();
    return MusicLyricsDto.create(lyrics);
  }

  @Get("/continuation/songs")
  @UseGuards(AuthGuard)
  async getPlaylistVideos(@Query() query: ContinuationQuery) {
    const songs = await this.youtubeiMusic.getSearchSongContinuation(query.token);
    return MusicSongsDto.create(songs);
  }
}
