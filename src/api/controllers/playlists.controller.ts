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

@Controller("playlists")
export class PlaylistsController {
  constructor(private readonly queryBus: QueryBus, private readonly commandBus: CommandBus) {}

  @Get("/:playlistId")
  @UseGuards(AuthGuard)
  getPlaylist(@Param() params: any, @User() user: AuthUser) {
    const executor = { id: user.id };

    return this.queryBus.execute(
      new GetPlaylistQuery({
        playlistId: params.playlistId,
        executor,
      }),
    );
  }

  @Post("/")
  @UseGuards(AuthGuard)
  async createPlaylist(@Body() body: any = {}, @User() user: AuthUser) {
    const executor = { id: user.id };

    return {
      playlistId: await this.commandBus.execute(
        new CreatePlaylistCommand({
          name: body.name,
          executor,
        }),
      ),
    };
  }

  @Delete("/:playlistId")
  @UseGuards(AuthGuard)
  async deletePlaylist(@Param() params: any, @User() user: AuthUser) {
    const executor = { id: user.id };

    return await this.commandBus.execute(
      new DeletePlaylistCommand({
        playlistId: params.playlistId,
        executor,
      }),
    );
  }

  @Patch("/:playlistId")
  @UseGuards(AuthGuard)
  async updatePlaylist(@Body() body: any = {}, @Param() params: any, @User() user: AuthUser) {
    const executor = { id: user.id };

    return {
      playlistId: await this.commandBus.execute(
        new UpdatePlaylistCommand({
          playlistId: params.playlistId,
          name: body.name,
          executor,
        }),
      ),
    };
  }

  @Get("/:playlistId/videos")
  @UseGuards(AuthGuard)
  getPlaylistVideos(@Param() params: any, @User() user: AuthUser) {
    const executor = { id: user.id };

    return this.queryBus.execute(
      new GetPlaylistVideosQuery({
        playlistId: params.playlistId,
        executor,
      }),
    );
  }

  @Post("/:playlistId/videos")
  @UseGuards(AuthGuard)
  async addPlaylistVideo(@Body() body: any = {}, @Param() params: any, @User() user: AuthUser) {
    const executor = { id: user.id };

    return {
      playlistVideoId: await this.commandBus.execute(
        new AddPlaylistVideoCommand({
          playlistId: params.playlistId,
          videoId: body.videoId,
          executor,
        }),
      ),
    };
  }

  @Delete("/:playlistId/videos/:videoId")
  @UseGuards(AuthGuard)
  removePlaylistVideo(@Param() params: any, @User() user: AuthUser) {
    const executor = { id: user.id };

    return this.commandBus.execute(
      new RemovePlaylistVideoCommand({
        playlistId: params.playlistId,
        playlistVideoId: params.videoId,
        executor,
      }),
    );
  }
}
