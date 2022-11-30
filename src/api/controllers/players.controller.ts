import { AuthUser, User } from "@api/decorators";
import { AuthGuard } from "@api/guards";
import { SeekCommand, SkipCommand } from "@discord-bot/commands";
import { GetPositionQuery } from "@discord-bot/queries";
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

type VoiceChannelIdParams = {
  voiceChannelId: string;
};

type SeekBody = {
  seek: number;
};

@Controller("players")
export class PlayersController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  @Get("/:voiceChannelId/position")
  @UseGuards(AuthGuard)
  async getPosition(@Param() params: VoiceChannelIdParams, @User() executor: AuthUser) {
    return await this.queryBus.execute(
      new GetPositionQuery({
        ...params,
        executor,
      }),
    );
  }

  @Post("/:voiceChannelId/seek")
  @UseGuards(AuthGuard)
  async seek(
    @Param() params: VoiceChannelIdParams,
    @Body() body: SeekBody,
    @User() executor: AuthUser,
  ) {
    await this.commandBus.execute(
      new SeekCommand({
        ...params,
        ...body,
        executor,
      }),
    );
  }

  @Post("/:voiceChannelId/skip")
  @UseGuards(AuthGuard)
  async skip(@Param() params: VoiceChannelIdParams, @User() executor: AuthUser) {
    await this.commandBus.execute(
      new SkipCommand({
        ...params,
        executor,
      }),
    );
  }
}
