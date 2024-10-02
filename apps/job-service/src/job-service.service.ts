import { CreateJobDto } from '@app/shared/dtos/jobs/create-job.dto';
import { JobStatus } from '@app/shared/enums/JobStatus';
import { Job } from '@app/shared/models/job';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class JobServiceService {
  private jobs: Job[] = [];

  async createJob(jobData: CreateJobDto) {
    const jobId = randomUUID();

    const job: Job = {
      id: jobId,
      name: jobData.name,
      category: jobData.category,
      status: JobStatus.IN_PROGRESS,
      data: null,
    };

    this.jobs.push(job);
    return job;
  }

  getAllJobs() {
    return this.jobs;
  }
}
