import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  AddTrackCommand,
  ChangeLoopTypeCommand,
  ChangeTrackOrderCommand,
  ClearQueueCommand,
  PlayTrackCommand,
  RemoveTrackCommand,
  SetPauseCommand,
  SkipCommand,
} from "@queue/commands";
import { LoopType } from "@queue/entities";
import { GetQueueQuery } from "@queue/queries";
import { FastifyRequest } from "fastify";

type BaseParam = {
  id: string;
};

type TrackParam = BaseParam & {
  trackId: string;
};

@Controller("queues")
export class QueuesController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  @Get("/:id")
  getQueue(@Req() req: FastifyRequest, @Param() params: BaseParam) {
    return this.queryBus.execute(
      new GetQueueQuery({
        voiceChannelId: params.id,
        executor: { id: req.raw.userId },
      }),
    );
  }

  @Post("/:id/tracks")
  addTrack(
    @Body() body: { videoId?: string; keyword?: string },
    @Param() params: BaseParam,
    @Req() req: FastifyRequest,
  ) {
    return this.commandBus.execute(
      new AddTrackCommand({
        voiceChannelId: params.id,
        keyword: body.keyword,
        videoId: body.videoId,
        executor: { id: req.raw.userId },
      }),
    );
  }

  @Patch("/:id/tracks/:trackId")
  changeTrackOrder(
    @Body() body: { to: number },
    @Param() params: TrackParam,
    @Req() req: FastifyRequest,
  ) {
    return this.commandBus.execute(
      new ChangeTrackOrderCommand({
        voiceChannelId: params.id,
        trackId: params.trackId,
        to: body.to,
        executor: { id: req.raw.userId },
      }),
    );
  }

  @Patch("/:id/loop-type")
  changeLoopType(
    @Body() body: { loopType: LoopType },
    @Param() params: BaseParam,
    @Req() req: FastifyRequest,
  ) {
    return this.commandBus.execute(
      new ChangeLoopTypeCommand({
        voiceChannelId: params.id,
        loopType: body.loopType,
        executor: { id: req.raw.userId },
      }),
    );
  }

  @Post("/:id/tracks/:trackId/play")
  playTrack(@Param() params: TrackParam, @Req() req: FastifyRequest) {
    return this.commandBus.execute(
      new PlayTrackCommand({
        voiceChannelId: params.id,
        trackId: params.trackId,
        executor: { id: req.raw.userId },
      }),
    );
  }

  @Delete("/:id/tracks/:trackId")
  removeTrack(@Param() params: TrackParam, @Req() req: FastifyRequest) {
    return this.commandBus.execute(
      new RemoveTrackCommand({
        voiceChannelId: params.id,
        trackId: params.trackId,
        executor: { id: req.raw.userId },
      }),
    );
  }

  @Delete("/:id/tracks")
  removeTracks(
    @Param() params: BaseParam,
    @Body() body: { includeNowPlaying?: boolean },
    @Req() req: FastifyRequest,
  ) {
    return this.commandBus.execute(
      new ClearQueueCommand({
        voiceChannelId: params.id,
        removeNowPlaying: !!body.includeNowPlaying,
        executor: { id: req.raw.userId },
      }),
    );
  }

  @Post("/:id/skip")
  skip(@Param() params: BaseParam, @Req() req: FastifyRequest) {
    return this.commandBus.execute(
      new SkipCommand({
        voiceChannelId: params.id,
        executor: { id: req.raw.userId },
      }),
    );
  }

  @Post("/:id/pause")
  pause(@Param() params: BaseParam, @Req() req: FastifyRequest) {
    return this.commandBus.execute(
      new SetPauseCommand({
        isPaused: true,
        voiceChannelId: params.id,
        executor: { id: req.raw.userId },
      }),
    );
  }

  @Post("/:id/unpause")
  unpause(@Param() params: BaseParam, @Req() req: FastifyRequest) {
    return this.commandBus.execute(
      new SetPauseCommand({
        isPaused: false,
        voiceChannelId: params.id,
        executor: { id: req.raw.userId },
      }),
    );
  }
}
