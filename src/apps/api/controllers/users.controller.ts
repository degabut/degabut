import { AuthUser, User } from "@auth/decorators";
import { AuthGuard } from "@auth/guards";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetLastPlayedQuery, GetMostPlayedQuery } from "@user/queries";

type UserIdParams = {
  userId: string;
};

type GetHistoryQuery =
  | {
      last: string;
      page: string;
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
            limit: +query.last,
            page: +query.page,
            ...params,
            executor,
          }),
        )
      : this.queryBus.execute(
          new GetMostPlayedQuery({
            limit: +query.count,
            days: +query.days,
            ...params,
            executor,
          }),
        );
  }
}
