import { CreateJobDto } from '@app/shared/dtos/jobs/create-job.dto';
import { UnsplashServiceEvents } from '@app/shared/enums/events';
import { JobStatus } from '@app/shared/enums/JobStatus';
import { Job } from '@app/shared/models/job';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

@Injectable()
export class JobServiceService {
  private jobs: { [jobId: string]: Job } = {};
  private readonly logger = new Logger(JobServiceService.name);
  constructor(
    @Inject('UNSPLASH_SERVICE') private unsplashService: ClientProxy,
  ) {}

  async createJob(jobData: CreateJobDto) {
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
    //call unsplash service and handle api errors
    this.sendJobToUnsplash(job);
    this.logger.log(
      `Sent job ID ${jobId} to Unsplash service for image retrieval`,
    );
    return job;
  }

  getAllJobs() {
    this.logger.log('Retrieving all jobs');
    return Object.values(this.jobs);
  }

  getJobById(jobId: string) {
    this.logger.log(`Retrieveing job of id - ${jobId}`);
    if (!this.jobs[jobId]) {
      this.logger.error(`No job of id - ${jobId} found`);
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }
    return this.jobs[jobId];
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
