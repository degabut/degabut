import { Controller, Get, Param, Query, Req } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetQueueQuery } from "@queue/queries";
import { GetLastPlayedQuery, GetMostPlayedQuery } from "@user/queries";
import { FastifyRequest } from "fastify";

@Controller("users")
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("/:id/videos")
  getHistories(@Query() query: any, @Param() params: any, @Req() req: FastifyRequest) {
    const targetUserId = params.id === "me" ? req.raw.userId : params.id;

    return "last" in query
      ? this.queryBus.execute(
          new GetLastPlayedQuery({
            count: +query.last,
            userId: targetUserId,
            executor: { id: req.raw.userId },
          }),
        )
      : this.queryBus.execute(
          new GetMostPlayedQuery({
            count: +query.count,
            days: +query.days,
            userId: targetUserId,
            executor: { id: req.raw.userId },
          }),
        );
  }

  @Get("/me/queue")
  getSelfQueue(@Req() req: FastifyRequest) {
    return this.queryBus.execute(
      new GetQueueQuery({
        executor: { id: req.raw.userId },
      }),
    );
  }
}
