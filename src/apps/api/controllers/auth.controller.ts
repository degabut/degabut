import { GetTokenCommand, RefreshDiscordTokenCommand } from "@auth/commands";
import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

type GetAccessTokenBody = {
  code: string;
  redirectUri: string;
};

type RefreshDiscordTokenBody = {
  refreshToken: string;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  getAccessToken(@Body() body: GetAccessTokenBody) {
    return this.commandBus.execute(new GetTokenCommand(body));
  }

  @Post("/discord")
  refreshDiscordToken(@Body() body: RefreshDiscordTokenBody) {
    return this.commandBus.execute(new RefreshDiscordTokenCommand(body));
  }
}
