import { AuthUser, User } from "@auth/decorators";
import { AuthGuard } from "@auth/guards";
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiResponse } from "@nestjs/swagger";
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
import { QueueDto, TrackDto } from "@queue/dtos";
import { LoopMode } from "@queue/entities";
import { GetQueueQuery } from "@queue/queries";

class VoiceChannelIdParams {
  @ApiProperty()
  voiceChannelId!: string;
}

class TrackParam extends VoiceChannelIdParams {
  @ApiProperty()
  trackId!: string;
}

class AddTracksBody {
  @ApiPropertyOptional()
  mediaSourceIds?: string[];

  @ApiPropertyOptional()
  mediaSourceId?: string;

  @ApiPropertyOptional()
  keyword?: string;

  @ApiPropertyOptional()
  playlistId?: string;

  @ApiPropertyOptional()
  youtubePlaylistId?: string;

  @ApiPropertyOptional()
  spotifyPlaylistId?: string;

  @ApiPropertyOptional()
  spotifyAlbumId?: string;

  @ApiPropertyOptional()
  allowDuplicates?: boolean;

  @ApiPropertyOptional()
  lastLikedCount?: number;
}

class ChangeTrackOrderBody {
  @ApiProperty()
  to!: number;
}

class ChangeLoopModeBody {
  @ApiProperty({ enum: LoopMode })
  loopMode!: LoopMode;
}

class JamBody {
  @ApiProperty()
  count!: number;
}

class RemoveTracksBody {
  @ApiPropertyOptional()
  includeNowPlaying?: boolean;

  @ApiPropertyOptional()
  trackIds?: string[];

  @ApiPropertyOptional()
  memberId?: string;
}

@Controller("queues")
export class QueuesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get("/:voiceChannelId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  @ApiResponse({ type: QueueDto })
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
  @ApiBearerAuth("AccessToken")
  @ApiResponse({ type: [TrackDto] })
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
  @ApiBearerAuth("AccessToken")
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
  @ApiBearerAuth("AccessToken")
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
  @ApiBearerAuth("AccessToken")
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
  @ApiBearerAuth("AccessToken")
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
  @ApiBearerAuth("AccessToken")
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
  @ApiBearerAuth("AccessToken")
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
  @ApiBearerAuth("AccessToken")
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
  @ApiBearerAuth("AccessToken")
  @ApiResponse({ type: [String] })
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
  @ApiBearerAuth("AccessToken")
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
