import { Controller } from '@nestjs/common';
import { UnsplashServiceService } from './unsplash-service.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class UnsplashServiceController {
  constructor(
    private readonly unsplashServiceService: UnsplashServiceService,
  ) {}

  @MessagePattern({ cmd: 'retrieve-image' })
  async createJob(@Ctx() context: RmqContext, @Payload() payload: any) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
    return { image: 'Image' };
  }
}
