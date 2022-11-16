import { GetTokenCommand } from "@auth/commands/get-token";
import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

@Controller("auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  getAccessToken(@Body() body: { code: string; redirectUri: string }) {
    return this.commandBus.execute(new GetTokenCommand(body));
  }
}
