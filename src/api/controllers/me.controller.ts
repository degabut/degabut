import { AuthUser, User } from "@api/decorators";
import { AuthGuard } from "@api/guards";
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetPlaylistsQuery } from "@playlist/queries";
import { GetQueueQuery } from "@queue/queries";
import { GetLastPlayedQuery, GetMostPlayedQuery } from "@user/queries";

type GetHistoryQuery =
  | {
      last: string;
    }
  | {
      count: string;
      days: string;
    };

type GetSelfHistoryQuery = GetHistoryQuery & { guild: string; voiceChannel: string };

@Controller("me")
export class MeController {
  constructor(private readonly queryBus: QueryBus) {}

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
}
