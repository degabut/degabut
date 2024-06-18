import { Exclude, Expose, plainToInstance } from "class-transformer";

@Exclude()
export class ImageDto {
  @Expose()
  url!: string;

  @Expose()
  width!: number;

  @Expose()
  height!: number;

  public static create(entity: ImageDto): ImageDto {
    return plainToInstance(ImageDto, entity);
  }
}
