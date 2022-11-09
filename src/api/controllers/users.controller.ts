import { AuthUser, User } from "@api/decorators";
import { AuthGuard } from "@api/guards";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetPlaylistsQuery } from "@playlist/queries";
import { GetQueueQuery } from "@queue/queries";
import { GetLastPlayedQuery, GetMostPlayedQuery } from "@user/queries";

@Controller("users")
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("/:id/videos")
  @UseGuards(AuthGuard)
  getHistories(@Query() query: any, @Param() params: any, @User() user: AuthUser) {
    const executor = { id: user.id };

    return "last" in query
      ? this.queryBus.execute(
          new GetLastPlayedQuery({
            count: +query.last,
            userId: params.id,
            executor,
          }),
        )
      : this.queryBus.execute(
          new GetMostPlayedQuery({
            count: +query.count,
            days: +query.days,
            userId: params.id,
            executor,
          }),
        );
  }

  @Get("/me/videos")
  @UseGuards(AuthGuard)
  getSelfHistories(@Query() query: any, @User() user: AuthUser) {
    const executor = { id: user.id };
    const selections =
      query.guild === "true"
        ? { guild: true as const }
        : query.voiceChannel === "true"
        ? { voiceChannel: true as const }
        : { userId: user.id };

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

  @Get("/me/playlists")
  @UseGuards(AuthGuard)
  getSelfPlaylists(@User() user: AuthUser) {
    const executor = { id: user.id };

    return this.queryBus.execute(new GetPlaylistsQuery({ executor }));
  }

  @Get("/me/queue")
  @UseGuards(AuthGuard)
  getSelfQueue(@User() user: AuthUser) {
    return this.queryBus.execute(
      new GetQueueQuery({
        executor: { id: user.id },
      }),
    );
  }
}
