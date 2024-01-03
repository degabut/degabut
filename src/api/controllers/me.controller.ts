import { AuthUser, User } from "@api/decorators";
import { AuthGuard } from "@api/guards";
import { IPaginationQuery } from "@api/interfaces";
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetPlaylistsQuery } from "@playlist/queries";
import { GetQueueQuery } from "@queue/queries";
import {
  LikeMediaSourceCommand,
  RemovePlayHistoryCommand,
  UnlikeMediaSourceCommand,
} from "@user/commands";
import {
  GetLastPlayedQuery,
  GetLikedQuery,
  GetMostPlayedQuery,
  GetRecapQuery,
  IsLikedQuery,
} from "@user/queries";

type GetHistoryQuery =
  | {
      last: string;
    }
  | {
      count: string;
      days: string;
    };

type GetSelfHistoryQuery = GetHistoryQuery & { guild: string; voiceChannel: string };

type MediaSourceIdParams = {
  mediaSourceId: string;
};

type MediaSourceIdsParams = {
  mediaSourceIds: string[];
};

type GetLikedParam = IPaginationQuery & { keyword?: string };

type YearParams = {
  year?: string;
};

@Controller("me")
export class MeController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  @Get("/play-history")
  @UseGuards(AuthGuard)
  getSelfHistories(@Query() query: GetSelfHistoryQuery, @User() executor: AuthUser) {
    const selections =
      query.guild === "true"
        ? { guild: true as const }
        : query.voiceChannel === "true"
        ? { voiceChannel: true as const }
        : { userId: executor.id };

    return "last" in query
      ? this.queryBus.execute(
          new GetLastPlayedQuery({
            count: +query.last,
            executor,
            ...selections,
          }),
        )
      : this.queryBus.execute(
          new GetMostPlayedQuery({
            count: +query.count,
            days: +query.days,
            executor,
            ...selections,
          }),
        );
  }

  @Get("/playlists")
  @UseGuards(AuthGuard)
  getSelfPlaylists(@User() executor: AuthUser) {
    return this.queryBus.execute(new GetPlaylistsQuery({ executor }));
  }

  @Get("/queue")
  @UseGuards(AuthGuard)
  getSelfQueue(@User() executor: AuthUser) {
    return this.queryBus.execute(new GetQueueQuery({ executor }));
  }

  @Delete("/play-history/:mediaSourceId")
  @UseGuards(AuthGuard)
  removePlayHistory(@Param() params: MediaSourceIdParams, @User() executor: AuthUser) {
    return this.commandBus.execute(new RemovePlayHistoryCommand({ executor, ...params }));
  }

  @Get("/liked")
  @UseGuards(AuthGuard)
  getLiked(@User() executor: AuthUser, @Query() query: GetLikedParam) {
    return this.queryBus.execute(
      new GetLikedQuery({
        executor,
        limit: query.limit ? +query.limit : 50,
        nextToken: query.nextToken,
        keyword: query.keyword,
      }),
    );
  }

  @Post("/liked")
  @UseGuards(AuthGuard)
  like(@Body() body: MediaSourceIdParams, @User() executor: AuthUser) {
    return this.commandBus.execute(new LikeMediaSourceCommand({ executor, ...body }));
  }

  @Delete("/liked/:mediaSourceId")
  @UseGuards(AuthGuard)
  unlike(@Param() params: MediaSourceIdParams, @User() executor: AuthUser) {
    return this.commandBus.execute(new UnlikeMediaSourceCommand({ executor, ...params }));
  }

  @Post("/liked/is-liked")
  @UseGuards(AuthGuard)
  isLiked(@Body() body: MediaSourceIdsParams, @User() executor: AuthUser) {
    return this.queryBus.execute(new IsLikedQuery({ executor, ...body }));
  }

  @Get("/recap/:year?")
  @UseGuards(AuthGuard)
  getRecap(@Param() params: YearParams, @User() executor: AuthUser) {
    const year = params.year ? +params.year : new Date().getFullYear();
    return this.queryBus.execute(new GetRecapQuery({ executor, year }));
  }
}
