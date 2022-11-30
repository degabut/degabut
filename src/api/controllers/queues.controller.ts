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
  ToggleShuffleCommand,
} from "@queue/commands";
import { LoopType } from "@queue/entities";
import { GetQueueQuery } from "@queue/queries";

type VoiceChannelIdParams = {
  voiceChannelId: string;
};

type TrackParam = VoiceChannelIdParams & {
  trackId: string;
};

type AddTracksBody = {
  videoId?: string;
  keyword?: string;
  playlistId?: string;
  youtubePlaylistId?: string;
};

type ChangeTrackOrderBody = { to: number };

type ChangeLoopTypeBody = { loopType: LoopType };

type JamBody = { count: number };

@Controller("queues")
export class QueuesController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  @Get("/:voiceChannelId")
  @UseGuards(AuthGuard)
  getQueue(@Param() params: VoiceChannelIdParams, @User() executor: AuthUser) {
    return this.queryBus.execute(
      new GetQueueQuery({
        ...params,
        executor,
      }),
    );
  }

  @Post("/:voiceChannelId/tracks")
  @UseGuards(AuthGuard)
  async addTrack(
    @Body() body: AddTracksBody | undefined,
    @Param() params: VoiceChannelIdParams,
    @User() executor: AuthUser,
  ) {
    if (body && ("playlistId" in body || "youtubePlaylistId" in body)) {
      return {
        trackIds: await this.commandBus.execute(
          new AddTracksCommand({
            ...params,
            ...body,
            executor,
          }),
        ),
      };
    } else {
      return {
        trackId: await this.commandBus.execute(
          new AddTrackCommand({
            ...params,
            ...body,
            executor,
          }),
        ),
      };
    }
  }

  @Patch("/:voiceChannelId/tracks/:trackId")
  @UseGuards(AuthGuard)
  async changeTrackOrder(
    @Body() body: ChangeTrackOrderBody,
    @Param() params: TrackParam,
    @User() executor: AuthUser,
  ) {
    await this.commandBus.execute(
      new ChangeTrackOrderCommand({
        ...params,
        ...body,
        executor,
      }),
    );
  }

  @Patch("/:voiceChannelId/loop-type")
  @UseGuards(AuthGuard)
  async changeLoopType(
    @Body() body: ChangeLoopTypeBody,
    @Param() params: VoiceChannelIdParams,
    @User() executor: AuthUser,
  ) {
    await this.commandBus.execute(
      new ChangeLoopTypeCommand({
        ...params,
        ...body,
        executor,
      }),
    );
  }

  @Patch("/:voiceChannelId/shuffle")
  @UseGuards(AuthGuard)
  async toggleShuffle(@Param() params: VoiceChannelIdParams, @User() executor: AuthUser) {
    await this.commandBus.execute(
      new ToggleShuffleCommand({
        ...params,
        executor,
      }),
    );
  }

  @Post("/:voiceChannelId/tracks/:trackId/play")
  @UseGuards(AuthGuard)
  async playTrack(@Param() params: TrackParam, @User() executor: AuthUser) {
    await this.commandBus.execute(
      new PlayTrackCommand({
        ...params,
        executor,
      }),
    );
  }

  @Delete("/:voiceChannelId/tracks/:trackId")
  @UseGuards(AuthGuard)
  async removeTrack(@Param() params: TrackParam, @User() executor: AuthUser) {
    await this.commandBus.execute(
      new RemoveTrackCommand({
        ...params,
        executor,
      }),
    );
  }

  @Delete("/:voiceChannelId/tracks")
  @UseGuards(AuthGuard)
  async removeTracks(
    @Param() params: VoiceChannelIdParams,
    @Body() body: { includeNowPlaying?: boolean },
    @User() executor: AuthUser,
  ) {
    await this.commandBus.execute(
      new ClearQueueCommand({
        ...params,
        removeNowPlaying: !!body.includeNowPlaying,
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

  @Post("/:voiceChannelId/jam")
  @UseGuards(AuthGuard)
  async jam(
    @Param() params: VoiceChannelIdParams,
    @Body() body: JamBody,
    @User() executor: AuthUser,
  ) {
    await this.commandBus.execute(
      new JamCommand({
        ...params,
        ...body,
        executor,
      }),
    );
  }
}
