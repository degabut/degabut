import { AuthUser, User } from "@auth/decorators";
import { AuthGuard } from "@auth/guards";
import { ValidateParams } from "@common/decorators";
import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { QueueRepository } from "@queue/repositories";
import * as Joi from "joi";

import { MessagingRepository } from "../repositories";

type SubscribeBody = {
  token: string;
  voiceChannelId: string;
};

@Controller("messaging")
export class MessagingController {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly messagingRepository: MessagingRepository,
  ) {}

  @Post("/subscribe")
  @UseGuards(AuthGuard)
  @ValidateParams(
    null,
    Joi.object({
      token: Joi.string().required(),
      voiceChannelId: Joi.string().required(),
    }).required(),
  )
  subscribe(@User() executor: AuthUser, @Body() body: SubscribeBody) {
    const queue = this.queueRepository.getByVoiceChannelId(body.voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");

    const member = queue.getMember(executor.id, true);
    if (!member) return new UnauthorizedException();

    this.messagingRepository.addToGroup(executor.id, body.token, body.voiceChannelId);
  }

  @Post("/unsubscribe")
  @UseGuards(AuthGuard)
  @ValidateParams(
    null,
    Joi.object({
      token: Joi.string().required(),
      voiceChannelId: Joi.string().required(),
    }).required(),
  )
  unsubscribe(@User() executor: AuthUser, @Body() body: SubscribeBody) {
    const queue = this.queueRepository.getByVoiceChannelId(body.voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");

    this.messagingRepository.removeFromGroup(executor.id, body.token, body.voiceChannelId);
  }
}
