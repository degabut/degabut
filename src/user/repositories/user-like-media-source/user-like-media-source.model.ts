import { MediaSourceModel } from "@media-source/repositories";
import { Model, RelationMappingsThunk, snakeCaseMappers } from "objection";

export type UserLikeMediaSourceProps = {
  userId: string;
  mediaSourceId: string;
  likedAt: Date;
};

export class UserLikeMediaSourceModel extends Model implements UserLikeMediaSourceProps {
  userId!: string;
  mediaSourceId!: string;
  likedAt!: Date;

  mediaSource?: MediaSourceModel;

  static tableName = "user_like_media_source";
  static idColumn = ["user_id", "media_source_id"];
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static relationMappings: RelationMappingsThunk = () => ({
    mediaSource: {
      relation: Model.BelongsToOneRelation,
      modelClass: MediaSourceModel,
      join: {
        from: "user_like_media_source.media_source_id",
        to: "media_source.id",
      },
    },
  });
}
