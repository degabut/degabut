import { AuthGuard } from "@api/guards";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetVideoQuery, SearchPlaylistQuery, SearchVideoQuery } from "@youtube/queries";

type VideoIdParams = {
  id: string;
};

type SearchQuery = {
  keyword: string;
};

@Controller("youtube")
export class YoutubeController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("/videos/:id")
  @UseGuards(AuthGuard)
  getVideo(@Param() params: VideoIdParams) {
    return this.queryBus.execute(new GetVideoQuery(params));
  }

  @Get("/videos")
  @UseGuards(AuthGuard)
  searchVideo(@Query() query: SearchQuery) {
    return this.queryBus.execute(new SearchVideoQuery(query));
  }

  @Get("/playlists")
  @UseGuards(AuthGuard)
  searchPlaylist(@Query() query: SearchQuery) {
    return this.queryBus.execute(new SearchPlaylistQuery(query));
  }
}
