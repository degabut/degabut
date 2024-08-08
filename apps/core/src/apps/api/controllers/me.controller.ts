import { AuthUser, User } from "@auth/decorators";
import { AuthGuard } from "@auth/guards";
import { MAX_HISTORY_DAYS } from "@history/history.constants";
import { MediaSourceDto } from "@media-source/dtos";
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiResponse } from "@nestjs/swagger";
import { PlaylistDto } from "@playlist/dtos";
import { GetPlaylistsQuery } from "@playlist/queries";
import { QueueDto } from "@queue/dtos";
import { GetQueueQuery } from "@queue/queries";
import {
  LikeMediaSourceCommand,
  RemovePlayHistoryCommand,
  UnlikeMediaSourceCommand,
} from "@user/commands";
import { UserLikeMediaSourceDto } from "@user/dtos";
import {
  GetLastPlayedQuery,
  GetLikedQuery,
  GetMostPlayedQuery,
  GetRecapQuery,
  IsLikedQuery,
} from "@user/queries";

import { PaginationQueryDto } from "../dto";

class LastPlayedQuery {
  @ApiProperty()
  last!: string;

  @ApiPropertyOptional({ default: 1 })
  page?: string;
}

class TopPlayedQuery {
  @ApiProperty()
  count!: string;

  @ApiProperty({
    minimum: 1,
    maximum: MAX_HISTORY_DAYS,
  })
  days!: string;
}

type GetSelfHistoryQuery = (LastPlayedQuery | TopPlayedQuery) & {
  guild: string;
  voiceChannel: string;
};

class MediaSourceIdParams {
  @ApiProperty()
  mediaSourceId!: string;
}

class MediaSourceIdsBody {
  @ApiProperty()
  mediaSourceIds!: string[];
}

class GetLikedParam extends PaginationQueryDto {
  @ApiPropertyOptional()
  keyword?: string;
}

class YearParams {
  @ApiPropertyOptional()
  year?: string;
}

@Controller("me")
export class MeController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get("/play-history")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
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
            limit: +query.last,
            page: query.page ? +query.page : undefined,
            executor,
            ...selections,
          }),
        )
      : this.queryBus.execute(
          new GetMostPlayedQuery({
            limit: +query.count,
            days: +query.days,
            executor,
            ...selections,
          }),
        );
  }

  @Get("/top")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  @ApiResponse({ type: [MediaSourceDto], status: "2XX" })
  getTopTracks(@Query() query: TopPlayedQuery, @User() executor: AuthUser) {
    return this.queryBus.execute(
      new GetMostPlayedQuery({
        limit: +query.count,
        days: +query.days,
        executor,
      }),
    );
  }

  @Get("/last-played")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  @ApiResponse({ type: [MediaSourceDto], status: "2XX" })
  getLastPlayed(@Query() query: PaginationQueryDto, @User() executor: AuthUser) {
    return this.queryBus.execute(
      new GetLastPlayedQuery({
        limit: query.limit ? +query.limit : undefined,
        page: query.page ? +query.page : undefined,
        executor,
      }),
    );
  }

  @Get("/playlists")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  @ApiResponse({ type: [PlaylistDto], status: "2XX" })
  getSelfPlaylists(@User() executor: AuthUser) {
    return this.queryBus.execute(new GetPlaylistsQuery({ executor }));
  }

  @Get("/queue")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  @ApiResponse({ type: QueueDto, status: "2XX" })
  getSelfQueue(@User() executor: AuthUser) {
    return this.queryBus.execute(new GetQueueQuery({ executor }));
  }

  @Delete("/play-history/:mediaSourceId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  removePlayHistory(@Param() params: MediaSourceIdParams, @User() executor: AuthUser) {
    return this.commandBus.execute(new RemovePlayHistoryCommand({ executor, ...params }));
  }

  @Get("/liked")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  @ApiResponse({ type: [UserLikeMediaSourceDto] })
  getLiked(@User() executor: AuthUser, @Query() query: GetLikedParam) {
    return this.queryBus.execute(
      new GetLikedQuery({
        executor,
        limit: query.limit ? +query.limit : 100,
        page: query.page ? +query.page : 1,
        keyword: query.keyword,
      }),
    );
  }

  @Post("/liked")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  like(@Body() body: MediaSourceIdParams, @User() executor: AuthUser) {
    return this.commandBus.execute(new LikeMediaSourceCommand({ executor, ...body }));
  }

  @Delete("/liked/:mediaSourceId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  unlike(@Param() params: MediaSourceIdParams, @User() executor: AuthUser) {
    return this.commandBus.execute(new UnlikeMediaSourceCommand({ executor, ...params }));
  }

  @Post("/liked/is-liked")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  @ApiResponse({ type: [Boolean] })
  isLiked(@Body() body: MediaSourceIdsBody, @User() executor: AuthUser) {
    return this.queryBus.execute(new IsLikedQuery({ executor, ...body }));
  }

  @Get("/recap/:year?")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  getRecap(@Param() params: YearParams, @User() executor: AuthUser) {
    const year = params.year ? +params.year : new Date().getFullYear();
    return this.queryBus.execute(new GetRecapQuery({ executor, year }));
  }
}
