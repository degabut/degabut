import { Member } from "@queue/entities";
import { Exclude, Expose, plainToInstance } from "class-transformer";

@Exclude()
export class MemberDto {
  @Expose()
  public id!: string;

  @Expose()
  public displayName!: string;

  @Expose()
  public nickname!: string;

  @Expose()
  public username!: string;

  @Expose()
  public discriminator!: string;

  @Expose()
  public avatar!: string;

  public static create(entity: Member): MemberDto {
    return plainToInstance(MemberDto, entity);
  }
}
