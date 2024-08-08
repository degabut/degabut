import { GetTokenCommand, GetTokenResult } from "@auth/commands";
import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiBody, ApiProperty, ApiPropertyOptional, ApiResponse } from "@nestjs/swagger";

class GetAccessTokenBodyDto {
  @ApiProperty()
  code!: string;

  @ApiPropertyOptional()
  redirectUri?: string;
}

class GetAccessTokenResponseDto implements GetTokenResult {
  @ApiProperty()
  discordAccessToken!: string;

  @ApiProperty()
  token!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiBody({ type: GetAccessTokenBodyDto })
  @ApiResponse({ type: GetAccessTokenResponseDto, status: "2XX" })
  getAccessToken(@Body() body: GetAccessTokenBodyDto) {
    return this.commandBus.execute(new GetTokenCommand(body));
  }
}
