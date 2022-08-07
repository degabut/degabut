import { GetTokenQuery } from "@auth/queries/get-token";
import { Body, Controller, Post } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";

@Controller("auth")
export class AuthController {
  constructor(private readonly queryBus: QueryBus) {}

  @Post()
  getAccessToken(@Body() body: { code: string }) {
    return this.queryBus.execute(new GetTokenQuery({ code: body.code }));
  }
}
