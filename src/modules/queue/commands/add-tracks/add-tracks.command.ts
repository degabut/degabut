import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type AddTracksResult = string[];

export class AddTracksCommand extends Command<AddTracksResult> implements IWithExecutor {
  public readonly youtubeKeyword?: string;
  public readonly mediaSourceId?: string;
  public readonly mediaSourceIds?: string[];
  public readonly playlistId?: string;
  public readonly youtubePlaylistId?: string;
  public readonly spotifyPlaylistId?: string;
  public readonly spotifyAlbumId?: string;
  public readonly lastLikedCount?: number;
  public readonly allowDuplicates?: boolean;
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: AddTracksCommand) {
    super();
    Object.assign(this, params);
  }
}

export const AddTracksParamSchema = Joi.object<AddTracksCommand>({
  youtubeKeyword: Joi.string(),
  mediaSourceId: Joi.string(),
  mediaSourceIds: Joi.array().items(Joi.string()).min(1).max(100),
  playlistId: Joi.string(),
  youtubePlaylistId: Joi.string(),
  spotifyPlaylistId: Joi.string(),
  spotifyAlbumId: Joi.string(),
  lastLikedCount: Joi.number().min(1),
  allowDuplicates: Joi.boolean().default(false),
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
})
  .required()
  .xor(
    "youtubeKeyword",
    "mediaSourceId",
    "mediaSourceIds",
    "playlistId",
    "youtubePlaylistId",
    "spotifyPlaylistId",
    "spotifyAlbumId",
    "lastLikedCount",
  );
