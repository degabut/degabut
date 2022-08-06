import { Query } from "@common/cqrs";
import { VideoDto } from "@youtube/dtos";
import * as Joi from "joi";

export type GetVideoResult = VideoDto | null;

export class GetVideoQuery extends Query<GetVideoResult> {
  id!: string;

  constructor(params: GetVideoQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetVideoParamSchema = Joi.object<GetVideoQuery>({
  id: Joi.number().required(),
}).required();
