import { AuthUser, User } from "@api/decorators";
import { AuthGuard } from "@api/guards";
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  AddTrackCommand,
  AddTracksCommand,
  ChangeLoopTypeCommand,
  ChangeTrackOrderCommand,
  ClearQueueCommand,
  JamCommand,
  PlayTrackCommand,
  RemoveTrackCommand,
  SetPauseCommand,
  SkipCommand,
  ToggleShuffleCommand,
} from "@queue/commands";
import { LoopType } from "@queue/entities";
import { GetQueueQuery } from "@queue/queries";

type BaseParam = {
  id: string;
};

type TrackParam = BaseParam & {
  trackId: string;
};

type AddTracksBody = {
  videoId?: string;
  keyword?: string;
  playlistId?: string;
  youtubePlaylistId?: string;
};

@Controller("queues")
export class QueuesController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  @Get("/:id")
  @UseGuards(AuthGuard)
  getQueue(@User() user: AuthUser, @Param() params: BaseParam) {
    return this.queryBus.execute(
      new GetQueueQuery({
        voiceChannelId: params.id,
        executor: { id: user.id },
      }),
    );
  }

  @Post("/:id/tracks")
  @UseGuards(AuthGuard)
  async addTrack(@Body() body: AddTracksBody, @Param() params: BaseParam, @User() user: AuthUser) {
    const executor = { id: user.id };

    if (body.playlistId || body.youtubePlaylistId) {
      return {
        trackIds: await this.commandBus.execute(
          new AddTracksCommand({
            playlistId: body.playlistId,
            youtubePlaylistId: body.youtubePlaylistId,
            voiceChannelId: params.id,
            executor,
          }),
        ),
      };
    } else {
      return {
        trackId: await this.commandBus.execute(
          new AddTrackCommand({
            voiceChannelId: params.id,
            keyword: body.keyword,
            videoId: body.videoId,
            executor,
          }),
        ),
      };
    }
  }

  @Patch("/:id/tracks/:trackId")
  @UseGuards(AuthGuard)
  async changeTrackOrder(
    @Body() body: { to: number },
    @Param() params: TrackParam,
    @User() user: AuthUser,
  ) {
    await this.commandBus.execute(
      new ChangeTrackOrderCommand({
        voiceChannelId: params.id,
        trackId: params.trackId,
        to: body.to,
        executor: { id: user.id },
      }),
    );
  }

  @Patch("/:id/loop-type")
  @UseGuards(AuthGuard)
  async changeLoopType(
    @Body() body: { loopType: LoopType },
    @Param() params: BaseParam,
    @User() user: AuthUser,
  ) {
    await this.commandBus.execute(
      new ChangeLoopTypeCommand({
        voiceChannelId: params.id,
        loopType: body.loopType,
        executor: { id: user.id },
      }),
    );
  }

  @Patch("/:id/shuffle")
  @UseGuards(AuthGuard)
  async toggleShuffle(@Param() params: BaseParam, @User() user: AuthUser) {
    await this.commandBus.execute(
      new ToggleShuffleCommand({
        voiceChannelId: params.id,
        executor: { id: user.id },
      }),
    );
  }

  @Post("/:id/tracks/:trackId/play")
  @UseGuards(AuthGuard)
  async playTrack(@Param() params: TrackParam, @User() user: AuthUser) {
    await this.commandBus.execute(
      new PlayTrackCommand({
        voiceChannelId: params.id,
        trackId: params.trackId,
        executor: { id: user.id },
      }),
    );
  }

  @Delete("/:id/tracks/:trackId")
  @UseGuards(AuthGuard)
  async removeTrack(@Param() params: TrackParam, @User() user: AuthUser) {
    await this.commandBus.execute(
      new RemoveTrackCommand({
        voiceChannelId: params.id,
        trackId: params.trackId,
        executor: { id: user.id },
      }),
    );
  }

  @Delete("/:id/tracks")
  @UseGuards(AuthGuard)
  async removeTracks(
    @Param() params: BaseParam,
    @Body() body: { includeNowPlaying?: boolean },
    @User() user: AuthUser,
  ) {
    await this.commandBus.execute(
      new ClearQueueCommand({
        voiceChannelId: params.id,
        removeNowPlaying: !!body.includeNowPlaying,
        executor: { id: user.id },
      }),
    );
  }

  @Post("/:id/skip")
  @UseGuards(AuthGuard)
  async skip(@Param() params: BaseParam, @User() user: AuthUser) {
    await this.commandBus.execute(
      new SkipCommand({
        voiceChannelId: params.id,
        executor: { id: user.id },
      }),
    );
  }

  @Post("/:id/pause")
  @UseGuards(AuthGuard)
  async pause(@Param() params: BaseParam, @User() user: AuthUser) {
    await this.commandBus.execute(
      new SetPauseCommand({
        isPaused: true,
        voiceChannelId: params.id,
        executor: { id: user.id },
      }),
    );
  }

  @Post("/:id/unpause")
  @UseGuards(AuthGuard)
  async unpause(@Param() params: BaseParam, @User() user: AuthUser) {
    await this.commandBus.execute(
      new SetPauseCommand({
        isPaused: false,
        voiceChannelId: params.id,
        executor: { id: user.id },
      }),
    );
  }

  @Post("/:id/jam")
  @UseGuards(AuthGuard)
  async jam(@Param() params: BaseParam, @Body() body: { count: number }, @User() user: AuthUser) {
    await this.commandBus.execute(
      new JamCommand({
        voiceChannelId: params.id,
        count: body.count,
        executor: { id: user.id },
      }),
    );
  }
}
