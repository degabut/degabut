import { AuthUser, User } from "@api/decorators";
import { AuthGuard } from "@api/guards";
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  JoinCommand,
  SeekCommand,
  SetPauseCommand,
  SkipCommand,
  StopCommand,
} from "@queue-player/commands";
import { GetQueuePlayerQuery } from "@queue-player/queries";

type VoiceChannelIdParams = {
  voiceChannelId: string;
};

type JoinParams = VoiceChannelIdParams & {
  textChannelId?: string;
};

type SeekBody = {
  position: number;
};

@Controller("players")
export class PlayersController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  @Post("/")
  @UseGuards(AuthGuard)
  async createPlayer(@Body() body: JoinParams, @User() executor: AuthUser) {
    return await this.commandBus.execute(
      new JoinCommand({
        ...body,
        executor,
      }),
    );
  }

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

  @Delete("/:voiceChannelId")
  @UseGuards(AuthGuard)
  async destroyPlayer(@Param() params: VoiceChannelIdParams, @User() executor: AuthUser) {
    return await this.commandBus.execute(
      new StopCommand({
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
