import { AuthUser, User } from "@auth/decorators";
import { AuthGuard } from "@auth/guards";
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  AddNextTrackCommand,
  AddTracksCommand,
  ChangeLoopModeCommand,
  ChangeTrackOrderCommand,
  ClearQueueCommand,
  JamCommand,
  RemoveTrackCommand,
  RemoveTracksCommand,
  ToggleShuffleCommand,
} from "@queue/commands";
import { RemoveNextTrackCommand } from "@queue/commands/remove-next-track";
import { LoopMode } from "@queue/entities";
import { GetQueueQuery } from "@queue/queries";

type VoiceChannelIdParams = {
  voiceChannelId: string;
};

type TrackParam = VoiceChannelIdParams & {
  trackId: string;
};

type AddTracksBody = {
  mediaSourceId?: string;
  keyword?: string;
  playlistId?: string;
  youtubePlaylistId?: string;
  spotifyPlaylistId?: string;
  spotifyAlbumId?: string;
  lastLikedCount?: number;
};

type ChangeTrackOrderBody = { to: number };

type ChangeLoopModeBody = { loopMode: LoopMode };

type JamBody = { count: number };

type RemoveTracksBody = {
  includeNowPlaying?: boolean;
  trackIds?: string[];
  memberId?: string;
};

@Controller("queues")
export class QueuesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

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
    return {
      trackIds: await this.commandBus.execute(
        new AddTracksCommand({
          ...params,
          ...body,
          executor,
        }),
      ),
    };
  }

  @Post("/:voiceChannelId/tracks/:trackId/order")
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

  @Post("/:voiceChannelId/loop-mode")
  @UseGuards(AuthGuard)
  async changeLoopMode(
    @Body() body: ChangeLoopModeBody,
    @Param() params: VoiceChannelIdParams,
    @User() executor: AuthUser,
  ) {
    await this.commandBus.execute(
      new ChangeLoopModeCommand({
        ...params,
        ...body,
        executor,
      }),
    );
  }

  @Post("/:voiceChannelId/shuffle")
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
      new AddNextTrackCommand({
        ...params,
        playNow: true,
        executor,
      }),
    );
  }

  @Post("/:voiceChannelId/tracks/:trackId/next")
  @UseGuards(AuthGuard)
  async addNextTrack(@Param() params: TrackParam, @User() executor: AuthUser) {
    await this.commandBus.execute(
      new AddNextTrackCommand({
        ...params,
        playNow: false,
        executor,
      }),
    );
  }

  @Delete("/:voiceChannelId/tracks/:trackId/next")
  @UseGuards(AuthGuard)
  async deleteNextTrack(@Param() params: TrackParam, @User() executor: AuthUser) {
    await this.commandBus.execute(
      new RemoveNextTrackCommand({
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
    @Body() body: RemoveTracksBody,
    @User() executor: AuthUser,
  ) {
    if (body.trackIds || body.memberId) {
      return await this.commandBus.execute(
        new RemoveTracksCommand({
          ...params,
          ...body,
          executor,
        }),
      );
    } else {
      await this.commandBus.execute(
        new ClearQueueCommand({
          ...params,
          includeNowPlaying: !!body.includeNowPlaying,
          executor,
        }),
      );
    }
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
