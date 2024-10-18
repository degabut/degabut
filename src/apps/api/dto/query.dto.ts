import { PAGINATION_DEFAULT_LIMIT } from "@common/schemas";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class PaginationQueryDto {
  @ApiPropertyOptional({
    default: PAGINATION_DEFAULT_LIMIT,
    minimum: 1,
    maximum: PAGINATION_DEFAULT_LIMIT,
  })
  limit?: number;

  @ApiPropertyOptional({ default: 1 })
  page?: number;
}
