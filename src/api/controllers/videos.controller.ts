import { Controller, Get, Param, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetVideoQuery } from "@youtube/queries/get-video/get-video.query";
import { SearchVideoQuery } from "@youtube/queries/search-video/search-video.query";

@Controller("videos")
export class VideosController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("/:id")
  getVideo(@Param() params: any) {
    return this.queryBus.execute(new GetVideoQuery({ id: params.id }));
  }

  @Get("/")
  searchVideo(@Query() query: any) {
    return this.queryBus.execute(new SearchVideoQuery({ keyword: query.keyword }));
  }
}
