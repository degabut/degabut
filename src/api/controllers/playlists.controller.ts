import { AuthUser, User } from "@api/decorators";
import { AuthGuard } from "@api/guards";
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  AddPlaylistVideoCommand,
  CreatePlaylistCommand,
  DeletePlaylistCommand,
  RemovePlaylistVideoCommand,
  UpdatePlaylistCommand,
} from "@playlist/commands";
import { GetPlaylistQuery, GetPlaylistVideosQuery } from "@playlist/queries";

type PlaylistIdParams = {
  playlistId: string;
};

type CreatePlaylistBody = {
  name: string;
};

type EditPlaylistBody = CreatePlaylistBody;

type AddVideoBody = {
  videoId: string;
};

type RemoveVideoParams = {
  playlistId: string;
  playlistVideoId: string;
};

@Controller("playlists")
export class PlaylistsController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

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

  @Get("/:playlistId/videos")
  @UseGuards(AuthGuard)
  getPlaylistVideos(@Param() params: PlaylistIdParams, @User() user: AuthUser) {
    const executor = { id: user.id };

    return this.queryBus.execute(
      new GetPlaylistVideosQuery({
        ...params,
        executor,
      }),
    );
  }

  @Post("/:playlistId/videos")
  @UseGuards(AuthGuard)
  async addPlaylistVideo(
    @Body() body: AddVideoBody,
    @Param() params: PlaylistIdParams,
    @User() user: AuthUser,
  ) {
    const executor = { id: user.id };

    return {
      playlistVideoId: await this.commandBus.execute(
        new AddPlaylistVideoCommand({
          ...params,
          ...body,
          executor,
        }),
      ),
    };
  }

  @Delete("/:playlistId/videos/:playlistVideoId")
  @UseGuards(AuthGuard)
  removePlaylistVideo(@Param() params: RemoveVideoParams, @User() user: AuthUser) {
    const executor = { id: user.id };

    return this.commandBus.execute(
      new RemovePlaylistVideoCommand({
        ...params,
        executor,
      }),
    );
  }
}
