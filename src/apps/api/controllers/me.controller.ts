import { PaginationQueryDto } from "@api/dto";
import { AuthUser, User } from "@auth/decorators";
import { AuthGuard } from "@auth/guards";
import { MAX_HISTORY_DAYS } from "@history/history.constants";
import { MediaSourceDto } from "@media-source/dtos";
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { PlaylistDto } from "@playlist/dtos";
import { GetPlaylistsQuery } from "@playlist/queries";
import { QueueDto } from "@queue/dtos";
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

type GetHistoryQuery = LastPlayedQuery | TopPlayedQuery;

type GetSelfHistoryQuery = GetHistoryQuery & { guild: string; voiceChannel: string };

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
  @ApiQuery({ type: TopPlayedQuery })
  @ApiBearerAuth()
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
  @ApiQuery({ type: PaginationQueryDto })
  @ApiBearerAuth()
  @ApiResponse({ type: [MediaSourceDto] })
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
  @ApiBearerAuth()
  @ApiResponse({ type: [PlaylistDto] })
  getSelfPlaylists(@User() executor: AuthUser) {
    return this.queryBus.execute(new GetPlaylistsQuery({ executor }));
  }

  @Get("/queue")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: [QueueDto] })
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
        limit: query.limit ? +query.limit : 100,
        page: query.page ? +query.page : 1,
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
  isLiked(@Body() body: MediaSourceIdsBody, @User() executor: AuthUser) {
    return this.queryBus.execute(new IsLikedQuery({ executor, ...body }));
  }

  @Get("/recap/:year?")
  @UseGuards(AuthGuard)
  @ApiParam(YearParams)
  getRecap(@Param() params: YearParams, @User() executor: AuthUser) {
    const year = params.year ? +params.year : new Date().getFullYear();
    return this.queryBus.execute(new GetRecapQuery({ executor, year }));
  }
}
