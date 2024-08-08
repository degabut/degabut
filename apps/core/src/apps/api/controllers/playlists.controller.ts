import { AuthUser, User } from "@auth/decorators";
import { AuthGuard } from "@auth/guards";
import { MediaSourceDto } from "@media-source/dtos";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiProperty, ApiResponse } from "@nestjs/swagger";
import {
  AddPlaylistMediaSourceCommand,
  CreatePlaylistCommand,
  DeletePlaylistCommand,
  RemovePlaylistMediaSourceCommand,
  UpdatePlaylistCommand,
} from "@playlist/commands";
import { PlaylistDto } from "@playlist/dtos";
import { GetPlaylistMediaSourcesQuery, GetPlaylistQuery } from "@playlist/queries";

import { PaginationQueryDto } from "../dto";

export class PlaylistIdParams {
  @ApiProperty()
  playlistId!: string;
}

export class PlaylistBody {
  @ApiProperty()
  name!: string;
}

export class AddMediaSourceBody {
  @ApiProperty()
  mediaSourceId!: string;
}

export class RemoveMediaSourceParams {
  @ApiProperty()
  playlistId!: string;

  @ApiProperty()
  mediaSourceId!: string;
}

@Controller("playlists")
export class PlaylistsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get("/:playlistId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  @ApiResponse({ type: [PlaylistDto] })
  getPlaylist(@Param() params: PlaylistIdParams, @User() user: AuthUser) {
    const executor = { id: user.id };

    return this.queryBus.execute(
      new GetPlaylistQuery({
        ...params,
        executor,
      }),
    );
  }

  @Post("/")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  async createPlaylist(@Body() body: PlaylistBody, @User() user: AuthUser) {
    const executor = { id: user.id };

    return {
      playlistId: await this.commandBus.execute(
        new CreatePlaylistCommand({
          ...body,
          executor,
        }),
      ),
    };
  }

  @Delete("/:playlistId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  async deletePlaylist(@Param() params: PlaylistIdParams, @User() user: AuthUser) {
    const executor = { id: user.id };

    return await this.commandBus.execute(
      new DeletePlaylistCommand({
        ...params,
        executor,
      }),
    );
  }

  @Patch("/:playlistId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  async updatePlaylist(
    @Body() body: PlaylistBody,
    @Param() params: PlaylistIdParams,
    @User() user: AuthUser,
  ) {
    const executor = { id: user.id };

    return {
      playlistId: await this.commandBus.execute(
        new UpdatePlaylistCommand({
          ...params,
          ...body,
          executor,
        }),
      ),
    };
  }

  @Get("/:playlistId/media-sources")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  @ApiResponse({ type: [MediaSourceDto] })
  getPlaylistMediaSources(
    @Param() params: PlaylistIdParams,
    @Query() query: PaginationQueryDto,
    @User() user: AuthUser,
  ) {
    const executor = { id: user.id };

    return this.queryBus.execute(
      new GetPlaylistMediaSourcesQuery({
        ...params,
        limit: query.limit ? +query.limit : 100,
        page: query.page ? +query.page : 1,
        executor,
      }),
    );
  }

  @Post("/:playlistId/media-sources")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  async addPlaylistMediaSource(
    @Body() body: AddMediaSourceBody,
    @Param() params: PlaylistIdParams,
    @User() user: AuthUser,
  ) {
    const executor = { id: user.id };

    return {
      playlistMediaSourceId: await this.commandBus.execute(
        new AddPlaylistMediaSourceCommand({
          ...params,
          ...body,
          executor,
        }),
      ),
    };
  }

  @Delete("/:playlistId/media-sources/:mediaSourceId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("AccessToken")
  removePlaylistMediaSource(@Param() params: RemoveMediaSourceParams, @User() user: AuthUser) {
    const executor = { id: user.id };

    return this.commandBus.execute(
      new RemovePlaylistMediaSourceCommand({
        ...params,
        executor,
      }),
    );
  }
}
