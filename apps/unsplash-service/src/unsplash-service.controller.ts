import { Controller, Logger } from '@nestjs/common';
import { UnsplashServiceService } from './unsplash-service.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Job } from '@app/shared/models/job';
import { UnsplashServiceEvents } from '@app/shared/enums/events';
import { acknowledgeMessage } from '@app/shared/utils';

@Controller()
export class UnsplashServiceController {
  private readonly logger = new Logger(UnsplashServiceController.name);
  constructor(
    private readonly unsplashServiceService: UnsplashServiceService,
  ) {}

  @EventPattern(UnsplashServiceEvents.EnrichJobWIthImage)
  async updateJobWithImage(@Payload() job: Job, @Ctx() context: RmqContext) {
    try {
      acknowledgeMessage(context);
      this.logger.log(
        `${UnsplashServiceEvents.EnrichJobWIthImage} event received: enriching job of id - ${job.id} with image`,
      );
      this.unsplashServiceService.updateJobWithImage(job);
    } catch (error) {
      this.logger.error(
        `Failed to update job ${job.id} with image: ${error.message}`,
        error.stack,
      );
    }
  }
}
