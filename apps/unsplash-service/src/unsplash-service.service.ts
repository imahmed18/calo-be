import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Job } from '@app/shared/models/job';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UnsplashServiceService {
  private readonly logger = new Logger(UnsplashServiceService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject('JOB_SERVICE') private jobService: ClientProxy,
  ) {}

  async updateJobWithImage(job: Job): Promise<any> {
    this.logger.log(`Updating job ${job.id} with image from Unsplash`);
    try {
      const imageData = await this.retrieveImage(job.category);
      const { id, slug, urls } = imageData;

      const updatedJob: Job = {
        ...job,
        data: { id, slug, urls },
      };

      this.logger.log(`Successfully updated job ${job.id} with image data`);
      this.jobService.emit('job-updated', updatedJob);
      this.logger.log(`Emitted 'job-updated' event for job ${job.id}`);
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

    try {
      const response = this.httpService.get(url);
      const result = await lastValueFrom(response);
      this.logger.log(`Image retrieved successfully for category: ${category}`);
      return result.data;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve image for category ${category}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to retrieve image: ${error.message}`);
    }
  }
}
