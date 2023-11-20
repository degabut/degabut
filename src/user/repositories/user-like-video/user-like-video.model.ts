import { VideoModel } from "@youtube/repositories";
import { Model, RelationMappingsThunk, snakeCaseMappers } from "objection";

export type UserLikeVideoModelProps = {
  userId: string;
  videoId: string;
  likedAt: Date;
};

export class UserLikeVideoModel extends Model implements UserLikeVideoModelProps {
  userId!: string;
  videoId!: string;
  likedAt!: Date;

  video?: VideoModel;

  static tableName = "user_like_video";
  static get columnNameMappers() {
    return snakeCaseMappers();
  }
  static relationMappings: RelationMappingsThunk = () => ({
    video: {
      relation: Model.BelongsToOneRelation,
      modelClass: VideoModel,
      join: {
        from: "user_like_video.video_id",
        to: "video.id",
      },
    },
  });
}
