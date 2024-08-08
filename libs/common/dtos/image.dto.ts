import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance } from "class-transformer";

@Exclude()
export class ImageDto {
  @Expose()
  @ApiProperty()
  url!: string;

  @Expose()
  @ApiProperty()
  width!: number;

  @Expose()
  @ApiProperty()
  height!: number;

  public static create(entity: ImageDto): ImageDto {
    return plainToInstance(ImageDto, entity);
  }
}
