import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from '@app/shared/models/job';
import { ClientProxy } from '@nestjs/microservices';
import { JobServiceEvents } from '@app/shared/enums/events';
import { SharedService } from '@app/shared';

@Injectable()
export class UnsplashServiceService {
  private readonly logger = new Logger(UnsplashServiceService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly sharedService: SharedService,
    @Inject('JOB_SERVICE') private jobService: ClientProxy,
  ) {}

  async updateJobWithImage(job: Job): Promise<any> {
    this.logger.log(`Enriching job of id - ${job.id} with image from Unsplash`);
    try {
      const imageData = await this.retrieveImage(job.category);
      const { id, slug, urls } = imageData;

      const updatedJob: Job = {
        ...job,
        data: { id, slug, urls },
      };

      this.logger.log(
        `Successfully enriched job of id - ${job.id} with image data`,
      );
      this.jobService.emit(JobServiceEvents.UpdateJob, updatedJob);
      this.logger.log(
        `Emitted ${JobServiceEvents.UpdateJob} event for job of id - ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update job ${job.id} with image: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async retrieveImage(category: string) {
    const clientId = this.configService.get<string>('UNSPLASH_CLIENT_KEY');

    const url = `https://api.unsplash.com/photos/random/?client_id=${clientId}&query=${category}`;
    this.logger.log(`Retrieving image for category: ${category}`);

    const res = await this.sharedService.makeApiRequest('GET', url, {});
    return res.data;
  }
}
