import { AuthGuard } from "@api/guards";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetVideoQuery } from "@youtube/queries/get-video/get-video.query";
import { SearchVideoQuery } from "@youtube/queries/search-video/search-video.query";

// TODO remove this, replaced by YoutubeController
@Controller("videos")
export class VideosController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("/:id")
  @UseGuards(AuthGuard)
  getVideo(@Param() params: any) {
    return this.queryBus.execute(new GetVideoQuery({ id: params.id }));
  }

  @Get("/")
  @UseGuards(AuthGuard)
  searchVideo(@Query() query: any) {
    return this.queryBus.execute(new SearchVideoQuery({ keyword: query.keyword }));
  }
}
