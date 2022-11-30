import { AuthUser, User } from "@api/decorators";
import { AuthGuard } from "@api/guards";
import { SeekCommand, SetPauseCommand, SkipCommand } from "@discord-bot/commands";
import { GetQueuePlayerQuery } from "@discord-bot/queries";
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

type VoiceChannelIdParams = {
  voiceChannelId: string;
};

type SeekBody = {
  position: number;
};

@Controller("players")
export class PlayersController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  @Get("/:voiceChannelId")
  @UseGuards(AuthGuard)
  async getPlayer(@Param() params: VoiceChannelIdParams, @User() executor: AuthUser) {
    return await this.queryBus.execute(
      new GetQueuePlayerQuery({
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

  @Post("/:voiceChannelId/pause")
  @UseGuards(AuthGuard)
  async pause(@Param() params: VoiceChannelIdParams, @User() executor: AuthUser) {
    await this.commandBus.execute(
      new SetPauseCommand({
        isPaused: true,
        ...params,
        executor,
      }),
    );
  }

  @Post("/:voiceChannelId/unpause")
  @UseGuards(AuthGuard)
  async unpause(@Param() params: VoiceChannelIdParams, @User() executor: AuthUser) {
    await this.commandBus.execute(
      new SetPauseCommand({
        isPaused: false,
        ...params,
        executor,
      }),
    );
  }
}
