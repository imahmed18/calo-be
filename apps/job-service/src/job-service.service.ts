import { CreateJobDto } from '@app/shared/dtos/jobs/create-job.dto';
import { UnsplashServiceEvents } from '@app/shared/enums/events';
import { JobStatus } from '@app/shared/enums/JobStatus';
import { Job } from '@app/shared/models/job';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { HttpStatusCode } from 'axios';
import { randomUUID } from 'crypto';

@Injectable()
export class JobServiceService {
  private jobs: { [jobId: string]: Job } = {};
  private readonly logger = new Logger(JobServiceService.name);
  constructor(
    @Inject('UNSPLASH_SERVICE') private unsplashService: ClientProxy,
  ) {}

  async createJob(jobData: CreateJobDto) {
    try {
      const jobId = randomUUID();

      const job: Job = {
        id: jobId,
        name: jobData.name,
        category: jobData.category,
        status: JobStatus.IN_PROGRESS,
        data: null,
      };

      this.jobs[jobId] = job;
      this.logger.log(`Created job with ID ${jobId}`);

      this.delayUnsplashCall(job);
      this.logger.log(
        `Sent job ID ${jobId} to Unsplash service for image retrieval`,
      );
      return job;
    } catch (error) {
      this.logger.error(`Failed to create new job`, error);
      throw new RpcException({
        status: HttpStatusCode.InternalServerError,
        message: error.message,
      });
    }
  }

  getAllJobs() {
    try {
      this.logger.log('Retrieving all jobs');
      return Object.values(this.jobs);
    } catch (error) {
      this.logger.error('Failed to retrieve all jobs', error);
      throw new RpcException({
        status: HttpStatusCode.InternalServerError,
        error: 'Internal server error',
      });
    }
  }

  getJobById(jobId: string) {
    this.logger.log(`Retrieveing job of id - ${jobId}`);
    if (!this.jobs[jobId]) {
      this.logger.error(`No job of id - ${jobId} found`);
      throw new RpcException({
        status: HttpStatusCode.NotFound,
        message: `Job with ID ${jobId} not found`,
      });
    }
    return this.jobs[jobId];
  }

  private delayUnsplashCall(job: Job) {
    // Generate a random delay between 5 seconds and 5 minutes (in milliseconds)
    const minDelay = 5 * 1000; // 5 seconds in ms
    const maxDelay = 5 * 60 * 1000; // 5 minutes in ms
    const randomDelay =
      Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    this.logger.log(
      `Scheduled to send job ID ${job.id} to Unsplash after ${randomDelay / 1000} seconds`,
    );

    setTimeout(() => {
      this.sendJobToUnsplash(job);
    }, randomDelay);
  }

  private sendJobToUnsplash(job: Job) {
    this.unsplashService.emit(UnsplashServiceEvents.EnrichJobWIthImage, job);
    this.logger.log(
      `Emitted ${UnsplashServiceEvents.EnrichJobWIthImage} event to Unsplash service for job ID ${job.id}`,
    );
  }

  updateJobWithImage(updatedJob: Job) {
    if (!this.jobs[updatedJob.id]) {
      this.logger.warn(
        `Attempted to update non-existing job ID ${updatedJob.id}`,
      );
    }
    this.jobs[updatedJob.id] = { ...updatedJob, status: JobStatus.COMPLETED };
    this.logger.log(`Updated job ID ${updatedJob.id} with new image data`);
  }
}
