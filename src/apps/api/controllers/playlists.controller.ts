import { IPaginationQuery } from "@api/interfaces";
import { AuthUser, User } from "@auth/decorators";
import { AuthGuard } from "@auth/guards";
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
import {
  AddPlaylistMediaSourceCommand,
  CreatePlaylistCommand,
  DeletePlaylistCommand,
  RemovePlaylistMediaSourceCommand,
  UpdatePlaylistCommand,
} from "@playlist/commands";
import { GetPlaylistMediaSourcesQuery, GetPlaylistQuery } from "@playlist/queries";

type PlaylistIdParams = {
  playlistId: string;
};

type CreatePlaylistBody = {
  name: string;
};

type EditPlaylistBody = CreatePlaylistBody;

type AddMediaSourceBody = {
  mediaSourceId: string;
};

type RemoveMediaSourceParams = {
  playlistId: string;
  mediaSourceId: string;
};

@Controller("playlists")
export class PlaylistsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get("/:playlistId")
  @UseGuards(AuthGuard)
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
  async createPlaylist(@Body() body: CreatePlaylistBody, @User() user: AuthUser) {
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
  async updatePlaylist(
    @Body() body: EditPlaylistBody,
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
  getPlaylistMediaSources(
    @Param() params: PlaylistIdParams,
    @Query() query: IPaginationQuery,
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
