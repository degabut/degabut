import { Controller, Get, Param, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetLastPlayedQuery, GetMostPlayedQuery } from "@youtube/queries";

@Controller("users")
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("/:id/videos")
  getHistories(@Query() query: any, @Param() params: any) {
    const targetUserId = params.id === "me" ? "me" : params.id;

    return "last" in query
      ? this.queryBus.execute(
          new GetLastPlayedQuery({
            count: +query.last,
            userId: targetUserId,
          }),
        )
      : this.queryBus.execute(
          new GetMostPlayedQuery({
            count: +query.count,
            days: +query.days,
            userId: targetUserId,
          }),
        );
  }

  // TODO implement queue controller
  // @Get("/me/queue")
  // getQueue() {
  //   return this.queryBus.execute(new GetQueueQuery({ guildId: "me" }));
  // }
}
