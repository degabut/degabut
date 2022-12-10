import { AuthUser, User } from "@api/decorators";
import { AuthGuard } from "@api/guards";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetLastPlayedQuery, GetMostPlayedQuery } from "@user/queries";

type UserIdParams = {
  userId: string;
};

type GetHistoryQuery =
  | {
      last: string;
    }
  | {
      count: string;
      days: string;
    };

@Controller("users")
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("/:userId/play-history")
  @UseGuards(AuthGuard)
  getHistories(
    @Query() query: GetHistoryQuery,
    @Param() params: UserIdParams,
    @User() executor: AuthUser,
  ) {
    return "last" in query
      ? this.queryBus.execute(
          new GetLastPlayedQuery({
            count: +query.last,
            ...params,
            executor,
          }),
        )
      : this.queryBus.execute(
          new GetMostPlayedQuery({
            count: +query.count,
            days: +query.days,
            ...params,
            executor,
          }),
        );
  }
}
