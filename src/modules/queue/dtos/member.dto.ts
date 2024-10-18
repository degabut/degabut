import { ApiProperty } from "@nestjs/swagger";
import { Member } from "@queue/entities";
import { Exclude, Expose, plainToInstance } from "class-transformer";

@Exclude()
export class MemberDto {
  @Expose()
  @ApiProperty()
  public id!: string;

  @Expose()
  @ApiProperty()
  public displayName!: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  public nickname!: string | null;

  @Expose()
  @ApiProperty()
  public username!: string;

  @Expose()
  @ApiProperty()
  public discriminator!: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  public avatar!: string | null;

  @Expose()
  @ApiProperty()
  public isInVoiceChannel!: boolean;

  public static create(entity: Member): MemberDto {
    return plainToInstance(MemberDto, entity);
  }
}
