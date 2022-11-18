import { GetTokenCommand } from "@auth/commands";
import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

type GetAccessTokenBody = {
  code: string;
  redirectUri: string;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  getAccessToken(@Body() body: GetAccessTokenBody) {
    return this.commandBus.execute(new GetTokenCommand(body));
  }
}
