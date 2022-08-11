import { AuthUser, User } from "@api/decorators";
import { AuthGuard } from "@api/guards";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetQueueQuery } from "@queue/queries";
import { GetLastPlayedQuery, GetMostPlayedQuery } from "@user/queries";

@Controller("users")
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("/:id/videos")
  @UseGuards(AuthGuard)
  getHistories(@Query() query: any, @Param() params: any, @User() user: AuthUser) {
    const targetUserId = params.id === "me" ? user.id : params.id;

    return "last" in query
      ? this.queryBus.execute(
          new GetLastPlayedQuery({
            count: +query.last,
            userId: targetUserId,
            executor: { id: user.id },
          }),
        )
      : this.queryBus.execute(
          new GetMostPlayedQuery({
            count: +query.count,
            days: +query.days,
            userId: targetUserId,
            executor: { id: user.id },
          }),
        );
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
