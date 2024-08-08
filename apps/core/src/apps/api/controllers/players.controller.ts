import { AuthUser, User } from "@auth/decorators";
import { AuthGuard } from "@auth/guards";
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiProperty, ApiResponse } from "@nestjs/swagger";
import {
  JoinCommand,
  SeekCommand,
  SetPauseCommand,
  SkipCommand,
  StopCommand,
} from "@queue-player/commands";
import { QueuePlayerDto } from "@queue-player/dtos";
import { GetQueuePlayerQuery } from "@queue-player/queries";

class VoiceChannelIdParams {
  @ApiProperty()
  voiceChannelId!: string;
}

class JoinParams extends VoiceChannelIdParams {
  @ApiProperty()
  textChannelId?: string;
}

class SeekBody {
  @ApiProperty()
  position!: number;
}

@Controller("players")
export class PlayersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post("/")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
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
  @ApiBearerAuth("AccessToken")
  @ApiResponse({ type: QueuePlayerDto })
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
  @ApiBearerAuth("AccessToken")
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
  @ApiBearerAuth("AccessToken")
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
  @ApiBearerAuth("AccessToken")
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
  @ApiBearerAuth("AccessToken")
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
  @ApiBearerAuth("AccessToken")
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
