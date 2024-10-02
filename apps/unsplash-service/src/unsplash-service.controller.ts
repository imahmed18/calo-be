import { Controller, Logger } from '@nestjs/common';
import { UnsplashServiceService } from './unsplash-service.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Job } from '@app/shared/models/job';
import { UnsplashServiceEvents } from '@app/shared/enums/events';

@Controller()
export class UnsplashServiceController {
  private readonly logger = new Logger(UnsplashServiceController.name);
  constructor(
    private readonly unsplashServiceService: UnsplashServiceService,
  ) {}

  @EventPattern(UnsplashServiceEvents.EnrichJobWIthImage)
  async updateJobWithImage(@Payload() job: Job, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    this.logger.log(`Received request to update job ${job.id} with image`);
    try {
      channel.ack(message);
      this.logger.log(`Acknowledged message for job ${job.id}`);

      this.unsplashServiceService.updateJobWithImage(job);
    } catch (error) {
      this.logger.error(
        `Failed to update job ${job.id} with image: ${error.message}`,
        error.stack,
      );
    }
  }
}
