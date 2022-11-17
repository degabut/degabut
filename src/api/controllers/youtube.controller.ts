import { AuthGuard } from "@api/guards";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetVideoQuery, SearchPlaylistQuery, SearchVideoQuery } from "@youtube/queries";

@Controller("youtube")
export class YoutubeController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("/videos/:id")
  @UseGuards(AuthGuard)
  getVideo(@Param() params: any) {
    return this.queryBus.execute(new GetVideoQuery({ id: params.id }));
  }

  @Get("/videos")
  @UseGuards(AuthGuard)
  searchVideo(@Query() query: any) {
    return this.queryBus.execute(new SearchVideoQuery({ keyword: query.keyword }));
  }

  @Get("/playlists")
  @UseGuards(AuthGuard)
  searchPlaylist(@Query() query: any) {
    return this.queryBus.execute(new SearchPlaylistQuery({ keyword: query.keyword }));
  }
}
